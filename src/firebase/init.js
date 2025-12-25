
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "sportytribe-45a76.firebaseapp.com",
  projectId: "sportytribe-45a76",
  storageBucket: "sportytribe-45a76.firebasestorage.app",
  messagingSenderId: "143596988256",
  appId: "1:143596988256:web:51f007929fd67ac51b2005"
};

const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)

export const db = getFirestore(firebaseApp)
