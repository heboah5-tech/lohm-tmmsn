// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC4cUitnmd44Dvlp_neV5AmBnXpbBkE8SM",
  authDomain: "tnmisn-57347.firebaseapp.com",
  projectId: "tnmisn-57347",
  storageBucket: "tnmisn-57347.firebasestorage.app",
  messagingSenderId: "487068100861",
  appId: "1:487068100861:web:9e8edae073c5d9a69e7694",
  measurementId: "G-TCL5XN2M47"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
