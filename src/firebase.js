// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3dn2W7cMZsC-P1xMv9u0KDVG3z_Ub4GY",
  authDomain: "the-optimist-daily.firebaseapp.com",
  projectId: "the-optimist-daily",
  storageBucket: "the-optimist-daily.firebasestorage.app",
  messagingSenderId: "197364781182",
  appId: "1:197364781182:web:131907971e8ecdbbd5c82f",
  measurementId: "G-Z187WDX82T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // ✅ This line now works
const db = getFirestore(app);

export { auth,db };