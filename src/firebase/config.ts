import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyDCWgX8hbsfFccykM6IRDmgXgBoXb_YCxI",
  authDomain: "diverto-12a71.firebaseapp.com",
  projectId: "diverto-12a71",
  storageBucket: "diverto-12a71.firebasestorage.app",
  messagingSenderId: "678938785330",
  appId: "1:678938785330:web:2ce05f425355788b662e2b",
  measurementId: "G-9X21BV904Q",
};

const app = initializeApp(firebaseConfig);

const createAuth = (): Auth => {
  try {
    if (Capacitor.isNativePlatform()) {
      return initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
      });
    }

    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
};

export const auth = createAuth();
export const db = getFirestore(app);

export default app;
