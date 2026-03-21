import os
import time
import requests
import firebase_admin
from firebase_admin import credentials, db
from services.ai_evaluator import AIEvaluator

# --- Configuration ---
BOT_TOKEN = "8283956963:AAEDzViU0wmbf5puI5ITIhoiyB9AppAqNCo"
CHAT_ID = "5643789391"
FIREBASE_URL = "https://aquasmart-system-default-rtdb.firebaseio.com"
PONDS = ["pond_1", "pond_2", "pond_3"]
POND_DISPLAY = { "pond_1": "Pond 1", "pond_2": "Pond 2", "pond_3": "Pond 3" }

# --- Telegram Alert Logic ---
alert_sent_critical = {pid: False for pid in PONDS}

def send_telegram_alert(pond_id, message, is_critical=False):
    global alert_sent_critical
    if not BOT_TOKEN or not CHAT_ID:
        return
        
    if is_critical and alert_sent_critical[pond_id]:
        return
        
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": CHAT_ID, "text": message}, timeout=5)
        print(f"📨 Telegram notification sent for {POND_DISPLAY[pond_id]}!")
        if is_critical:
            alert_sent_critical[pond_id] = True
    except Exception as e:
        print("Telegram Error:", e)

# --- Firebase Initialization ---
import json

try:
    if "FIREBASE_SERVICE_ACCOUNT" in os.environ:
        cred_dict = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
        cred = credentials.Certificate(cred_dict)
        print("✅ Using Firebase credentials from Environment Variables")
    else:
        cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
        cred = credentials.Certificate(cred_path)
        print("✅ Using Firebase credentials from local file")
        
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {'databaseURL': FIREBASE_URL})
    db_ref = db.reference('/')
    print("✅ Connected to Firebase RTDB")
except Exception as e:
    print(f"⚠️ Firebase Error: {e}")
    print("Ensure 'serviceAccountKey.json' is present locally, or 'FIREBASE_SERVICE_ACCOUNT' is set in Env Vars.")
    exit(1)

# --- Module Initialization ---
model_path = os.path.join(os.path.dirname(__file__), "services", "aquasmart_model.tflite")
evaluator = AIEvaluator(model_path)

print("🎬 AquaSmart AI - Demo Scenario Mode Started...")
print("="*60)

def push_to_firebase(pond_id, sensor_data, ai_result):
    ts_key = time.strftime("%Y-%m-%d_%H-%M-%S", time.localtime())
    ts_readable = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    
    updates = {
        f"ponds/{pond_id}/current": {
            "Temperature": sensor_data["Temperature"],
            "PH": sensor_data["PH"],
            "DO": sensor_data["DO"],
            "Ammonia": sensor_data["Ammonia"],
            "timestamp": ts_readable,
            "last_history_key": ts_key
        },
        f"ponds/{pond_id}/ai_result/current": {
            "Status": ai_result["Status"],
            "Reason": ai_result["Reason"],
            "AI_Confidence": ai_result["AI_Confidence"],
            "timestamp": ts_readable
        },
        f"ponds/{pond_id}/history/readings/{ts_key}": {
            "T": sensor_data["Temperature"],
            "pH": sensor_data["PH"],
            "DO": sensor_data["DO"],
            "NH3": sensor_data["Ammonia"],
            "time": ts_readable,
            "status": ai_result["Status"]
        }
    }
    db_ref.update(updates)

def simulate_scenario():
    # --- Phase 1: Normal Condition ---
    print("\n🟢 Phase 1: Normal Condition (Safe) for all ponds")
    for _ in range(3):
        for pid in PONDS:
            sensor_data = {
                 "Temperature": 25.0, "PH": 7.3, "Ammonia": 0.0, "DO": 7.5
            }
            ai_result = evaluator.evaluate(sensor_data)
            push_to_firebase(pid, sensor_data, ai_result)
            alert_sent_critical[pid] = False # Reset alerts
        time.sleep(3)

    # --- Phase 2: Ammonia Leak in Pond 1 ---
    print("\n🔴 Phase 2: AMMONIA LEAK DETECTED in Pond 1! (Sending Alert...)")
    ammonia_levels = [0.2, 0.6, 1.5, 2.0]
    
    for val in ammonia_levels:
        # Pond 1 experiences the leak
        sensor_data_p1 = {"Temperature": 25.5, "PH": 8.0, "Ammonia": val, "DO": 4.5}
        ai_result_p1 = evaluator.evaluate(sensor_data_p1)
        push_to_firebase("pond_1", sensor_data_p1, ai_result_p1)
        
        # Ponds 2 & 3 remain normal
        for pid in ["pond_2", "pond_3"]:
            sensor_data_normal = {"Temperature": 25.0, "PH": 7.3, "Ammonia": 0.0, "DO": 7.5}
            push_to_firebase(pid, sensor_data_normal, evaluator.evaluate(sensor_data_normal))

        print(f"⚠️ Pond 1 Ammonia is {val} mg/L! | AI: {ai_result_p1['Status']}")

        # Trigger Telegram if AI marks it critical (> 0.5 NH3 via evaluator logic)
        if ai_result_p1["Is_Critical"]:
             telegram_msg = (
                 f"🔴 **CRITICAL ALERT: Pond 1**\n"
                 f"━━━━━━━━━━━━━━━\n"
                 f"🌡️ Temp: {sensor_data_p1['Temperature']}°C\n"
                 f"🧪 pH: {sensor_data_p1['PH']}\n"
                 f"💧 DO: {sensor_data_p1['DO']} mg/L\n"
                 f"⚠️ NH3: {sensor_data_p1['Ammonia']} mg/L\n"
                 f"━━━━━━━━━━━━━━━\n"
                 f"🚫 Reason: {ai_result_p1['Reason']}\n"
                 f"⏰ Time: {time.strftime('%H:%M:%S')}"
             )
             send_telegram_alert("pond_1", telegram_msg, is_critical=True)
             
        time.sleep(3)

    # --- Phase 3: Recovery ---
    print("\n🔵 Phase 3: Actuators ON -> System Recovering...")
    recovery_levels = [1.0, 0.4, 0.0]
    for val in recovery_levels:
        sensor_data_p1 = {"Temperature": 25.0, "PH": 7.4, "Ammonia": val, "DO": 7.0}
        
        # Override AI momentarily to show "Stabilizing" as per original demo
        ai_result_p1 = evaluator.evaluate(sensor_data_p1)
        ai_result_p1["Status"] = "Safe ✅" if val == 0.0 else "Warning ⚠️"
        ai_result_p1["Reason"] = "Stabilizing 🔄 Treatment Active"
        ai_result_p1["Is_Critical"] = False
        
        push_to_firebase("pond_1", sensor_data_p1, ai_result_p1)
        
        for pid in ["pond_2", "pond_3"]:
            sensor_data_normal = {"Temperature": 25.0, "PH": 7.3, "Ammonia": 0.0, "DO": 7.5}
            push_to_firebase(pid, sensor_data_normal, evaluator.evaluate(sensor_data_normal))
            
        time.sleep(3)
        
    print("\n✅ Scenario Complete. Fish are safe!\n")

# --- Main Engine Loop ---
while True:
    try:
        simulate_scenario()
        print("Waiting 5 seconds before repeating scenario...")
        time.sleep(5)
    except Exception as e:
        print(f"Error in main loop: {e}")
        time.sleep(5)
