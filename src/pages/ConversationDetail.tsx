import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getConversationWithFriend, replyToPOP, sendRandomPOPToFriend } from "@/firebase/friendPops";
import { SentPop } from "@/types/friendPop";

const ConversationDetail = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user);

  const [pops, setPops] = useState<SentPop[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [sendingPop, setSendingPop] = useState(false);
  const [friendInfo, setFriendInfo] = useState<any>(null);

  const userDisplayName = profile?.displayName || user?.displayName || "User";
  const userUsername = profile?.username || user?.email?.split("@")[0] || "user";

  // Load conversation
  useEffect(() => {
    const loadConversation = async () => {
      if (!user || !friendId) return;

      try {
        setLoading(true);
        const conversation = await getConversationWithFriend(user.uid, friendId);
        setPops(conversation);

        // Get friend info from first POP
        if (conversation.length > 0) {
          const firstPop = conversation[0];
          setFriendInfo({
            username: firstPop.fromUserId === user.uid ? firstPop.toUsername : firstPop.fromUsername,
            displayName: firstPop.fromUserId === user.uid ? firstPop.toUsername : firstPop.fromUsername,
          });
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [user, friendId]);

  const handleSendReply = async (popId: string) => {
    if (!replyText.trim() || !user) return;

    setSendingReply(true);
    try {
      await replyToPOP(popId, user.uid, userUsername, replyText);
      setReplyText("");
      
      // Reload conversation
      const updated = await getConversationWithFriend(user.uid, friendId!);
      setPops(updated);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendNewPOP = async () => {
    if (!user || !friendId) return;

    setSendingPop(true);
    try {
      const success = await sendRandomPOPToFriend(
        user.uid,
        userUsername,
        friendId,
        friendInfo?.username || "friend",
        ""
      );

      if (success) {
        // Reload conversation
        const updated = await getConversationWithFriend(user.uid, friendId);
        setPops(updated);
      }
    } catch (error) {
      console.error("Error sending POP:", error);
    } finally {
      setSendingPop(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center">
        <Loader className="h-8 w-8 text-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-yellow-300 border-b-4 border-black z-40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black text-black font-bold hover:bg-gray-100 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-black text-black">{friendInfo?.username || "Friend"}</h1>
              <p className="text-xs text-black/70">@{friendInfo?.username}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/profile/${friendId}`)}
            className="px-4 py-2 bg-white border-2 border-black hover:bg-gray-100 transition-all duration-200"
          >
            <User className="h-5 w-5 text-black" />
          </button>
        </div>
      </header>

      {/* Conversation Thread */}
      <main className="flex-1 overflow-y-auto px-5 py-6">
        {pops.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center">
            <p className="text-2xl font-black text-black mb-2">No messages yet</p>
            <p className="text-black/70 mb-6">Start the conversation with a POP!</p>
            <button
              onClick={handleSendNewPOP}
              disabled={sendingPop}
              className="px-6 py-3 bg-yellow-400 border-2 border-black text-black font-bold hover:bg-yellow-500 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {sendingPop ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send First POP
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {pops.map((pop) => (
              <div key={pop.id} className="space-y-3">
                {/* POP Message */}
                <div
                  className={`border-2 border-black p-5 ${
                    pop.fromUserId === user?.uid
                      ? "bg-yellow-400 ml-12"
                      : "bg-white mr-12"
                  }`}
                >
                  <p className="text-sm text-black/70 font-semibold mb-2">
                    {pop.fromUserId === user?.uid ? "You" : pop.fromUsername}
                  </p>
                  <p className="text-base text-black font-bold">{pop.popContent}</p>
                  <p className="text-xs text-black/60 mt-2">
                    {new Date(pop.sentAt.seconds * 1000).toLocaleString()}
                  </p>
                </div>

                {/* Replies to this POP */}
                {pop.replies && pop.replies.length > 0 && (
                  <div className="ml-6 space-y-3">
                    {pop.replies.map((reply, idx) => (
                      <div
                        key={idx}
                        className={`border-2 border-black p-4 ${
                          reply.from === user?.uid
                            ? "bg-blue-100 border-blue-400 ml-6"
                            : "bg-gray-100 mr-6"
                        }`}
                      >
                        <p className="text-xs text-black/70 font-semibold mb-1">
                          {reply.from === user?.uid ? "You" : reply.username}
                        </p>
                        <p className="text-sm text-black">{reply.message}</p>
                        <p className="text-xs text-black/60 mt-1">
                          {new Date(reply.sentAt.seconds * 1000).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input (only if recipient hasn't replied yet) */}
                {pop.status !== "replied" && pop.toUserId === user?.uid && (
                  <div className="ml-6 flex gap-2">
                    <input
                      type="text"
                      placeholder="Reply to this POP..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border-2 border-black font-semibold text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSendReply(pop.id);
                      }}
                    />
                    <button
                      onClick={() => handleSendReply(pop.id)}
                      disabled={!replyText.trim() || sendingReply}
                      className="px-4 py-2 bg-blue-400 border-2 border-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {sendingReply ? "..." : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-yellow-300 border-t-4 border-black px-5 py-4">
        <button
          onClick={handleSendNewPOP}
          disabled={sendingPop}
          className="w-full px-6 py-3 bg-yellow-400 border-2 border-black text-black font-bold hover:bg-yellow-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {sendingPop ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send New POP
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConversationDetail;
