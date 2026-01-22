import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8J1w7m4i_xUMaQTQ8QV8YXKzbASNIhxw",
  authDomain: "camscannerclone-ae1e1.firebaseapp.com",
  projectId: "camscannerclone-ae1e1",
  storageBucket: "camscannerclone-ae1e1.firebasestorage.app",
  messagingSenderId: "628607570108",
  appId: "1:628607570108:web:bc37c26add693eee8080b9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
