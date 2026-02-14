/**
 * Friends Firebase Service
 * Handles all friend-related database operations
 */

import { db } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import {
  FriendRequest,
  FriendRequestStatus,
  UserSearchResult,
  Friend,
} from "@/types/friend";

/**
 * Get current user's data
 */
export const getCurrentUserData = async (
  userId: string
): Promise<{ username: string; displayName: string } | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return null;
    }
    const data = userDoc.data();
    return {
      username: data.username || "",
      displayName: data.displayName || data.username || "",
    };
  } catch (error) {
    console.error("Error getting current user data:", error);
    return null;
  }
};

/**
 * Search users by username (excluding current user)
 */
export const searchUsersByUsername = async (
  searchQuery: string,
  currentUserId: string
): Promise<UserSearchResult[]> => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }

    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("username", ">=", searchQuery.toLowerCase()),
      where("username", "<=", searchQuery.toLowerCase() + "\uf8ff")
    );

    const snapshot = await getDocs(q);
    const results: UserSearchResult[] = [];

    for (const userDoc of snapshot.docs) {
      if (userDoc.id === currentUserId) continue; // Skip current user

      const userData = userDoc.data();
      const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
      const currentUserData = currentUserDoc.data();

      let relationshipStatus: "friend" | "pending_sent" | "pending_received" | "none" = "none";

      if (currentUserData?.friends?.includes(userDoc.id)) {
        relationshipStatus = "friend";
      } else if (currentUserData?.sentRequests?.length > 0) {
        // Check if request exists
        const requestsRef = collection(db, "friendRequests");
        const requestQuery = query(
          requestsRef,
          where("fromUserId", "==", currentUserId),
          where("toUserId", "==", userDoc.id),
          where("status", "==", "pending")
        );
        const requestSnapshot = await getDocs(requestQuery);
        if (!requestSnapshot.empty) {
          relationshipStatus = "pending_sent";
        }
      }

      if (relationshipStatus === "none" && currentUserData?.receivedRequests?.length > 0) {
        const requestsRef = collection(db, "friendRequests");
        const requestQuery = query(
          requestsRef,
          where("fromUserId", "==", userDoc.id),
          where("toUserId", "==", currentUserId),
          where("status", "==", "pending")
        );
        const requestSnapshot = await getDocs(requestQuery);
        if (!requestSnapshot.empty) {
          relationshipStatus = "pending_received";
        }
      }

      results.push({
        uid: userDoc.id,
        username: userData.username || "Unknown",
        displayName: userData.displayName || userData.username,
        status: userData.status || "offline",
        relationshipStatus,
      });
    }

    return results;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

/**
 * Send a friend request
 */
export const sendFriendRequest = async (
  fromUserId: string,
  fromUsername: string,
  fromDisplayName: string,
  toUserId: string
): Promise<string | null> => {
  try {
    // Check if already friends
    const toUserDoc = await getDoc(doc(db, "users", toUserId));
    const toUserData = toUserDoc.data();

    if (toUserData?.friends?.includes(fromUserId)) {
      console.warn("Already friends");
      return null;
    }

    // Check if request already exists
    const existingQuery = query(
      collection(db, "friendRequests"),
      where("fromUserId", "==", fromUserId),
      where("toUserId", "==", toUserId),
      where("status", "==", "pending")
    );

    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      console.warn("Request already sent");
      return existingSnapshot.docs[0].id;
    }

    // Create friend request
    const requestRef = await addDoc(collection(db, "friendRequests"), {
      fromUserId,
      fromUsername,
      fromDisplayName,
      toUserId,
      status: FriendRequestStatus.PENDING,
      createdAt: Timestamp.now(),
    });

    // Update both users' request arrays
    const batch = writeBatch(db);

    batch.update(doc(db, "users", fromUserId), {
      sentRequests: arrayUnion(requestRef.id),
    });

    batch.update(doc(db, "users", toUserId), {
      receivedRequests: arrayUnion(requestRef.id),
    });

    await batch.commit();

    console.log("✅ Friend request sent:", requestRef.id);
    return requestRef.id;
  } catch (error) {
    console.error("Error sending friend request:", error);
    return null;
  }
};

/**
 * Accept a friend request
 * Option 1: Auto-accept bidirectional requests
 */
