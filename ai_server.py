import time
import requests
import numpy as np
import tensorflow as tf
tflite = tf.lite
import os

BOT_TOKEN = "8283956963:AAEDzViU0wmbf5puI5ITIhoiyB9AppAqNCo"
CHAT_ID = "5643789391"

FIREBASE_URL = "https://aquasmart-system-default-rtdb.firebaseio.com"
PONDS = ["pond_1", "pond_2", "pond_3"]
POND_DISPLAY = { "pond_1": "Pond 1", "pond_2": "Pond 2", "pond_3": "Pond 3" }


TEMP_MIN, TEMP_MAX = 24.0, 32.0
PH_MIN, PH_MAX = 6.5, 8.5
DO_MIN = 5.0
NH3_MAX = 0.5

alert_sent_early = {}
alert_sent_critical = {}

def send_expo_push_notification(title, body):
    """Fetch all user push tokens from Firebase and broadcast an Expo Push Notification."""
    try:
        # 1. Get all users
        resp = requests.get(f"{FIREBASE_URL}/users.json", timeout=5)
        users_data = resp.json()
        if not users_data:
            return

        # 2. Extract tokens
        tokens = []
        for uid, user_info in users_data.items():
            token = user_info.get("expoPushToken")
            if token and type(token) == str and token.startswith("ExponentPushToken"):
                tokens.append(token)

        if not tokens:
            return

        # 3. Send to Expo Server
        message_chunks = []
        for token in tokens:
            message_chunks.append({
                "to": token,
                "sound": "default",
                "title": title,
                "body": body,
                "channelId": "aquasmart-alerts" # Used for Android MAX importance
            })
        
        expo_url = "https://exp.host/--/api/v2/push/send"
        requests.post(expo_url, json=message_chunks, headers={"Content-Type": "application/json"}, timeout=10)
        print(f"📩 Broadcased push notification to {len(tokens)} devices.")
    except Exception as e:
        print("Push Notification Error:", e)

    
def send_telegram_alert(pond_id, message, is_critical=False):
    if not BOT_TOKEN or not CHAT_ID:
        return
    key = f"{pond_id}_{'critical' if is_critical else 'early'}"
    alert_dict = alert_sent_critical if is_critical else alert_sent_early
    if not alert_dict.get(key, False):
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            requests.post(url, json={"chat_id": CHAT_ID, "text": message}, timeout=5)
            alert_dict[key] = True
            if is_critical:
                alert_sent_early[f"{pond_id}_early"] = False
        except Exception as e:
            print("Telegram Error:", e)


MEAN_VALUES = np.array([24.50439158, 7.49248196, 5.20236086, 12.87806565], dtype=np.float32)
SCALE_VALUES = np.array([0.94112808, 0.58237198, 13.21520425, 13.15985581], dtype=np.float32)

try:
    interpreter = tflite.Interpreter(model_path="aquasmart_model.tflite")
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("✅ AI Model Loaded & Connected")
except Exception as e:
    print("Error loading model:", e)
    exit()

session = requests.Session()
print("🚀 AI Server Running...")


while True:
    try:
        for pond_id in PONDS:
            resp = session.get(f"{FIREBASE_URL}/ponds/{pond_id}/current.json", timeout=5)
            if not resp.json():
                print(f"[{POND_DISPLAY[pond_id]}] No current data.")
                continue
            data = resp.json()
            temp = float(data.get("Temperature", 25))
            ph = float(data.get("PH", 7.5))
            ammonia = float(data.get("Ammonia", 0))
            do = float(data.get("DO", 7))
            history_key = data.get("last_history_key")

            
            issues = []
            if not (TEMP_MIN <= temp <= TEMP_MAX):
                issues.append(f"T={temp:.1f}")
            if not (PH_MIN <= ph <= PH_MAX):
                issues.append(f"pH={ph:.1f}")
            if do < DO_MIN:
                issues.append(f"DO={do:.1f}")
            if ammonia > NH3_MAX:
                issues.append(f"NH3={ammonia:.2f}")
            critical = len(issues) > 0

            
            raw_input = np.array([temp, ph, ammonia, do], dtype=np.float32)
            normalized = (raw_input - MEAN_VALUES) / SCALE_VALUES
            input_data = np.expand_dims(normalized, axis=0)

            interpreter.set_tensor(input_details[0]['index'], input_data)
            interpreter.invoke()
            prediction = interpreter.get_tensor(output_details[0]['index'])[0][0]

            
            if critical:
                status_display = "Danger 🚨"
                reason = f"Critical: {', '.join(issues)}"
                
                # --- قالب رسالة الخطر الصريح ---
                telegram_msg = (
                    f"🔴 **CRITICAL ALERT: {POND_DISPLAY[pond_id]}**\n"
                    f"━━━━━━━━━━━━━━━\n"
                    f"🌡️ **Temp:** {temp:.1f}°C\n"
                    f"🧪 **pH:** {ph:.1f}\n"
                    f"💧 **DO:** {do:.1f} mg/L\n"
                    f"⚠️ **NH3:** {ammonia:.2f} mg/L\n"
                    f"━━━━━━━━━━━━━━━\n"
                    f"🚫 **Reason:** {reason}\n"
                    f"⏰ **Time:** {time.strftime('%H:%M:%S')}"
                )
                send_telegram_alert(pond_id, telegram_msg, True)
                
                # إرسال إشعار للموبايلات وهو مقفول
                clean_reason_for_push = reason.replace("Critical: ", "")
                push_body = f"High Danger in {POND_DISPLAY[pond_id]}! {clean_reason_for_push}"
                send_expo_push_notification("🔴 AquaSmart Alert", push_body)

            else:
                if prediction >= 0.75:
                    status_display = "Safe ✅"
                    reason = "Optimal conditions"
                    alert_sent_early[f"{pond_id}_early"] = False
                    alert_sent_critical[f"{pond_id}_critical"] = False
                elif prediction >= 0.58:
                    status_display = "Warning ⚠️"
                    reason = "Early risk detected"
                    send_telegram_alert(pond_id, f"EARLY WARNING - {POND_DISPLAY[pond_id]}", False)
                else:
                    status_display = "Danger 🚨"
                    reason = "AI predicts unsafe"
                    send_telegram_alert(pond_id, f"DANGER (AI) - {POND_DISPLAY[pond_id]}", True)

            
            print(f"[{POND_DISPLAY[pond_id]}] T={temp:.1f}°C | pH={ph:.1f} | DO={do:.1f} | NH3={ammonia:.2f}")
            print(f"→ Status: {status_display} | Reason: {reason} | AI Confidence: {prediction*100:.1f}%")
            print("-"*60)

            
            if history_key:
                session.patch(f"{FIREBASE_URL}/ponds/{pond_id}/history/readings/{history_key}.json",
                              json={"status": status_display},
                              timeout=10)
            session.patch(f"{FIREBASE_URL}/ponds/{pond_id}/ai_result/current.json",
                          json={
                              "Temperature": temp,
                              "PH": ph,
                              "Ammonia": ammonia,
                              "DO": do,
                              "Status": status_display,
                              "Reason": reason,
                              "AI_Confidence": f"{prediction*100:.1f}%",
                              "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                          }, timeout=10)
        time.sleep(2)
    except requests.exceptions.Timeout:
        print("🕒 Connection slow, retrying...") # رسالة هادية بدل الخطأ الكبير
        time.sleep(2)
        
    except Exception as e:
        print("Main Loop Error:", e)
        time.sleep(5)