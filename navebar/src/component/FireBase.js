// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZSBXvLgnRB5wCvHVGKaePTLRfG4Hir6I",
  authDomain: "full-pack-todo-firebase.firebaseapp.com",
  projectId: "full-pack-todo-firebase",
  storageBucket: "full-pack-todo-firebase.firebasestorage.app",
  messagingSenderId: "525753688126",
  appId: "1:525753688126:web:602076b153045e5a38b16f",
  measurementId: "G-B53SNQ3CR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const  db = getFirestore(app);
export default app;