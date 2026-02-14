import { Timestamp } from "firebase/firestore";

/**
 * Reply to a POP message
 */
export interface PopReply {
  from: string; // userId
  username: string;
  message: string;
  sentAt: Timestamp;
}

/**
 * Sent POP (conversation between two friends)
 */
export interface SentPop {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  popId: string; // Reference to pops collection
  popContent: string; // The actual question
  personalNote: string; // Sender's note with the POP
  status: "new" | "seen" | "replied"; // Recipient's view status
  sentAt: Timestamp;
  seenAt?: Timestamp;
  replies: PopReply[]; // Conversation thread
}

/**
 * Conversation summary (for list view)
 */
export interface PopConversation {
  sentPopId: string; // ID of the original POP
  friendId: string;
  friendUsername: string;
  friendDisplayName: string;
  lastMessage: string; // Last reply or the POP itself
  lastMessageTime: Timestamp;
  unreadCount: number;
  status: "new" | "seen" | "replied";
}

/**
 * Send POP request payload
 */
export interface SendPopRequest {
  toUserId: string;
  toUsername: string;
  personalNote: string;
  // popId is selected randomly by backend
}
