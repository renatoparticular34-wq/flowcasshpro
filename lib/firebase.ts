import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAcFykrJZ2YTlQ7j392eTgwe1l3MrKZ01E",
    authDomain: "flowcasshpro.firebaseapp.com",
    projectId: "flowcasshpro",
    storageBucket: "flowcasshpro.firebasestorage.app",
    messagingSenderId: "59584743047",
    appId: "1:59584743047:web:dc238ec70fd8a62d271a22"
};

console.log("🔥 Firebase: Iniciando configuração...");

let app: any;
let auth: any;
let db: any;

try {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App inicializado com sucesso!");

    auth = getAuth(app);
    console.log("✅ Firebase Auth inicializado!");

    // Inicializar Firestore SEM cache offline (para evitar problemas de "offline")
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true, // Força polling em vez de WebSocket
    });
    console.log("✅ Firestore inicializado com Long Polling!");
} catch (error) {
    console.error("❌ ERRO CRÍTICO ao inicializar Firebase:", error);
}

export { auth, db };