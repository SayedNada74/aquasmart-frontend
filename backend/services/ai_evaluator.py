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

        # Biological thresholds (Strictly synced with user scientific table)
        self.TEMP_MIN, self.TEMP_MAX = 23.5, 33.0
        self.PH_MIN, self.PH_MAX = 6.3, 8.7
        self.DO_MIN = 4.2
        self.NH3_MAX = 0.8

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
        is_critical = False
        
        reasons_ar = []
        recs_ar = []
        reasons_en = []
        recs_en = []
        
        if ammonia > self.NH3_MAX:
            is_critical = True
            reasons_ar.append("الأمونيا تسبب تسمم فوري للدم وتضرب الخياشيم")
            recs_ar.append("تغيير جزء من المياه فوراً لوقف التسمم")
            reasons_en.append("Ammonia causes immediate blood poisoning and gill damage")
            recs_en.append("Perform immediate partial water change")
            
        if do < self.DO_MIN:
            is_critical = True
            reasons_ar.append("نقص الأكسجين يجعل السمك يختنق ويطلع على سطح المياه")
            recs_ar.append("تشغيل جميع البدالات والتهوية بأقصى طاقة فوراً")
            reasons_en.append("Low oxygen causes fish asphyxiation")
            recs_en.append("Activate all aerators at maximum capacity immediately")
            
        if temp > self.TEMP_MAX or temp < self.TEMP_MIN:
            is_critical = True
            reasons_ar.append("درجة الحرارة تُجهد السمك حرارياً وتقلل مناعته")
            recs_ar.append("تعديل مستوى المياه ومراجعة دورة التبريد أو التدفئة")
            reasons_en.append("Temperature causes severe thermal stress and drops immunity")
            recs_en.append("Adjust water levels and check climate controls")
            
        if ph > self.PH_MAX or ph < self.PH_MIN:
            is_critical = True
            reasons_ar.append("الحموضة/القلوية العالية تذيب قشور السمك وتزيد من سمية الأرقام الأخرى")
            recs_ar.append("استخدام محسنات لوزن درجة حموضة المياه فوراً")
            reasons_en.append("Harmful pH dissolves scales and increases toxicity of other params")
            recs_en.append("Apply pH buffers/conditioners immediately")

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
            reason_text = "يعاني الحوض من: " + "، و".join(reasons_ar) + "."
            rec_text = "الإجراء المقترح: " + "، و".join(recs_ar) + "."
            reason_text_en = "Pond suffers from: " + ", and ".join(reasons_en) + "."
            rec_text_en = "Action: " + ", and ".join(recs_en) + "."
        else:
            if prediction >= 0.75:
                status = "Safe ✅"
                reason_text = "جميع القراءات الحالية في المنطقة الآمنة."
                rec_text = "ظروف المياه ممتازة. استمر في المراقبة الروتينية."
                reason_text_en = "All current readings are perfectly safe."
                rec_text_en = "Conditions are excellent. Keep monitoring."
            elif prediction >= 0.58:
                status = "Warning ⚠️"
                reason_text = "مؤشرات غير مستقرة، يرجى الحذر."
                rec_text = "مراقبة الحوض عن كثب لملاحظة أي تغيرات."
                reason_text_en = "Unstable indicators, proceed with caution."
                rec_text_en = "Monitor closely for changes."
            else:
                status = "Danger 🚨"
                is_critical = True
                reason_text = "وجود مؤشرات غير مستقرة بناءً على تحليل الذكاء الاصطناعي الذكي."
                rec_text = "الإجراء المقترح: إرسال فني لأخذ عينات يدوية فوراً."
                reason_text_en = "Unstable indicators driven by AI pattern detection."
                rec_text_en = "Action: Send a technician for manual sampling instantly."
                
        return {
            "Status": status,
            "Reason": reason_text,
            "Reason_EN": reason_text_en,
            "Recommendation": rec_text,
            "Recommendation_EN": rec_text_en,
            "AI_Confidence": f"{confidence:.1f}%",
            "Is_Critical": is_critical
        }
