/**
 * Friend POPs Firebase Service
 * Handles all friend POP exchanges and conversations
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
  orderBy,
  Timestamp,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { getRandomPOP } from "@/firebase/pops";
import { SentPop, PopReply, PopConversation } from "@/types/friendPop";

/**
 * Send a random POP to a friend
 * Sender doesn't know which question will be sent
 */
export const sendRandomPOPToFriend = async (
  fromUserId: string,
  fromUsername: string,
  toUserId: string,
  toUsername: string,
  personalNote: string
): Promise<string | null> => {
  try {
    // Get a random POP from the 35 questions
    const randomPOP = await getRandomPOP();
    if (!randomPOP) {
      console.error("No POPs available");
      return null;
    }

    // Create the sent POP document
    const sentPopRef = await addDoc(collection(db, "sentPops"), {
      fromUserId,
      fromUsername,
      toUserId,
      toUsername,
      popId: randomPOP.id,
      popContent: randomPOP.content,
      personalNote,
      status: "new",
      sentAt: Timestamp.now(),
      replies: [],
    } as Omit<SentPop, "id">);

    console.log("✅ Random POP sent:", sentPopRef.id);
    return sentPopRef.id;
  } catch (error) {
    console.error("Error sending random POP:", error);
    return null;
  }
};

/**
 * Get all conversations for a user (recipients or senders)
 */
export const getMyConversations = async (
  userId: string
): Promise<PopConversation[]> => {
  try {
    const sentPopsRef = collection(db, "sentPops");

    // Get POPs sent BY user (without orderBy to avoid needing composite index)
    const sentQuery = query(
      sentPopsRef,
      where("fromUserId", "==", userId)
    );
    const sentSnapshot = await getDocs(sentQuery);

    // Get POPs sent TO user (without orderBy to avoid needing composite index)
    const receivedQuery = query(
      sentPopsRef,
      where("toUserId", "==", userId)
    );
    const receivedSnapshot = await getDocs(receivedQuery);

    // Merge and deduplicate conversations
    const conversationMap = new Map<string, PopConversation>();

    // Process sent POPs
    for (const doc of sentSnapshot.docs) {
      const data = doc.data() as SentPop;
      const friendId = data.toUserId;
      const lastMessage = data.replies.length > 0
        ? data.replies[data.replies.length - 1].message
        : data.popContent;
      const lastTime = data.replies.length > 0
        ? data.replies[data.replies.length - 1].sentAt
        : data.sentAt;

      conversationMap.set(friendId, {
        sentPopId: doc.id,
        friendId,
        friendUsername: data.toUsername,
        friendDisplayName: data.toUsername,
        lastMessage,
        lastMessageTime: lastTime,
        unreadCount: 0,
        status: data.status,
      });
    }

    // Process received POPs
    for (const doc of receivedSnapshot.docs) {
      const data = doc.data() as SentPop;
      const friendId = data.fromUserId;
      const lastMessage = data.replies.length > 0
        ? data.replies[data.replies.length - 1].message
        : data.popContent;
      const lastTime = data.replies.length > 0
        ? data.replies[data.replies.length - 1].sentAt
        : data.sentAt;

      const existing = conversationMap.get(friendId);
      const unreadCount = data.status === "new" ? 1 : 0;

      if (existing) {
        // Update if this is more recent
        if (lastTime > existing.lastMessageTime) {
          conversationMap.set(friendId, {
            sentPopId: doc.id,
            friendId,
            friendUsername: data.fromUsername,
            friendDisplayName: data.fromUsername,
            lastMessage,
            lastMessageTime: lastTime,
            unreadCount,
            status: data.status,
          });
        }
      } else {
        conversationMap.set(friendId, {
          sentPopId: doc.id,
          friendId,
          friendUsername: data.fromUsername,
          friendDisplayName: data.fromUsername,
          lastMessage,
          lastMessageTime: lastTime,
          unreadCount,
          status: data.status,
        });
      }
    }

    // Convert map to sorted array (sort by timestamp in JavaScript)
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => {
        const aTime = a.lastMessageTime.seconds || 0;
        const bTime = b.lastMessageTime.seconds || 0;
        return bTime - aTime;
      }
    );

    console.log("✅ Conversations loaded:", conversations.length);
    return conversations;
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
};

/**
 * Get specific conversation with one friend
 * Returns all POPs exchanged between user and friend, sorted chronologically
 */
export const getConversationWithFriend = async (
  userId: string,
  friendId: string
): Promise<SentPop[]> => {
  try {
    const sentPopsRef = collection(db, "sentPops");

    // Get POPs between these two users in both directions (without orderBy)
    const query1 = query(
      sentPopsRef,
      where("fromUserId", "==", userId),
      where("toUserId", "==", friendId)
    );

    const query2 = query(
      sentPopsRef,
      where("fromUserId", "==", friendId),
      where("toUserId", "==", userId)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(query1),
      getDocs(query2),
    ]);

    const pops: SentPop[] = [];

    for (const doc of snapshot1.docs) {
      pops.push({
        id: doc.id,
        ...(doc.data() as Omit<SentPop, "id">),
      });
    }

    for (const doc of snapshot2.docs) {
      pops.push({
        id: doc.id,
        ...(doc.data() as Omit<SentPop, "id">),
      });
    }

    // Sort by sent time in JavaScript
    pops.sort((a, b) => {
      const aTime = a.sentAt.seconds || 0;
      const bTime = b.sentAt.seconds || 0;
      return aTime - bTime;
    });

    console.log("✅ Conversation with friend loaded:", pops.length, "POPs");
    return pops;
  } catch (error) {
    console.error("Error getting conversation with friend:", error);
    return [];
  }
};

/**
 * Get a single POP by ID
 */
export const getSentPopById = async (sentPopId: string): Promise<SentPop | null> => {
  try {
    const docRef = doc(db, "sentPops", sentPopId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<SentPop, "id">),
    };
  } catch (error) {
    console.error("Error getting sent POP:", error);
    return null;
  }
};

/**
 * Reply to a POP
 */
export const replyToPOP = async (
  sentPopId: string,
  userId: string,
  username: string,
  message: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, "sentPops", sentPopId);

    const reply: PopReply = {
      from: userId,
      username,
      message,
      sentAt: Timestamp.now(),
    };

    await updateDoc(docRef, {
      replies: arrayUnion(reply),
      status: "replied",
    });

    console.log("✅ Reply added to POP");
    return true;
  } catch (error) {
    console.error("Error replying to POP:", error);
    return false;
  }
};

/**
 * Mark a POP as seen
 */
export const markPOPAsSeen = async (sentPopId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "sentPops", sentPopId);

    await updateDoc(docRef, {
      status: "seen",
      seenAt: Timestamp.now(),
    });

    console.log("✅ POP marked as seen");
    return true;
  } catch (error) {
    console.error("Error marking POP as seen:", error);
    return false;
  }
};

/**
 * Delete a conversation (both users can delete)
 */
export const deleteConversation = async (sentPopId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "sentPops", sentPopId));
    console.log("✅ Conversation deleted");
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }
};
