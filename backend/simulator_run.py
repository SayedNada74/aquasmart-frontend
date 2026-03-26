import os
import time
import json
import firebase_admin
from firebase_admin import credentials, db
from simulators.sensor_simulator import SensorSimulator

# --- Configuration ---
FIREBASE_URL = os.getenv("FIREBASE_URL", "https://aquasmart-system-default-rtdb.firebaseio.com")
PONDS = os.getenv("PONDS", "pond_1,pond_2,pond_3").split(",")
INTERVAL = int(os.getenv("SIMULATOR_INTERVAL_SECONDS", 30))

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
    print("✅ Simulator: Connected to Firebase")
except Exception as e:
    print(f"❌ Simulator Firebase Error: {e}")
    exit(1)

sim = SensorSimulator(PONDS)

def run_simulator():
    print(f"📡 Starting Simulation for ponds: {PONDS}...")
    while True:
        try:
            readings = sim.get_readings()
            ts_readable = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            ts_key = time.strftime("%Y-%m-%d_%H-%M-%S", time.localtime())
            
            updates = {}
            for pid, data in readings.items():
                # Update 'current'
                updates[f"ponds/{pid}/current"] = {
                    **data,
                    "timestamp": ts_readable,
                    "last_history_key": ts_key
                }
                # Add to 'history'
                updates[f"ponds/{pid}/history/readings/{ts_key}"] = {
                    "T": data["Temperature"],
                    "pH": data["PH"],
                    "DO": data["DO"],
                    "NH3": data["Ammonia"],
                    "time": ts_readable
                }
            
            db_ref.update(updates)
            print(f"📤 Pushed sensor readings at {ts_readable}")
            
        except Exception as e:
            print(f"Simulator Error: {e}")
            
        time.sleep(INTERVAL)

if __name__ == "__main__":
    run_simulator()
