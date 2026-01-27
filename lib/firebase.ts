import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAcFykrJZ2YTlQ7j392eTgwe1l3MrKZ01E",
    authDomain: "flowcasshpro.firebaseapp.com",
    projectId: "flowcasshpro",
    storageBucket: "flowcasshpro.firebasestorage.app",
    messagingSenderId: "59584743047",
    appId: "1:59584743047:web:dc238ec70fd8a62d271a22"
};

console.log("🔥 Firebase: Iniciando configuração...");

let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App inicializado com sucesso!");

    auth = getAuth(app);
    console.log("✅ Firebase Auth inicializado!");

    db = getFirestore(app);
    console.log("✅ Firestore inicializado!");
} catch (error) {
    console.error("❌ ERRO CRÍTICO ao inicializar Firebase:", error);
}

export { auth, db };