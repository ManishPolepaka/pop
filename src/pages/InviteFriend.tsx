import { ArrowLeft, Search, MessageCircle, Send, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { searchUsersByUsername, sendPopInvitation, UserProfile } from "@/firebase/users";
import { toast } from "sonner";

interface FriendWithStatus extends UserProfile {
  id: string;
}

const InviteFriend = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search users by username
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setHasSearched(query.length > 0);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchUsersByUsername(query);
      
      // Filter out current user from results
      const filtered = results.filter((user) => user.uid !== user?.uid).map((user) => ({
        ...user,
        id: user.uid,
      }));

      setSearchResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPop = async (friendUsername: string, friendUid: string) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    try {
      await sendPopInvitation(user.uid, friendUsername);
      toast.success(`Pop sent to @${friendUsername}!`);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden flex flex-col">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-black/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-yellow-300 border-b-4 border-black z-40 py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate("/main")}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border-2 border-black hover:bg-gray-100 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </button>

          {/* Title */}
<h1 className="text-2xl font-black text-black">Send Pop to Friends</h1>

          {/* Spacer */}
          <div className="h-10 w-10" />
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-black" />
            <input
              type="text"
              placeholder="Search friends by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-12 bg-white border-2 border-black text-black pl-12 pr-4 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400 font-medium placeholder-black/50"
            />
          </div>
        </div>
      </header>

      {/* Friends List */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 text-black animate-spin" />
            </div>
          )}

          {!loading && hasSearched && searchResults.length > 0 && (
            searchResults.map((friend) => (
              <div
                key={friend.id}
                className="bg-white rounded-2xl border-4 border-black p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-black">@{friend.username}</h3>
                      <div
                        className={`h-3 w-3 rounded-full border-2 border-black ${
                          friend.status === "online" ? "bg-green-400" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <p className="text-sm text-black/70 font-medium mt-1">{friend.email}</p>
                  </div>
                  <button
                    onClick={() => handleSendPop(friend.username, friend.uid)}
                    className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-400 border-2 border-black hover:bg-yellow-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Send className="h-6 w-6 text-black" />
                  </button>
                </div>
              </div>
            ))
          )}

          {!loading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl font-black text-black">No users found</p>
              <p className="text-black/70 font-medium mt-2">Try searching with a different username</p>
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-12">
              <p className="text-2xl font-black text-black">Search for friends</p>
              <p className="text-black/70 font-medium mt-2">Enter a username to find and send pop messages</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Messages Icon */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <button className="flex items-center justify-center h-14 w-14 rounded-lg bg-white border-2 border-black hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
          <MessageCircle className="h-7 w-7 text-black" />
        </button>
      </div>
    </div>
  );
};

export default InviteFriend;
