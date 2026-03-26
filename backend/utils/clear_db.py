import os
import json
import firebase_admin
from firebase_admin import credentials, db

# --- Configuration ---
# You can override the FIREBASE_URL if needed
FIREBASE_URL = "https://aquasmart-system-default-rtdb.firebaseio.com"

def clear_database():
    try:
        # 1. Initialize Firebase
        cred_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
        if not os.path.exists(cred_path):
            print(f"❌ Error: Could not find serviceAccountKey.json at {cred_path}")
            return

        cred = credentials.Certificate(cred_path)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {'databaseURL': FIREBASE_URL})
        
        db_ref = db.reference('/')
        
        print("💡 Connected to Firebase. Starting cleanup...")

        # 2. Nodes to clear
        # We delete 'history' for all ponds and the global 'alerts_history'
        # We keep the 'current' values so the UI doesn't break, but they will be updated by the simulator anyway.
        
        nodes_to_delete = [
            "ponds/pond_1/history",
            "ponds/pond_2/history",
            "ponds/pond_3/history",
            "alerts_history",
        ]

        for node in nodes_to_delete:
            print(f"🗑️ Deleting {node}...")
            db_ref.child(node).delete()
            print(f"✅ {node} cleared.")

        print("\n✨ Database Cleanup Successful! Your usage limits should reset shortly.")
        print("🚀 You can now restart your simulator and monitor.")

    except Exception as e:
        print(f"❌ An error occurred during cleanup: {e}")

if __name__ == "__main__":
    clear_database()
