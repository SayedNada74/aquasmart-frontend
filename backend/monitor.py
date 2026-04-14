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

def send_expo_push_notification(title_ar, body_ar, title_en, body_en):
    """Fetch all user push tokens from Firebase and broadcast an Expo Push Notification based on their saved language."""
    try:
        # 1. Get all users
        users_ref = db.reference('/users')
        users_data = users_ref.get()
        if not users_data: return

        # 2. Extract tokens safely and group by locale
        messages = []
        for uid, user_info in users_data.items():
            if not isinstance(user_info, dict):
                continue
            
            token = user_info.get("expoPushToken")
            lang = user_info.get("language", "ar") # Default to arabic
            
            if token and isinstance(token, str) and token.startswith("ExponentPushToken"):
                title = title_en if lang == "en" else title_ar
                body = body_en if lang == "en" else body_ar
                
                messages.append({
                    "to": token,
                    "sound": "default",
                    "title": title,
                    "body": body,
                    "channelId": "aquasmart-alerts"
                })

        if not messages: return

        # 3. Send to Expo Server
        expo_url = "https://exp.host/--/api/v2/push/send"
        requests.post(expo_url, json=messages, headers={"Content-Type": "application/json"}, timeout=10)
        print(f"📩 Broadcasted translated push notifications to {len(messages)} devices.")
    except Exception as e:
        print("Push Notification Error:", e)

last_processed_readings = {pid: None for pid in PONDS}
# Track the last known state to prevent spam if a pond remains in Danger
# Alerts will only fire when transitioning from Safe -> Danger
last_known_state = {pid: "Safe" for pid in PONDS}

def process_pond_data(pond_id, data):
    """Callback for Firebase listener or manual poll"""
    global last_processed_readings, last_known_state
    
    current_readings = data.get("current")
    if not current_readings: return
    
    # We compare the actual sensor readings (excluding timestamp) to detect real changes
    # This avoids infinite loops from our own AI writes, and works even if the frontend doesn't update 'timestamp'.
    readings_to_check = {k: v for k, v in current_readings.items() if k != "timestamp"}
    if readings_to_check == last_processed_readings[pond_id]: return
    last_processed_readings[pond_id] = readings_to_check
    
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
    status = ai_result.get("Status", "Safe ✅")
    current_state = "Danger" if is_critical else "Safe"
    
    # Determine alert type for alerts_history
    alert_type = None
    if is_critical and last_known_state[pond_id] != "Danger":
        alert_type = "danger"
    elif "Warning" in status and last_known_state[pond_id] != "Warning":
        alert_type = "warning"
    
    # Write to alerts_history in Firebase (this is where the website and app read from)
    if alert_type:
        alert_id = f"{pond_id}_{int(time.time() * 1000)}"
        alert_entry = {
            "type": alert_type,
            "pondId": pond_id,
            "desc_ar": ai_result.get("Reason", ""),
            "desc_en": ai_result.get("Reason_EN", ""),
            "rec_ar": ai_result.get("Recommendation", ""),
            "rec_en": ai_result.get("Recommendation_EN", ""),
            "timestamp": int(time.time() * 1000),
            "read": False,
            "sensors": current_readings
        }
        try:
            db_ref.child("alerts_history").child(alert_id).set(alert_entry)
            print(f"📋 Alert written to alerts_history: {alert_id}")
        except Exception as e:
            print(f"❌ Failed to write alert_history: {e}")
    
    if is_critical and last_known_state[pond_id] != "Danger":
        msg = f"❗ تنبيه حرج: {pond_id}\n\nالتحليل والسبب:\n{ai_result['Reason']}\n\n{ai_result.get('Recommendation', 'الإجراء المقترح: متابعة دورية.')}"
        send_alert(msg)
        
        # Dual Language Push logic
        title_ar = "🔴 AquaSmart: تحذير خطر!"
        title_en = "🔴 AquaSmart: Critical Alert!"
        body_ar = f"خطر شديد في {pond_id}! {ai_result['Reason']}"
        body_en = f"High Danger in {pond_id}! {ai_result.get('Reason_EN', '')}"
        
        send_expo_push_notification(title_ar, body_ar, title_en, body_en)
        print(f"🚨 Alert sent for {pond_id}!")
    elif not is_critical and last_known_state[pond_id] == "Danger":
        msg = f"✅ RECOVERY: {pond_id} has stabilized and is now Safe."
        send_alert(msg)
        print(f"🌿 Recovery alert sent for {pond_id}!")
        
    last_known_state[pond_id] = current_state
    last_processed_timestamp[pond_id] = ts

def stream_handler(event):
    """Triggered instantly (0ms delay) when any data changes in /ponds"""
    try:
        # We fetch the latest ponds to ensure we map correctly
        ponds_data = db_ref.child("ponds").get()
        if ponds_data:
            for pid in PONDS:
                if pid in ponds_data:
                    process_pond_data(pid, ponds_data[pid])
    except Exception as e:
        print(f"Error in stream_handler: {e}")

def monitor_loop():
    print("🚀 AquaSmart AI Monitor Root Loop Started...")
    
    # Optionally start the simulator in a separate thread globally
    if os.getenv("RUN_SIMULATOR", "false").lower() == "true":
        from simulator_run import run_simulator
        print("🤖 Starting IoT Simulator Thread...")
        threading.Thread(target=run_simulator, daemon=True).start()
    
    # Wait for firebase and AI init
    while not db_ref or not evaluator:
        print("⏳ System not ready (Firebase/AI). Retrying init...")
        time.sleep(5)

    print("🎧 Hooking Firebase RTDB Listener for INSTANT alerts...")
    try:
        db_ref.child("ponds").listen(stream_handler)
    except Exception as e:
        print(f"Listener error: {e}")
        
    # Keep the main thread alive since listen() runs in background
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    monitor_loop()
