import random

class SensorSimulator:
    def __init__(self, pond_ids):
        self.pond_ids = pond_ids
        # Track current state to ensure smooth, logical transitions
        self.state = {
            pid: {
                "Temperature": random.uniform(25.0, 27.0),
                "PH": random.uniform(7.0, 7.5),
                "DO": random.uniform(6.5, 7.5),
                "Ammonia": random.uniform(0.0, 0.1),
                "active_anomalies": [], # e.g. ["DO_LOW", "NH3_HIGH"]
                "ticks_remaining": 0,    # How long this anomaly or safe period lasts
                "cooldown": 0            # Cooldown before another anomaly
            } for pid in pond_ids
        }
        
    def get_readings(self):
        readings = {}
        for pid in self.pond_ids:
            pond_state = self.state[pid]
            
            # 1. Manage Anomaly State Machine
            if pond_state["ticks_remaining"] > 0:
                pond_state["ticks_remaining"] -= 1
            else:
                # Time for a state change. Are we on cooldown?
                if pond_state["cooldown"] > 0:
                    pond_state["cooldown"] -= 1
                    pond_state["active_anomalies"] = [] # Force safe
                else:
                    # Risk Profiles (0%, 10%, 20%)
                    risk_profiles = {"pond_1": 0.0, "pond_2": 0.10, "pond_3": 0.20}
                    anomaly_chance = risk_profiles.get(pid, 0.0)
                    
                    if random.random() < anomaly_chance:
                        # Trigger an anomaly! Lasts for 3 to 6 ticks (1.5 to 3 minutes)
                        pond_state["ticks_remaining"] = random.randint(3, 6)
                        # Then needs a short cooldown of at least 4 ticks (2 minutes)
                        pond_state["cooldown"] = random.randint(4, 10)
                        
                        # Compound logical scenarios
                        scenarios = [
                            ["NH3_HIGH"],
                            ["DO_LOW"],
                            ["TEMP_HIGH", "DO_LOW"],  # Hot water holds less oxygen
                            ["NH3_HIGH", "PH_HIGH"],  # High pH makes ammonia more toxic
                            ["TEMP_LOW", "PH_LOW"]    # Cold and acidic
                        ]
                        pond_state["active_anomalies"] = random.choice(scenarios)
                    else:
                        pond_state["active_anomalies"] = [] # Stay safe
                        pond_state["ticks_remaining"] = random.randint(2, 5) # Wait before checking again

            # 2. Generate values based on current state (drifting slightly for realism)
            anoms = pond_state["active_anomalies"]
            
            # Base ranges (Safe)
            t_target = random.uniform(25.0, 29.0)
            ph_target = random.uniform(7.0, 8.0)
            do_target = random.uniform(6.0, 8.0)
            nh3_target = random.uniform(0.0, 0.2)
            
            # Apply anomaly targets
            if "NH3_HIGH" in anoms: nh3_target = random.uniform(1.0, 2.5)
            if "DO_LOW" in anoms: do_target = random.uniform(1.0, 3.8)
            if "TEMP_HIGH" in anoms: t_target = random.uniform(34.0, 38.0)
            if "TEMP_LOW" in anoms: t_target = random.uniform(18.0, 22.0)
            if "PH_HIGH" in anoms: ph_target = random.uniform(8.9, 9.5)
            if "PH_LOW" in anoms: ph_target = random.uniform(5.0, 6.0)
            
            # Smooth drift towards target (Accelerated to 0.8 so it triggers danger faster)
            pond_state["Temperature"] += (t_target - pond_state["Temperature"]) * 0.8
            pond_state["PH"] += (ph_target - pond_state["PH"]) * 0.8
            pond_state["DO"] += (do_target - pond_state["DO"]) * 0.8
            pond_state["Ammonia"] += (nh3_target - pond_state["Ammonia"]) * 0.8

            # 3. Return cleanly rounded values suitable for JSON
            readings[pid] = {
                "Temperature": round(pond_state["Temperature"], 1),
                "PH": round(pond_state["PH"], 1),
                "DO": round(pond_state["DO"], 1),
                "Ammonia": round(max(0, pond_state["Ammonia"]), 2) # Prevent negative NH3
            }
            
        return readings
