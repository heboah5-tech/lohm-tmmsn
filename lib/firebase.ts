// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  // add your firebase config here
    apiKey: "AIzaSyCo3rP4Mx-zko1L2GrhErHo9QN_PbhF95s",
  authDomain: "fir-acd64.firebaseapp.com",
  projectId: "fir-acd64",
  storageBucket: "fir-acd64.firebasestorage.app",
  messagingSenderId: "1042218830914",
  appId: "1:1042218830914:web:847c8200826e8e655971db",
  measurementId: "G-V4YS80EDX8"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
