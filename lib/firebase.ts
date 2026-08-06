// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBJwAk57JgSfu-nXlctc9t5M2b5A0yOH3o",
  authDomain: "taminn-jh.firebaseapp.com",
  databaseURL: "https://taminn-jh-default-rtdb.firebaseio.com",
  projectId: "taminn-jh",
  storageBucket: "taminn-jh.firebasestorage.app",
  messagingSenderId: "910897215892",
  appId: "1:910897215892:web:d4788788e3a66d94abb781",
  measurementId: "G-MKE0PZWQEX"
}

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
