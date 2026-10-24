import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getReactNativePersistence, initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBv2qUUh6kV3PXqg7TJnWWDYTUTIMjYy-Y",
  authDomain: "livret-de-recettes.firebaseapp.com",
  projectId: "livret-de-recettes",
  storageBucket: "livret-de-recettes.firebasestorage.app",
  messagingSenderId: "861517711855",
  appId: "1:861517711855:web:281ac4e5cfe67d9f5a4e1a",
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();