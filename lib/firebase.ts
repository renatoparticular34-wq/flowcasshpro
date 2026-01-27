import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAcFykrJZ2YTlQ7j392eTgwe1l3MrKZ01E",
    authDomain: "flowcasshpro.firebaseapp.com",
    projectId: "flowcasshpro",
    storageBucket: "flowcasshpro.firebasestorage.app",
    messagingSenderId: "59584743047",
    appId: "1:59584743047:web:dc238ec70fd8a62d271a22"
};

// Inicializa o App
const app = initializeApp(firebaseConfig);

// Inicializa a Autenticação
export const auth = getAuth(app);

// Inicializa o Banco (com a correção para o erro de Offline)
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});