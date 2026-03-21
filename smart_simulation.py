import firebase_admin
from firebase_admin import credentials, db
import time
import random
import requests  

# ---------------- إعدادات التليجرام  ----------------
BOT_TOKEN = "8283956963:AAEDzViU0wmbf5puI5ITIhoiyB9AppAqNCo"
CHAT_ID = "5643789391"  # رقمك اللي انت لسه باعه

def send_telegram_alert(message):
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage?chat_id={CHAT_ID}&text={message}"
        requests.get(url)
        print("📨 Notification Sent to Phone via Telegram!")
    except Exception as e:
        print(f"❌ Error sending telegram: {e}")

# ---------------- إعدادات الفايربيز ----------------
# تأكد إن ملف المفتاح (serviceAccountKey.json) موجود جنب الكود
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    if not firebase_admin._apps:  # عشان لو الكود شغال ميعملش مشاكل في إعادة التشغيل
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://aquasmart-system-default-rtdb.firebaseio.com' 
        })
    ref = db.reference('/')
except Exception as e:
    print(f"⚠️ Firebase Error: {e}")
    print("Make sure 'serviceAccountKey.json' is in the same folder!")
    exit()

print("🎬 AquaSmart AI Simulation Started with Mobile Alerts...")
print("------------------------------------------------------")

def simulate_scenario():
    # المشهد الأول: حالة الاستقرار (Safe Mode)
    print("\n🟢 Phase 1: Normal Condition (Safe)")
    for i in range(3): 
        data = {
            "Sensors": {
                "Temperature": round(random.uniform(24.0, 26.0), 1),
                "PH": round(random.uniform(7.0, 7.5), 1),
                "Ammonia": 0.0,
                "DO": round(random.uniform(7.0, 8.0), 1)
            },
            "AI_Result": {"Status": "Safe ✅", "Reason": "Optimal Conditions"}
        }
        ref.update(data)
        time.sleep(2)

    # المشهد الثاني: الكارثة + إنذار الموبايل 🚨
    print("\n🔴 Phase 2: AMMONIA LEAK DETECTED! (Sending Alert...)")
    ammonia_levels = [0.2, 0.6, 1.5, 2.0] # قيم بتعلى
    
    alert_sent = False 

    for val in ammonia_levels:
        status_msg = "Critical Ammonia Level Detected!"
        data = {
            "Sensors": {
                "Temperature": 25.5,
                "PH": 8.0, 
                "Ammonia": val, 
                "DO": 4.5
            },
            "AI_Result": {"Status": "DANGER 🚨", "Reason": status_msg}
        }
        ref.update(data)
        print(f"⚠️ ALERT: Ammonia is {val} mg/L!")
        
        # الشرط: لو الأمونيا عدت 0.5، ابعت رسالة
        if val > 0.5 and not alert_sent:
            msg = f"🚨 AquaSmart Alert!\nCritical Condition Detected in Pond 1.\nAmmonia Level: {val} mg/L\nPlease Take Action Immediately!"
            send_telegram_alert(msg)
            alert_sent = True # عشان يبعت مرة واحدة بس في المشهد ده
            
        time.sleep(2)

    # المشهد الثالث: التعافي (Recovery)
    print("\n🔵 Phase 3: Actuators ON -> System Recovering...")
    recovery_levels = [1.0, 0.4, 0.0]
    for val in recovery_levels:
        data = {
             "Sensors": {"Temperature": 25.0, "PH": 7.4, "Ammonia": val, "DO": 7.0},
             "AI_Result": {"Status": "Stabilizing 🔄", "Reason": "Treatment Active"}
        }
        ref.update(data)
        time.sleep(2)
        
    print("\n✅ Scenario Complete. Fish are safe!\n")

# تشغيل لا نهائي
while True:
    simulate_scenario()
    print("Waiting 5 seconds before repeating scenario...")
    time.sleep(5)