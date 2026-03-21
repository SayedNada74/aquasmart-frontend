import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBb3U2kWjlQaWfk-AwJ0gJds5pCCUQ3M9U",
    authDomain: "aquasmart-system.firebaseapp.com",
    databaseURL: "https://aquasmart-system-default-rtdb.firebaseio.com",
    projectId: "aquasmart-system",
    storageBucket: "aquasmart-system.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abc123def456"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
const auth = getAuth(app);

export { app, database, auth };
