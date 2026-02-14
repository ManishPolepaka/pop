import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";

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
      username: username.toLowerCase(), // Store lowercase for consistency
      email: email,
      displayName: username,
      createdAt: new Date(),
      friends: [],
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
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<{ user: User; isNew: boolean } | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Google sign-in successful:", user.uid);

    // Check if this is a new user by comparing creation and last sign-in timestamps
    const metadata = result.user.metadata;
    const isNew = metadata?.creationTime === metadata?.lastSignInTime;
    console.log("New user:", isNew);

    return { user, isNew };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
