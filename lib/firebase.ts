// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBAH7Q_vE79cUiwIcziXJGYNhZj9M_bCF0",
  authDomain: "sxwq-94f2c.firebaseapp.com",
  projectId: "sxwq-94f2c",
  storageBucket: "sxwq-94f2c.firebasestorage.app",
  messagingSenderId: "970420699631",
  appId: "1:970420699631:web:f4c514b7d0e053cf3ab61a",
  measurementId: "G-YSZMVHTMNT"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
