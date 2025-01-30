// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC8bnp38xAw-ZDVch74vXABDrhxKtdVhvM",
  authDomain: "appbarbercortesdelisboa.firebaseapp.com",
  projectId: "appbarbercortesdelisboa",
  storageBucket: "appbarbercortesdelisboa.firebasestorage.app",
  messagingSenderId: "564795996987",
  appId: "1:564795996987:web:5bc9aaec1490847947551e",
  measurementId: "G-FE5R84694M"
};

import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistência configurada para LOCAL.');
  })
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
