import {
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export const signUp = async (email: string, password: string, username: string): Promise<User | null> => {
  try {
    console.log("Starting signup for:", email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User created in Auth:", userCredential.user.uid);
    
    // Set display name to username
    await updateProfile(userCredential.user, {
      displayName: username,
    });
    console.log("Profile updated with display name");

    // Store user data in Firestore - use lowercase for username consistency
    console.log("Creating Firestore user document...");
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      username: username.toLowerCase(),
      email: email,
      displayName: username,
      role: "user",
      createdAt: new Date(),
      status: "online",
    });
    console.log("Firestore user document created successfully");
    
    return userCredential.user;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

export const logIn = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut().catch((nativeError) => {
        console.warn("Native sign out warning:", nativeError);
      });
    }

    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

const GOOGLE_AUTH_FLOW_KEY = "pendingGoogleAuthFlow";

const persistGoogleAuthFlow = (flow: "login" | "signup") => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOOGLE_AUTH_FLOW_KEY, flow);
};

const clearGoogleAuthFlow = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GOOGLE_AUTH_FLOW_KEY);
};

export const consumeGoogleAuthFlow = (): "login" | "signup" | null => {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(GOOGLE_AUTH_FLOW_KEY);
  if (value === "login" || value === "signup") {
    window.localStorage.removeItem(GOOGLE_AUTH_FLOW_KEY);
    return value;
  }

  return null;
};

export const isNewGoogleUser = (user: User) => {
  const metadata = user.metadata;
  return metadata?.creationTime === metadata?.lastSignInTime;
};

export const signInWithGoogle = async (
  flow: "login" | "signup" = "login"
): Promise<{ user: User; isNew: boolean } | null> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    persistGoogleAuthFlow(flow);

    if (Capacitor.isNativePlatform()) {
      console.log("Starting native Google sign-in");
      const nativeResult = await FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth: true,
      });

      const idToken = nativeResult.credential?.idToken;
      if (!idToken) {
        throw new Error("Google sign-in did not return an ID token.");
      }

      const firebaseCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, firebaseCredential);
      const user = userCredential.user;
      const isNew = getAdditionalUserInfo(userCredential)?.isNewUser ?? isNewGoogleUser(user);

      clearGoogleAuthFlow();
      console.log("Native Google sign-in successful:", user.uid);
      console.log("New user:", isNew);

      return { user, isNew };
    }

    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    const user = result.user;
    const isNew = getAdditionalUserInfo(result)?.isNewUser ?? isNewGoogleUser(user);

    clearGoogleAuthFlow();
    console.log("Google sign-in successful:", user.uid);
    console.log("New user:", isNew);

    return { user, isNew };
  } catch (error) {
    clearGoogleAuthFlow();
    console.error("Google sign-in error:", error);

    const authError = error as Error & { code?: string };
    const errorMessage = authError.message ?? "";

    if (
      authError.code === "auth/invalid-app-id" ||
      authError.code === "auth/invalid-cordova-configuration" ||
      /12500|10:|DEVELOPER_ERROR/i.test(errorMessage)
    ) {
      throw new Error("Firebase mobile Google sign-in still needs Android app setup in Firebase Console: add package com.pop.app, register SHA fingerprints, enable Google sign-in, and download the updated google-services.json.");
    }

    if (authError.code === "auth/argument-error") {
      throw new Error("The mobile app has switched to native Google sign-in. Please rebuild and reinstall the Android app, then try again.");
    }

    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
