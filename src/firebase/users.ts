import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
  friends: string[];
  status: "online" | "offline";
}

// Search for users by username
export const searchUsersByUsername = async (searchQuery: string): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", ">=", searchQuery.toLowerCase()), where("username", "<=", searchQuery.toLowerCase() + "\uf8ff"));
    
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: data.uid,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        createdAt: data.createdAt?.toDate() || new Date(),
        friends: data.friends || [],
        status: data.status || "offline",
      });
    });

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      uid: data.uid,
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      createdAt: data.createdAt?.toDate() || new Date(),
      friends: data.friends || [],
      status: data.status || "offline",
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Send pop invitation
export const sendPopInvitation = async (fromUserId: string, toUsername: string, message?: string) => {
  try {
    const toUser = await getUserByUsername(toUsername);
    
    if (!toUser) {
      throw new Error("User not found");
    }

    // TODO: Create invitations collection to track sent invitations
    console.log(`Invitation sent from ${fromUserId} to ${toUsername}`);
    return true;
  } catch (error) {
    console.error("Error sending invitation:", error);
    throw error;
  }
};

// Add friend
export const addFriend = async (userId: string, friendUserId: string) => {
  try {
    const { doc: firestoreDoc, updateDoc, arrayUnion } = await import("firebase/firestore");
    
    // Add to user's friends list
    await updateDoc(firestoreDoc(db, "users", userId), {
      friends: arrayUnion(friendUserId),
    });

    // Add to friend's friends list (optional - for bidirectional relationship)
    await updateDoc(firestoreDoc(db, "users", friendUserId), {
      friends: arrayUnion(userId),
    });

    return true;
  } catch (error) {
    console.error("Error adding friend:", error);
    throw error;
  }
};

// Get user's friends
export const getUserFriends = async (userId: string): Promise<UserProfile[]> => {
  try {
    const { doc: firestoreDoc, getDoc } = await import("firebase/firestore");
    
    const userDocRef = firestoreDoc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return [];
    }

    const friendIds = userDoc.data().friends || [];
    const friends: UserProfile[] = [];

    for (const friendId of friendIds) {
      const friendDocRef = firestoreDoc(db, "users", friendId);
      const friendDoc = await getDoc(friendDocRef);

      if (friendDoc.exists()) {
        const data = friendDoc.data();
        friends.push({
          uid: data.uid,
          username: data.username,
          email: data.email,
          displayName: data.displayName,
          createdAt: data.createdAt?.toDate() || new Date(),
          friends: data.friends || [],
          status: data.status || "offline",
        });
      }
    }

    return friends;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};
