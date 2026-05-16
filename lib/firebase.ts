// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjTCVo2TNExzyIeD01ba1tQOWFsKyundI",
  authDomain: "tnmds-e8898.firebaseapp.com",
  projectId: "tnmds-e8898",
  storageBucket: "tnmds-e8898.firebasestorage.app",
  messagingSenderId: "1092251810695",
  appId: "1:1092251810695:web:ab35eea0a3061d20d3f122",
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
