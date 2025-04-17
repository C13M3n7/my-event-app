import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth'; // 👈 add this

const firebaseConfig = {
    apiKey: "AIzaSyBJd6jrp5FZQ4TckSyLd9Q3z1JM2WBl1lw",
    authDomain: "paymenttest-57551.firebaseapp.com",
    projectId: "paymenttest-57551",
    storageBucket: "paymenttest-57551.firebasestorage.app",
    messagingSenderId: "240132024361",
    appId: "1:240132024361:web:3787675e4ea5a1a9e39438",
    measurementId: "G-SVNLNZMQP9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 👈 add this

// 👇 optional logout helper
function logout() {
    return signOut(auth);
}

export { db, collection, addDoc, updateDoc, auth, logout }; // 👈 updated exports
