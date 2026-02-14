import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCWgX8hbsfFccykM6IRDmgXgBoXb_YCxI",
  authDomain: "diverto-12a71.firebaseapp.com",
  projectId: "diverto-12a71",
  storageBucket: "diverto-12a71.firebasestorage.app",
  messagingSenderId: "678938785330",
  appId: "1:678938785330:web:2ce05f425355788b662e2b",
  measurementId: "G-9X21BV904Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
