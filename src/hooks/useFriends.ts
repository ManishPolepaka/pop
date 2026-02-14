import { useState, useEffect, useCallback } from "react";
import {
  searchUsersByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriendsList,
  getPendingRequests,
  getFriendDetails,
  getCurrentUserData,
} from "@/firebase/friends";
import { FriendRequest, UserSearchResult, Friend } from "@/types/friend";

export const useFriends = (userId: string | null) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load friends and pending requests on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setPendingRequests([]);
      return;
    }

    const loadFriendsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [friendsList, requests] = await Promise.all([
          getFriendsList(userId),
          getPendingRequests(userId),
        ]);

        setFriends(friendsList);
        setPendingRequests(requests);
        console.log("✅ Friends loaded:", friendsList.length);
        console.log("✅ Pending requests:", requests.length);
      } catch (err) {
        console.error("Error loading friends data:", err);
        setError("Failed to load friends");
      } finally {
        setLoading(false);
      }
    };

    loadFriendsData();
  }, [userId]);

  // Search users
  const searchUsers = useCallback(
    async (query: string) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const results = await searchUsersByUsername(query, userId);
        setSearchResults(results);
        console.log("✅ Search results:", results.length);
      } catch (err) {
        console.error("Error searching users:", err);
        setError("Search failed");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Send friend request
  const sendRequest = useCallback(
    async (toUserId: string, toUsername: string) => {
      if (!userId) return null;

      try {
        // Optimistic update - show "Pending" immediately
        setSearchResults((prev) =>
          prev.map((user) =>
            user.uid === toUserId
              ? { ...user, relationshipStatus: "pending_sent" }
              : user
          )
        );

        setLoading(true);
        setError(null);

        // Get current user's data
        const currentUser = await getCurrentUserData(userId);
        if (!currentUser) {
          throw new Error("Could not fetch current user data");
        }

        const requestId = await sendFriendRequest(
          userId,
          currentUser.username,
          currentUser.displayName,
          toUserId
        );

        if (requestId) {
          console.log("✅ Friend request sent:", requestId);
          return requestId;
        } else {
          // If request failed, revert the optimistic update
          setSearchResults((prev) =>
            prev.map((user) =>
              user.uid === toUserId
                ? { ...user, relationshipStatus: "none" }
                : user
            )
          );
          setError("Failed to send request");
          return null;
        }
      } catch (err) {
        console.error("Error sending friend request:", err);
        // Revert optimistic update on error
        setSearchResults((prev) =>
          prev.map((user) =>
            user.uid === toUserId
              ? { ...user, relationshipStatus: "none" }
              : user
          )
        );
        setError("Failed to send request");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Accept friend request
  const acceptRequest = useCallback(
    async (requestId: string, fromUserId: string) => {
      try {
        setLoading(true);
        setError(null);
        const success = await acceptFriendRequest(requestId, fromUserId, userId!);

        if (success) {
          // Reload all friend data to reflect changes
          const [updatedFriends, updatedRequests] = await Promise.all([
            getFriendsList(userId!),
            getPendingRequests(userId!),
          ]);

          setFriends(updatedFriends);
          setPendingRequests(updatedRequests);

          console.log("✅ Friend request accepted (may have auto-accepted bidirectional request)");
          return true;
        }
      } catch (err) {
        console.error("Error accepting request:", err);
        setError("Failed to accept request");
      } finally {
        setLoading(false);
      }
      return false;
    },
    [userId]
  );

  // Decline friend request
  const declineRequest = useCallback(
    async (requestId: string, fromUserId: string) => {
      try {
        setLoading(true);
        setError(null);
        const success = await declineFriendRequest(requestId, fromUserId, userId!);

        if (success) {
          // Remove from pending requests
          setPendingRequests((prev) =>
            prev.filter((req) => req.id !== requestId)
          );
          console.log("✅ Friend request declined");
          return true;
        }
      } catch (err) {
        console.error("Error declining request:", err);
        setError("Failed to decline request");
      } finally {
        setLoading(false);
      }
      return false;
    },
    [userId]
  );

  // Remove friend
  const removeCurrentFriend = useCallback(
    async (friendUserId: string) => {
      if (!userId) return false;

      try {
        setLoading(true);
        setError(null);
        const success = await removeFriend(userId, friendUserId);

        if (success) {
          // Remove from friends list
          setFriends((prev) =>
            prev.filter((friend) => friend.uid !== friendUserId)
          );
          console.log("✅ Friend removed");
          return true;
        }
      } catch (err) {
        console.error("Error removing friend:", err);
        setError("Failed to remove friend");
      } finally {
        setLoading(false);
      }
      return false;
    },
    [userId]
  );

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    friends,
    pendingRequests,
    searchResults,
    loading,
    error,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeCurrentFriend,
    clearSearch,
  };
};
