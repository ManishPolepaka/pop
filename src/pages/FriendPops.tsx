import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Loader, Users, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useFriendPops } from "@/hooks/useFriendPops";

const FriendPops = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriends(user?.uid || null);
  const { conversations, loading } = useFriendPops(user?.uid || null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.friendUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auth protection
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-300">
        <div className="text-center">
          <p className="text-xl font-black text-black mb-4">
            Please sign in to view POPs
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-white border-2 border-black font-bold text-black hover:bg-gray-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden pb-20">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          {/* Search Bar */}
          <div className="mb-6 relative">
                <div className="flex items-center bg-white border-4 border-black p-3">
              <Search className="h-5 w-5 text-black/70 mx-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-black font-bold text-base placeholder-black/50 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1 text-black/70 hover:text-black font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-6 w-6 text-black animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            // No Conversations State
            <div className="rounded-2xl bg-white border-4 border-black p-12 text-center space-y-4">
              <MessageCircle className="h-20 w-20 text-black/30 mx-auto" />
              <div>
                <p className="text-3xl font-black text-black mb-3">No conversations yet</p>
                <p className="text-black/70 font-semibold">
                  {friends.length === 0
                    ? "Add friends first to start conversations"
                    : "Send a POP to start a conversation"}
                </p>
              </div>
              <button
                onClick={() => navigate(friends.length === 0 ? "/friends" : "/main")}
                className="px-6 py-3 bg-yellow-400 border-3 border-black text-black font-black hover:bg-yellow-500 transition-all duration-200"
              >
                {friends.length === 0 ? "Add Friends" : "Go to Main"}
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            // No Search Results
            <div className="rounded-2xl bg-white border-4 border-black p-12 text-center space-y-4">
              <Search className="h-20 w-20 text-black/30 mx-auto" />
              <div>
                <p className="text-3xl font-black text-black mb-3">No results found</p>
                <p className="text-black/70 font-semibold">Try a different search query</p>
              </div>
            </div>
          ) : (
            // Conversations List
            <div className="space-y-4">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.sentPopId}
                  onClick={() => navigate(`/conversation/${conversation.friendId}`)}
                  className="bg-white border-4 border-black p-6 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-14 w-14 bg-purple-300 border-3 border-black flex items-center justify-center flex-shrink-0">
                        <Users className="h-7 w-7 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-black text-black">
                          {conversation.friendUsername}
                        </p>
                        <p className="text-sm font-semibold text-black/70 truncate">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs font-semibold text-black/50 mt-1">
                          {new Date(
                            conversation.lastMessageTime.seconds * 1000
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="ml-2 px-4 py-2 bg-red-600 text-white text-xs font-black rounded-lg flex-shrink-0">
                        {conversation.unreadCount}
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="ml-2 px-3 py-2 bg-yellow-200 border-3 border-black text-black text-xs font-black rounded-lg flex-shrink-0">
                      {conversation.status === "new" && "New"}
                      {conversation.status === "seen" && "Seen"}
                      {conversation.status === "replied" && "Replied"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FriendPops;
