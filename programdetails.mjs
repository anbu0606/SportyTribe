// Run this ONCE to upload your JSON data to Firestore
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import fs from "fs";

const adminUserEvents = JSON.parse(
  fs.readFileSync("./src/assets/json/programdetails.json", "utf-8")
);

// Your Firebase Config (from firebase/init.js)
const firebaseConfig = {
  apiKey: "AIzaSyDuzc75tks7BQ2nDp2JfBmjEYF9yVDuC2k",
  authDomain: "sportytribe-45a76.firebaseapp.com",
  projectId: "sportytribe-45a76",
  storageBucket: "sportytribe-45a76.firebasestorage.app",
  messagingSenderId: "143596988256",
  appId: "1:143596988256:web:51f007929fd67ac51b2005"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function uploadData() {
  for (const event of adminUserEvents) {
    await addDoc(collection(db, "programdetails"), event)
  }
  console.log("✅ Data uploaded successfully!")
}

uploadData()