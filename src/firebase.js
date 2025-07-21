// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3dn2W7cMZsC-P1xMv9u0KDVG3z_Ub4GY",
  authDomain: "the-optimist-daily.firebaseapp.com",
  projectId: "the-optimist-daily",
  storageBucket: "the-optimist-daily.firebasestorage.app",
  messagingSenderId: "197364781182",
  appId: "1:197364781182:web:131907971e8ecdbbd5c82f",
  measurementId: "G-Z187WDX82T",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
