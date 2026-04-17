// ─────────────────────────────────────────────────────────────────
//  Part Time Mobile — Firebase Configuration
//  Same Firebase project as the web app
// ─────────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            "AIzaSyB00rNS6FD3jkIMLt3IrdQst57z-zwAb7A",
  authDomain:        "part-time-app-24777.firebaseapp.com",
  projectId:         "part-time-app-24777",
  storageBucket:     "part-time-app-24777.firebasestorage.app",
  messagingSenderId: "480738581249",
  appId:             "1:480738581249:web:2cd5cd29330281c6ed5900",
};

// Prevent re-initialisation on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use AsyncStorage for auth persistence on the device
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
