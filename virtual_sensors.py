import time
import requests
import random

FIREBASE_URL = "https://aquasmart-system-default-rtdb.firebaseio.com"
PONDS = ["pond_1", "pond_2", "pond_3"]
POND_DISPLAY = { "pond_1": "Pond 1", "pond_2": "Pond 2", "pond_3": "Pond 3" }

print("📡 Virtual Sensors Started...")
print("="*60)

while True:
    try:
        for pond_id in PONDS:
            temp = round(random.uniform(24.0, 31.0), 1)
            ph = round(random.uniform(6.8, 8.2), 1)
            ammonia = round(random.uniform(0.0, 0.6), 2)
            do_val = round(random.uniform(5.2, 8.8), 1)

            if pond_id == "pond_2" and random.random() < 0.2:
                ammonia = round(random.uniform(0.9, 2.8), 2)
                do_val = round(random.uniform(3.0, 5.0), 1)

            ts_key = time.strftime("%Y-%m-%d_%H-%M-%S", time.localtime())
            ts_readable = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

            requests.patch(f"{FIREBASE_URL}/ponds/{pond_id}/history/readings/{ts_key}.json",
                json={"T": temp, "pH": ph, "DO": do_val, "NH3": ammonia,
                      "time": ts_readable, "status": "Pending..."})

            requests.patch(f"{FIREBASE_URL}/ponds/{pond_id}/current.json",
                json={"Temperature": temp, "PH": ph, "Ammonia": ammonia, "DO": do_val,
                      "timestamp": ts_readable, "last_history_key": ts_key})


            print(f"Sent: {POND_DISPLAY[pond_id]} → T={temp} | pH={ph} | NH3={ammonia} | DO={do_val} @ {ts_readable}")

        time.sleep(8)

    except Exception as e:
        print(f"Error: {e}")
        time.sleep(5)