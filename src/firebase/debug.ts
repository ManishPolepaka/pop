import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

/**
 * Debug function to check what's actually stored in Firestore for a user
 */
export const debugUserDocument = async (userId: string) => {
  try {
    console.log(`🔍 Fetching Firestore document for user: ${userId}`);
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("✅ Document found!");
      console.log("📄 Full document data:");
      console.log(data);
      console.log("📋 Document fields:");
      Object.entries(data).forEach(([key, value]) => {
        console.log(`   - ${key}: ${JSON.stringify(value)}`);
      });
      return data;
    } else {
      console.error("❌ Document does NOT exist in Firestore!");
      console.log(`   User ID: ${userId}`);
      console.log("   Collection: users");
      return null;
    }
  } catch (error) {
    console.error("🔥 Error fetching document:", error);
    return null;
  }
};

/**
 * Call this from your component to debug
 * Usage: In any component - debugUserDocument(user.uid)
 */
export default debugUserDocument;
