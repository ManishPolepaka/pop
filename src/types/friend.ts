import { Timestamp } from "firebase/firestore";

/**
 * Friend Request Status
 */
export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

/**
 * Friend Request interface
 */
export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}

/**
 * Extended User interface (includes friend lists)
 */
export interface UserFriendInfo {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  status?: "online" | "offline";
  lastSeen?: Timestamp;
  friends: string[]; // Array of friend UIDs
  receivedRequests: string[]; // Array of request IDs
  sentRequests: string[]; // Array of request IDs
}

/**
 * Friend (simplified view)
 */
export interface Friend {
  uid: string;
  username: string;
  displayName: string;
  status?: "online" | "offline";
  lastSeen?: Timestamp;
  isFriend: boolean;
  requestStatus?: FriendRequestStatus;
}

/**
 * User search result
 */
export interface UserSearchResult {
  uid: string;
  username: string;
  displayName: string;
  status: "online" | "offline";
  relationshipStatus: "friend" | "pending_sent" | "pending_received" | "none";
}
