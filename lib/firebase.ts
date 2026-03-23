// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
 apiKey: "AIzaSyA76eNKpMAO1sGzK7HANK5-VRyASJIq8Rw",
  authDomain: "fgfd-2b2c3.firebaseapp.com",
  projectId: "fgfd-2b2c3",
  storageBucket: "fgfd-2b2c3.firebasestorage.app",
  messagingSenderId: "429384612235",
  appId: "1:429384612235:web:253427804a116076b2178e",
  measurementId: "G-2FXMPP0VCQ"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
