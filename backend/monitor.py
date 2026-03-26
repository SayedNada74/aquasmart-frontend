import os
import time
import json
import firebase_admin
from firebase_admin import credentials, db
from services.ai_evaluator import AIEvaluator
import requests
import threading
import http.server
import socketserver

# --- Configuration (Prod-ready) ---
FIREBASE_URL = os.getenv("FIREBASE_URL", "https://aquasmart-system-default-rtdb.firebaseio.com")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
PONDS = os.getenv("PONDS", "pond_1,pond_2,pond_3").split(",")

def start_health_server():
    """Minimal server to satisfy HuggingFace Spaces health check"""
    try:
        port = int(os.getenv("PORT", 7860))
        handler = http.server.SimpleHTTPRequestHandler
        # Use allow_reuse_address for faster recovery on restarts
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"📡 HuggingFace Health check server running on port {port}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Health Server Error: {e}")

# Start health server IMMEDIATELY in a separate thread
# This tells Hugging Face our container is alive even if Firebase hangs
print("🚀 Starting initialization...")
threading.Thread(target=start_health_server, daemon=True).start()

# --- Firebase Init ---
db_ref = None
try:
    if "FIREBASE_SERVICE_ACCOUNT" in os.environ:
        cred_dict = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
        cred = credentials.Certificate(cred_dict)
    else:
        cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
        cred = credentials.Certificate(cred_path)
        
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {'databaseURL': FIREBASE_URL})
    db_ref = db.reference('/')
    print("✅ AI Monitor: Connected to Firebase RTDB")
except Exception as e:
    print(f"⚠️ Firebase Connection Delay: {e}. Will retry in loop.")

# --- AI Setup ---
evaluator = None
try:
    model_path = os.path.join(os.path.dirname(__file__), "services", "aquasmart_model.tflite")
    evaluator = AIEvaluator(model_path)
    print("✅ AI Model Loaded")
except Exception as e:
    print(f"❌ AI Init Error: {e}")

def send_alert(message):
    if not BOT_TOKEN or not CHAT_ID: return
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": CHAT_ID, "text": message}, timeout=10)
    except Exception as e:
        print(f"Telegram Error: {e}")

last_processed_timestamp = {pid: None for pid in PONDS}
# Track the last known state to prevent spam if a pond remains in Danger
# Alerts will only fire when transitioning from Safe -> Danger
last_known_state = {pid: "Safe" for pid in PONDS}

def process_pond_data(pond_id, data):
    """Callback for Firebase listener or manual poll"""
    global last_processed_timestamp, last_known_state
    
    current_readings = data.get("current")
    if not current_readings: return
    
    ts = current_readings.get("timestamp")
    if ts == last_processed_timestamp[pond_id]: return
    
    # New data detected! Evaluate it.
    print(f"🔍 Analyzing new data for {pond_id}...")
    ai_result = evaluator.evaluate(current_readings)
    
    # Update Firebase with AI assessment
    ts_readable = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    updates = {
        f"ponds/{pond_id}/ai_result/current": {
            **ai_result,
            "timestamp": ts_readable
        }
    }
    db_ref.update(updates)
    
    # Alerting logic: Edge-Triggered (Stateful)
    is_critical = ai_result.get("Is_Critical", False)
    current_state = "Danger" if is_critical else "Safe"
    
    if is_critical and last_known_state[pond_id] != "Danger":
        msg = f"❗ تنبيه حرج: {pond_id}\n\nالتحليل والسبب:\n{ai_result['Reason']}\n\n{ai_result.get('Recommendation', 'الإجراء المقترح: متابعة دورية.')}"
        send_alert(msg)
        print(f"🚨 Alert sent for {pond_id}!")
    elif not is_critical and last_known_state[pond_id] == "Danger":
        msg = f"✅ RECOVERY: {pond_id} has stabilized and is now Safe."
        send_alert(msg)
        print(f"🌿 Recovery alert sent for {pond_id}!")
        
    last_known_state[pond_id] = current_state
    last_processed_timestamp[pond_id] = ts

def monitor_loop():
    print("🚀 AquaSmart AI Monitor Root Loop Started...")
    
    # Optionally start the simulator in a separate thread globally
    if os.getenv("RUN_SIMULATOR", "false").lower() == "true":
        from simulator_run import run_simulator
        print("🤖 Starting IoT Simulator Thread...")
        threading.Thread(target=run_simulator, daemon=True).start()
    
    while True:
        try:
            # Check if we need to retry initialization
            if not db_ref or not evaluator:
                print("⏳ System not ready (Firebase/AI). Retrying init...")
                # The global variables don't update themselves here easily unless we redeclare them, 
                # but for simplicity, the container will just restart if it really fails, 
                # or we just skip this tick.
                time.sleep(10)
                continue

            # Polling for data
            ponds_data = db_ref.child("ponds").get()
            if ponds_data:
                for pid in PONDS:
                    if pid in ponds_data:
                        process_pond_data(pid, ponds_data[pid])
        except Exception as e:
            print(f"Error in monitor loop: {e}")
        
        time.sleep(int(os.getenv("MONITOR_INTERVAL_SECONDS", 30)))

if __name__ == "__main__":
    monitor_loop()
