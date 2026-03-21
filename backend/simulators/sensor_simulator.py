import random

class SensorSimulator:
    def __init__(self, pond_ids):
        self.pond_ids = pond_ids
        # Initial safe values for all ponds
        self.state = {
            pid: {
                "Temperature": random.uniform(24.5, 26.5),
                "PH": random.uniform(7.0, 7.8),
                "DO": random.uniform(6.5, 8.0),
                "Ammonia": random.uniform(0.0, 0.2)
            } for pid in pond_ids
        }
        
    def get_readings(self):
        readings = {}
        for pid in self.pond_ids:
            # Apply random walk drift to make values look natural
            self.state[pid]["Temperature"] += random.uniform(-0.15, 0.15)
            self.state[pid]["PH"] += random.uniform(-0.05, 0.05)
            self.state[pid]["DO"] += random.uniform(-0.1, 0.1)
            self.state[pid]["Ammonia"] += random.uniform(-0.02, 0.02)
            
            # Clamp values to realistic biological bounds
            self.state[pid]["Temperature"] = max(20.0, min(35.0, self.state[pid]["Temperature"]))
            self.state[pid]["PH"] = max(5.0, min(9.0, self.state[pid]["PH"]))
            self.state[pid]["DO"] = max(2.0, min(10.0, self.state[pid]["DO"]))
            self.state[pid]["Ammonia"] = max(0.0, min(3.0, self.state[pid]["Ammonia"]))
            
            # Artificial anomaly for Pond 2 (small chance to jump Ammonia/drop DO) to test alerts
            if pid == "pond_2" and random.random() < 0.05:
                self.state[pid]["Ammonia"] += random.uniform(0.3, 0.8)
                self.state[pid]["DO"] -= random.uniform(0.5, 1.2)

            # Return cleanly rounded values suitable for JSON
            readings[pid] = {
                "Temperature": round(self.state[pid]["Temperature"], 1),
                "PH": round(self.state[pid]["PH"], 1),
                "DO": round(self.state[pid]["DO"], 1),
                "Ammonia": round(self.state[pid]["Ammonia"], 2)
            }
            
        return readings
