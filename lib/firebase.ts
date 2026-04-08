// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

const firebaseConfig: Record<string, string | undefined> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let database: Database;
try {
  database = getDatabase(app);
} catch {
  // Fallback: initialize with a placeholder to avoid crash
  database = getDatabase(initializeApp({ ...firebaseConfig, databaseURL: "https://placeholder-default-rtdb.firebaseio.com" }, "fallback-db-app"));
}

export { auth, db, database };
