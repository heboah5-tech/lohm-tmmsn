// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const rawDbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? "";

// Only include databaseURL if it looks valid (must start with https:// and contain .firebaseio.com)
const isValidDbUrl =
  rawDbUrl.startsWith("https://") && rawDbUrl.includes(".firebaseio.com");

const firebaseConfig: Record<string, string> = {
  apiKey: "AIzaSyAoQLPeg1cEMiX7cqemczMYRuMJLEBud6Q",
  authDomain: "artv-a004f.firebaseapp.com",
  projectId: "artv-a004f",
  storageBucket: "artv-a004f.firebasestorage.app",
  messagingSenderId: "793533215100",
  appId: "1:793533215100:web:1c131c488cc82787e5b4f9",
  measurementId: "G-539BNZVSQK",
};

if (isValidDbUrl) {
  firebaseConfig.databaseURL = rawDbUrl;
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Only import and initialize Realtime DB if we have a valid URL
let database: import("firebase/database").Database | null = null;

if (isValidDbUrl && typeof window !== "undefined") {
  import("firebase/database")
    .then(({ getDatabase }) => {
      database = getDatabase(app);
    })
    .catch(() => {});
}

export { auth, db, database };