export const acceptFriendRequest = async (
  requestId: string,
  fromUserId: string,
  toUserId: string
): Promise<boolean> => {
  try {
    const batch = writeBatch(db);

    // Update request status
    batch.update(doc(db, "friendRequests", requestId), {
      status: FriendRequestStatus.ACCEPTED,
      respondedAt: Timestamp.now(),
    });

    // Add to each other's friends lists
    batch.update(doc(db, "users", fromUserId), {
      friends: arrayUnion(toUserId),
    });

    batch.update(doc(db, "users", toUserId), {
      friends: arrayUnion(fromUserId),
    });

    // Remove from request arrays
    batch.update(doc(db, "users", fromUserId), {
      sentRequests: arrayRemove(requestId),
    });

    batch.update(doc(db, "users", toUserId), {
      receivedRequests: arrayRemove(requestId),
    });

    // Check for bidirectional request (Option 1: Auto-accept both ways)
    const bidirectionalQuery = query(
      collection(db, "friendRequests"),
      where("fromUserId", "==", toUserId),
      where("toUserId", "==", fromUserId),
      where("status", "==", "pending")
    );

    const bidirectionalSnapshot = await getDocs(bidirectionalQuery);

    if (!bidirectionalSnapshot.empty) {
      const bidirectionalRequestId = bidirectionalSnapshot.docs[0].id;

      // Auto-accept the bidirectional request
      batch.update(doc(db, "friendRequests", bidirectionalRequestId), {
        status: FriendRequestStatus.ACCEPTED,
        respondedAt: Timestamp.now(),
      });

      // Remove bidirectional request from arrays
      batch.update(doc(db, "users", toUserId), {
        sentRequests: arrayRemove(bidirectionalRequestId),
      });

      batch.update(doc(db, "users", fromUserId), {
        receivedRequests: arrayRemove(bidirectionalRequestId),
      });

      console.log("✅ Auto-accepted bidirectional friend request");
    }

    await batch.commit();

    console.log("✅ Friend request accepted");
    return true;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return false;
  }
};

/**
 * Decline a friend request
 */
export const declineFriendRequest = async (
  requestId: string,
  fromUserId: string,
  toUserId: string
): Promise<boolean> => {
  try {
    const batch = writeBatch(db);

    // Update request status
    batch.update(doc(db, "friendRequests", requestId), {
      status: FriendRequestStatus.DECLINED,
      respondedAt: Timestamp.now(),
    });

    // Remove from request arrays
    batch.update(doc(db, "users", fromUserId), {
      sentRequests: arrayRemove(requestId),
    });

    batch.update(doc(db, "users", toUserId), {
      receivedRequests: arrayRemove(requestId),
    });

    await batch.commit();

    console.log("✅ Friend request declined");
    return true;
  } catch (error) {
    console.error("Error declining friend request:", error);
    return false;
  }
};

/**
 * Remove a friend
 */
export const removeFriend = async (
  currentUserId: string,
  friendUserId: string
): Promise<boolean> => {
  try {
    const batch = writeBatch(db);

    batch.update(doc(db, "users", currentUserId), {
      friends: arrayRemove(friendUserId),
    });

    batch.update(doc(db, "users", friendUserId), {
      friends: arrayRemove(currentUserId),
    });

    await batch.commit();

    console.log("✅ Friend removed");
    return true;
  } catch (error) {
    console.error("Error removing friend:", error);
    return false;
  }
};

/**
 * Get user's friends list with details
 */
export const getFriendsList = async (userId: string): Promise<Friend[]> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();

    if (!userData?.friends || userData.friends.length === 0) {
      return [];
    }

    const friends: Friend[] = [];

    for (const friendId of userData.friends) {
      const friendDoc = await getDoc(doc(db, "users", friendId));
      const friendData = friendDoc.data();

      friends.push({
        uid: friendId,
        username: friendData?.username || "Unknown",
        displayName: friendData?.displayName || friendData?.username,
        status: friendData?.status || "offline",
        lastSeen: friendData?.lastSeen,
        isFriend: true,
      });
    }

    return friends;
  } catch (error) {
    console.error("Error getting friends list:", error);
    return [];
  }
};

/**
 * Get pending friend requests (received)
 */
export const getPendingRequests = async (
  userId: string
): Promise<FriendRequest[]> => {
  try {
    const requestsRef = collection(db, "friendRequests");
    const q = query(
      requestsRef,
      where("toUserId", "==", userId),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);
    const requests: FriendRequest[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Get displayName from request or fetch from user
      let displayName = data.fromDisplayName;
      if (!displayName) {
        const fromUserDoc = await getDoc(doc(db, "users", data.fromUserId));
        const fromUserData = fromUserDoc.data();
        displayName = fromUserData?.displayName || fromUserData?.username || "Unknown";
      }

      requests.push({
        id: docSnap.id,
        fromUserId: data.fromUserId,
        fromUsername: data.fromUsername,
        fromDisplayName: displayName,
        toUserId: data.toUserId,
        status: data.status,
        createdAt: data.createdAt,
        respondedAt: data.respondedAt,
      });
    }

    return requests;
  } catch (error) {
    console.error("Error getting pending requests:", error);
    return [];
  }
};

/**
 * Get friend details by ID
 */
export const getFriendDetails = async (userId: string): Promise<Friend | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      uid: userId,
      username: userData.username || "Unknown",
      displayName: userData.displayName || userData.username,
      status: userData.status || "offline",
      lastSeen: userData.lastSeen,
      isFriend: true,
    };
  } catch (error) {
    console.error("Error getting friend details:", error);
    return null;
  }
};
