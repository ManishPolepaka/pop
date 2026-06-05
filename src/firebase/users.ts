import { db } from "@/firebase/config";
import { collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: Date;
  status: "online" | "offline";
}

// Get user profile by UID
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    return {
      uid: data.uid,
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      role: data.role ?? "user",
      createdAt: data.createdAt?.toDate() || new Date(),
      status: data.status || "offline",
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const data = querySnapshot.docs[0].data();
    return {
      uid: data.uid,
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      role: data.role ?? "user",
      createdAt: data.createdAt?.toDate() || new Date(),
      status: data.status || "offline",
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
