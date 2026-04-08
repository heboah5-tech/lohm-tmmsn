// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const rawDbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? "";

// Only include databaseURL if it looks valid (must start with https:// and contain .firebaseio.com)
const isValidDbUrl =
  rawDbUrl.startsWith("https://") && rawDbUrl.includes(".firebaseio.com");

const firebaseConfig: Record<string, string> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
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
  import("firebase/database").then(({ getDatabase }) => {
    database = getDatabase(app);
  }).catch(() => {});
}

export { auth, db, database };
