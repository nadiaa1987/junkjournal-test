import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC_I--ztJqv1kNHWCoRxPmIIEWmfupB1Mc",
    authDomain: "junk-journal-4116f.firebaseapp.com",
    projectId: "junk-journal-4116f",
    storageBucket: "junk-journal-4116f.firebasestorage.app",
    messagingSenderId: "822194013342",
    appId: "1:822194013342:web:743ca4fb79c6f838a5e78f",
    measurementId: "G-QNG1DEWFXJ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
