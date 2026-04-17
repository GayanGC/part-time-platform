// ─────────────────────────────────────────────────────────────────
//  Part Time — Firebase Configuration
// ─────────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB00rNS6FD3jkIMLt3IrdQst57z-zwAb7A",
  authDomain: "part-time-app-24777.firebaseapp.com",
  projectId: "part-time-app-24777",
  storageBucket: "part-time-app-24777.firebasestorage.app",
  messagingSenderId: "480738581249",
  appId: "1:480738581249:web:2cd5cd29330281c6ed5900",
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

export default app;
