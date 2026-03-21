<div align="center">
  <img src="./frontend/public/images/logo.png" alt="AquaSmart AI Logo" width="200" height="auto" />
  <h1>🌊 AquaSmart AI</h1>
  <p><strong>Intelligent AI-Powered Fish Farm Management Platform</strong></p>
  <p>A full-stack, decoupled architecture system leveraging Next.js, Python, TensorFlow Lite, and Firebase to provide real-time aquaculture monitoring, AI-driven diagnostics, and smart alerts.</p>
</div>

---

## 🚀 Live Demo

**Frontend Application:** [https://aquasmart.vercel.app](https://aquasmart.vercel.app) *(Subject to deployment)*  
**AI Worker Status:** `Running on Render Cloud 🟢`

---

## 🏗️ Architecture

AquaSmart AI utilizes a decoupled architecture to separate compute-heavy AI tasks from lightning-fast UI rendering:

```text
       [ User / Farm Manager ]
                 ↓
      (Next.js React Dashboard)
                 ↓ 🔄 Live Sync
    [ Firebase Realtime Database ]
                 ↑ ⬆️ Data Push
     (Python AI Worker & Simulator)
                 ↓ 🤖 Inference
     [ TFLite Model + Gemini Pro ]
```

### Tech Stack
*   **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion, Recharts.
*   **Backend & AI Engine:** Python 3, TensorFlow Lite, NumPy.
*   **Database & Auth:** Firebase Realtime Database, Firebase Authentication.
*   **Generative AI:** Google Gemini 1.5 Pro/Flash (Chatbot & Vision Diagnostics).
*   **Alerting:** Telegram Bot API.

---

## ✨ Key Features

*   **Real-time Pond Monitoring:** Live tracking of Temperature, pH, Dissolved Oxygen (DO), and Ammonia (NH3) using Recharts.
*   **AI Edge Evaluation:** A custom TFLite model running on a Python backend evaluates water quality 24/7 and generates an "AI Confidence Score".
*   **Smart Alerts & Telegram Integration:** WhatsApp-style UI alerts and instant Telegram push notifications when water parameters reach critical thresholds (e.g., Ammonia leaks).
*   **Multimodal AI Center:**
    *   **Aquaculture Chatbot:** Context-aware expert advice powered by Gemini.
    *   **Fish Image Diagnosis:** Upload an image of a fish to receive instant disease diagnosis and treatment plans.
*   **Bilingual & Adaptive UI:** Full RTL/LTR support (Arabic/English) with an immersive Dark/Light mode theme engine.
*   **Hardware-Ready IoT Simulator:** The backend currently runs a deterministic "Random Walk" simulator perfectly primed to be replaced by live ESP32/Arduino data streams.

---

## 📂 Project Structure

```text
AquaSmart_AI/
│
├── frontend/                  # Next.js 14 Web Application
│   ├── src/app/               # Pages (Dashboard, AI Center, Reports, etc.)
│   ├── src/components/        # Reusable UI/UX Elements
│   ├── src/lib/               # Firebase & App Context Configs
│   └── public/                # Static Assets
│
├── backend/                   # Python AI & IoT Worker
│   ├── main.py                # Main execution loop & Firebase uploader
│   ├── requirements.txt       # Python dependencies (tflite-runtime, firebase-admin)
│   ├── services/
│   │   ├── ai_evaluator.py    # TFLite inference engine handling edge logic
│   │   └── aquasmart_model.tflite
│   └── simulators/
│       └── sensor_simulator.py # Data stream mock replacing physical sensors
│
└── README.md
```

---

## ⚙️ Local Development Setup

To run this platform on your local machine, follow these steps:

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Ensure you copy `.env.example` to `.env.local` and provide your Firebase and Gemini API keys.*

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Ensure you have placed the `serviceAccountKey.json` from your Firebase project inside the backend directory, or provided it via the `FIREBASE_SERVICE_ACCOUNT` environment variable.*

---

## 📈 Security & Deployment

*   **Firebase Keys:** API keys and Service Accounts are thoroughly secured using Environment Variables across Vercel and Render.
*   **TFLite Optimization:** The backend utilizes `tflite-runtime` instead of full `tensorflow` to shrink the deployment footprint, ensuring smooth execution on free/low-cost VMs.
*   **Route Protection:** Unauthorized access is blocked by Firebase Auth listeners wrapping the Next.js layouts.

---
<div align="center">
  <p><i>Developed as an advanced graduation project representing the cutting edge of AI in Aquaculture.</i></p>
</div>
