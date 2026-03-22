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

# --- Firebase Init ---
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
    print(f"❌ Firebase Init Error: {e}")
    exit(1)

# --- AI Setup ---
model_path = os.path.join(os.path.dirname(__file__), "services", "aquasmart_model.tflite")
evaluator = AIEvaluator(model_path)

def send_alert(message):
    if not BOT_TOKEN or not CHAT_ID: return
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": CHAT_ID, "text": message}, timeout=10)
    except Exception as e:
        print(f"Telegram Error: {e}")

last_processed_timestamp = {pid: None for pid in PONDS}
last_alert_time = {pid: 0 for pid in PONDS}
ALERT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", 900)) # 15 min default

def process_pond_data(pond_id, data):
    """Callback for Firebase listener or manual poll"""
    global last_processed_timestamp, last_alert_time
    
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
    
    # Alerting logic with Cooldown
    if ai_result.get("Is_Critical"):
        current_time = time.time()
        if current_time - last_alert_time[pond_id] > ALERT_COOLDOWN_SECONDS:
            msg = f"❗ CRITICAL: {pond_id}\nStatus: {ai_result['Status']}\nReason: {ai_result['Reason']}"
            send_alert(msg)
            last_alert_time[pond_id] = current_time
        else:
            print(f"⏳ Alert suppressed for {pond_id} (Cooldown Active)")
        
    last_processed_timestamp[pond_id] = ts

def start_health_server():
    """Minimal server to satisfy HuggingFace Spaces health check"""
    port = int(os.getenv("PORT", 7860))
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"📡 HuggingFace Health check server running on port {port}")
        httpd.serve_forever()

def monitor_loop():
    # Start health server in a separate thread
    threading.Thread(target=start_health_server, daemon=True).start()
    
    print("🚀 AquaSmart AI Monitor Running...")
    while True:
        try:
            # We poll 'ponds' root to catch all updates at once
            ponds_data = db_ref.child("ponds").get()
            if ponds_data:
                for pid in PONDS:
                    if pid in ponds_data:
                        process_pond_data(pid, ponds_data[pid])
        except Exception as e:
            print(f"Error in monitor loop: {e}")
        
        time.sleep(int(os.getenv("MONITOR_INTERVAL_SECONDS", 5)))

if __name__ == "__main__":
    monitor_loop()
