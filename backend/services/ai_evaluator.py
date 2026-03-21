import numpy as np

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    import tensorflow.lite as tflite

class AIEvaluator:
    def __init__(self, model_path):
        self.interpreter = tflite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
        
        # Scaling parameters from the original model training
        self.MEAN_VALUES = np.array([24.50439158, 7.49248196, 5.20236086, 12.87806565], dtype=np.float32)
        self.SCALE_VALUES = np.array([0.94112808, 0.58237198, 13.21520425, 13.15985581], dtype=np.float32)

        # Biological thresholds
        self.TEMP_MIN, self.TEMP_MAX = 24.0, 32.0
        self.PH_MIN, self.PH_MAX = 6.5, 8.5
        self.DO_MIN = 5.0
        self.NH3_MAX = 0.5

    def evaluate(self, readings):
        """
        Evaluates a single set of readings {Temperature, PH, DO, Ammonia}
        and returns a dict with status, reason, confidence, and criticality.
        """
        temp = float(readings.get("Temperature", 25))
        ph = float(readings.get("PH", 7.5))
        do = float(readings.get("DO", 7))
        ammonia = float(readings.get("Ammonia", 0))
        
        issues = []
        if not (self.TEMP_MIN <= temp <= self.TEMP_MAX):
            issues.append(f"T={temp:.1f}")
        if not (self.PH_MIN <= ph <= self.PH_MAX):
            issues.append(f"pH={ph:.1f}")
        if do < self.DO_MIN:
            issues.append(f"DO={do:.1f}")
        if ammonia > self.NH3_MAX:
            issues.append(f"NH3={ammonia:.2f}")
            
        is_critical = len(issues) > 0
        
        # Prepare input for TFLite Model (Order: Temp, pH, Ammonia, DO)
        raw_input = np.array([temp, ph, ammonia, do], dtype=np.float32)
        normalized = (raw_input - self.MEAN_VALUES) / self.SCALE_VALUES
        input_data = np.expand_dims(normalized, axis=0)
        
        # Invoke TFLite Model
        self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
        self.interpreter.invoke()
        prediction = self.interpreter.get_tensor(self.output_details[0]['index'])[0][0]
        
        confidence = float(prediction * 100)
        
        if is_critical:
            status = "Danger 🚨"
            reason = f"Critical levels: {', '.join(issues)}"
        else:
            if prediction >= 0.75:
                status = "Safe ✅"
                reason = "Optimal Conditions"
            elif prediction >= 0.58:
                status = "Warning ⚠️"
                reason = "Early risk detected"
            else:
                status = "Danger 🚨"
                reason = "AI predicts unsafe trends"
                is_critical = True # Overriding flag if AI strongly thinks so
                
        return {
            "Status": status,
            "Reason": reason,
            "AI_Confidence": f"{confidence:.1f}%",
            "Is_Critical": is_critical
        }
