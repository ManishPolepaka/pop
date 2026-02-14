import { useState, useEffect, useCallback } from "react";
import {
  sendRandomPOPToFriend,
  getMyConversations,
  getConversationWithFriend,
  replyToPOP,
  markPOPAsSeen,
  deleteConversation,
  getSentPopById,
} from "@/firebase/friendPops";
import { SentPop, PopConversation } from "@/types/friendPop";

export const useFriendPops = (userId: string | null) => {
  const [conversations, setConversations] = useState<PopConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<SentPop[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load my conversations on mount
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setCurrentConversation([]);
      return;
    }

    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const convos = await getMyConversations(userId);
        setConversations(convos);
        console.log("✅ Conversations loaded:", convos.length);
      } catch (err) {
        console.error("Error loading conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [userId]);

  // Open a specific conversation with a friend
  const openConversation = useCallback(
    async (friendId: string) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        setSelectedFriendId(friendId);

        const conversation = await getConversationWithFriend(userId, friendId);
        setCurrentConversation(conversation);

        // Mark the latest received POP as seen
        if (conversation.length > 0) {
          const lastPop = conversation[conversation.length - 1];
          if (lastPop.toUserId === userId && lastPop.status === "new") {
            await markPOPAsSeen(lastPop.id);
            // Update conversations list
            const updated = await getMyConversations(userId);
            setConversations(updated);
          }
        }

        console.log("✅ Conversation opened with friend:", friendId);
      } catch (err) {
        console.error("Error opening conversation:", err);
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Send a random POP to a friend
  const sendRandomPOP = useCallback(
    async (
      friendId: string,
      friendUsername: string,
      personalNote: string
    ) => {
      if (!userId) return null;

      try {
        setLoading(true);
        setError(null);

        const currentUser = await import("@/firebase/friends").then((m) =>
          m.getCurrentUserData(userId)
        );
        if (!currentUser) {
          throw new Error("Could not fetch user data");
        }

        const sentPopId = await sendRandomPOPToFriend(
          userId,
          currentUser.username,
          friendId,
          friendUsername,
          personalNote
        );

        if (sentPopId) {
          // Reload conversations
          const updated = await getMyConversations(userId);
          setConversations(updated);
          console.log("✅ Random POP sent");
          return sentPopId;
        }
      } catch (err) {
        console.error("Error sending random POP:", err);
        setError("Failed to send POP");
      } finally {
        setLoading(false);
      }
      return null;
    },
    [userId]
  );

  // Reply to a POP in the current conversation
  const replyToCurrentPOP = useCallback(
    async (sentPopId: string, message: string) => {
      if (!userId) return false;

      try {
        setLoading(true);
        setError(null);

        const currentUser = await import("@/firebase/friends").then((m) =>
          m.getCurrentUserData(userId)
        );
        if (!currentUser) {
          throw new Error("Could not fetch user data");
        }

        const success = await replyToPOP(
          sentPopId,
          userId,
          currentUser.username,
          message
        );

        if (success) {
          // Reload current conversation
          if (selectedFriendId) {
            await openConversation(selectedFriendId);
          }

          // Reload conversations list
          const updated = await getMyConversations(userId);
          setConversations(updated);

          console.log("✅ Reply sent");
          return true;
        }
      } catch (err) {
        console.error("Error replying to POP:", err);
        setError("Failed to send reply");
      } finally {
        setLoading(false);
      }
      return false;
    },
    [userId, selectedFriendId, openConversation]
  );

  // Delete a conversation
  const deleteCurrentConversation = useCallback(
    async (sentPopId: string) => {
      try {
        setLoading(true);
        setError(null);

        const success = await deleteConversation(sentPopId);

        if (success) {
          // Close current conversation
          setCurrentConversation([]);
          setSelectedFriendId(null);

          // Reload conversations list
          if (userId) {
            const updated = await getMyConversations(userId);
            setConversations(updated);
          }

          console.log("✅ Conversation deleted");
          return true;
        }
      } catch (err) {
        console.error("Error deleting conversation:", err);
        setError("Failed to delete conversation");
      } finally {
        setLoading(false);
      }
      return false;
    },
    [userId]
  );

  // Close current conversation view
  const closeConversation = useCallback(() => {
    setCurrentConversation([]);
    setSelectedFriendId(null);
  }, []);

  return {
    conversations,
    currentConversation,
    selectedFriendId,
    loading,
    error,
    openConversation,
    sendRandomPOP,
    replyToCurrentPOP,
    deleteCurrentConversation,
    closeConversation,
  };
};
