// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBBHdkoD3yYCe9gLCs8zV9_QpL7f0P34ag",
  authDomain: "planora-ce3a5.firebaseapp.com",
  projectId: "planora-ce3a5",
  storageBucket: "planora-ce3a5.appspot.com",
  messagingSenderId: "681139972771",
  appId: "1:681139972771:web:5e17d10a3549c1abe52d16",
  measurementId: "G-HTHPBGY2GQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage

// Export Firebase services
export { app, auth, db, storage };  // Now export `storage` as well
