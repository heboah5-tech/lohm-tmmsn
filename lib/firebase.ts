// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHQr2o0892ak-6eYYEyOyTPayv7z6cODg",
  authDomain: "tmnrs-1e680.firebaseapp.com",
  projectId: "tmnrs-1e680",
  storageBucket: "tmnrs-1e680.firebasestorage.app",
  messagingSenderId: "874955432598",
  appId: "1:874955432598:web:50d2d4fc0d73ffbcdd98b7",
  measurementId: "G-JNW689TM53"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

let _auth: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(app);
  }
  return _auth;
}

export { app, db, database };
