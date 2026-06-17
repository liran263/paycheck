import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbT_buZ4sDPMoTOEL_9aNVdUcOzcvIIEw",
    authDomain: "liran-matiuh.firebaseapp.com",
    projectId: "liran-matiuh",
    storageBucket: "liran-matiuh.firebasestorage.app",
    messagingSenderId: "764215142318",
    appId: "1:764215142318:web:b4f1c11b8a339f83e68a3f",
    measurementId: "G-S2HGS43C1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});
