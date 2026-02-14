import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { debugUserDocument } from "@/firebase/debug";

interface UserProfile {
  username: string;
  email: string;
  displayName: string;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log("No user provided to useUserProfile");
      setProfile(null);
      setLoading(false);
      return;
    }

    console.log("🔍 Starting profile load for user:", user.uid);
    console.log("   Firebase Auth displayName:", user.displayName);
    console.log("   Firebase Auth email:", user.email);

    // Debug: fetch and log what's in Firestore
    debugUserDocument(user.uid);

    setLoading(true);
    const userDocRef = doc(db, "users", user.uid);

    // Use real-time listener to fetch from Firestore
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDoc) => {
        console.log("📡 Firestore snapshot received");
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("✅ Document EXISTS");
          console.log("   Full document:", data);
          console.log("   Username field:", data.username);
          
          const savedUsername = data.username;
          
          if (savedUsername) {
            console.log("✅ Using Firestore username:", savedUsername);
            setProfile({
              username: savedUsername,
              email: data.email || user.email || "",
              displayName: data.displayName || user.displayName || "",
            });
          } else {
            console.warn("❌ Username field is EMPTY in Firestore");
            console.log("   Available fields:", Object.keys(data));
            // Try to use displayName from Firestore as fallback
            const fallbackUsername = data.displayName || "User";
            setProfile({
              username: fallbackUsername,
              email: data.email || user.email || "",
              displayName: data.displayName || user.displayName || "",
            });
          }
        } else {
          console.error("❌ Document DOES NOT EXIST in Firestore for user:", user.uid);
          console.log("   This means the user document was never created!");
          setProfile({
            username: "User",
            email: user.email || "",
            displayName: user.displayName || "",
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("🔥 Firebase error:", error);
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
        setProfile({
          username: "User",
          email: user.email || "",
          displayName: user.displayName || "",
        });
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  return { profile, loading };
};
