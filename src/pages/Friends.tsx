import { useState } from "react";
import { SearchIcon, UserPlus, Loader, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";

const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
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
  } = useFriends(user?.uid || null);

  const [activeTab, setActiveTab] = useState<"friends" | "search" | "requests">("friends");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    } else {
      clearSearch();
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden">
      {/* Main Content */}
      <section className="relative z-10 py-0 px-5 pt-1">
        <div>
          {/* Error Message */}
          {error && (
            <div className="mb-2 bg-red-100 border-2 border-red-500 p-3 text-red-700 font-bold text-sm">
              ❌ {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="sticky top-0 mb-4 flex gap-3 bg-white border-4 border-black p-2 z-30">
            <button
              onClick={() => {
                setActiveTab("friends");
                clearSearch();
                setSearchQuery("");
              }}
              className={`flex-1 py-3 px-4 font-black text-base transition-all duration-300 ${
                activeTab === "friends"
                  ? "bg-yellow-400 text-black border-3 border-black"
                  : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => {
                setActiveTab("requests");
                clearSearch();
                setSearchQuery("");
              }}
              className={`flex-1 py-3 px-4 font-black text-base transition-all duration-300 relative ${
                activeTab === "requests"
                  ? "bg-yellow-400 text-black border-3 border-black"
                  : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="absolute top-0 right-1 bg-red-600 text-white text-xs font-black w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-3 px-4 font-black text-base transition-all duration-300 ${
                activeTab === "search"
                  ? "bg-yellow-400 text-black border-3 border-black"
                  : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              Add
            </button>
          </div>

          {/* My Friends Tab */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="rounded-2xl bg-white border-4 border-black p-12 text-center space-y-4">
                  <Users className="h-20 w-20 text-black/30 mx-auto" />
                  <div>
                    <p className="text-3xl font-black text-black mb-2">No friends yet</p>
                    <p className="text-black/70 font-semibold">
                    Search for friends using the "Add Friends" tab to get started!
                  </p>
                </div>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.uid}
                    className="bg-white rounded-2xl border-4 border-black p-6 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-14 w-14 bg-yellow-300 border-3 border-black flex items-center justify-center flex-shrink-0">
                        <Users className="h-7 w-7 text-black" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-black text-black">{friend.displayName}</p>
                        <p className="text-xs font-semibold text-black/70">@{friend.username}</p>
                        {friend.status && (
                          <p className={`text-xs font-semibold ${friend.status === "online" ? "text-green-600" : "text-gray-600"}`}>
                            {friend.status === "online" ? "🟢 Online" : "⚪ Offline"}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${friend.uid}`)}
                      disabled={loading}
                      className="px-5 py-2 bg-blue-400 border-3 border-black text-black font-black hover:bg-blue-500 transition-all duration-200 disabled:opacity-50 text-xs flex-shrink-0"
                    >
                      {loading ? "..." : "View Profile"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="rounded-2xl bg-white border-4 border-black p-12 text-center space-y-4">
                  <UserPlus className="h-20 w-20 text-black/30 mx-auto" />
                  <div>
                    <p className="text-3xl font-black text-black mb-2">No pending requests</p>
                    <p className="text-black/70 font-semibold">
                      When friends send you requests, they'll appear here.
                    </p>
                  </div>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl border-4 border-black p-6 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-14 w-14 bg-blue-300 border-3 border-black flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-7 w-7 text-black" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-black">{request.fromDisplayName}</p>
                        <p className="text-xs font-semibold text-black/70">@{request.fromUsername}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <button
                        onClick={() => acceptRequest(request.id, request.fromUserId)}
                        disabled={loading}
                        className="px-5 py-2 bg-green-400 border-3 border-black text-black font-black hover:bg-green-500 transition-all duration-200 disabled:opacity-50 text-xs"
                      >
                        {loading ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() => declineRequest(request.id, request.fromUserId)}
                        disabled={loading}
                        className="px-5 py-2 bg-gray-300 border-3 border-black text-black font-black hover:bg-gray-400 transition-all duration-200 disabled:opacity-50 text-xs"
                      >
                        {loading ? "..." : "Decline"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <div className="flex items-center bg-white border-4 border-black p-3">
                  <SearchIcon className="h-5 w-5 text-black/70 mx-3" />
                  <input
                    type="text"
                    placeholder="Search by username (e.g., manish6196)"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent text-black font-bold text-base placeholder-black/50 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch("")}
                      className="px-3 py-1 text-black/70 hover:text-black font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {loading && (
                <div className="flex justify-center py-12">
                  <Loader className="h-6 w-6 text-black animate-spin" />
                </div>
              )}

              {!loading && searchResults.length === 0 && searchQuery && (
                <div className="rounded-2xl bg-white border-4 border-black p-12 text-center space-y-4">
                  <SearchIcon className="h-20 w-20 text-black/30 mx-auto" />
                  <div>
                    <p className="text-3xl font-black text-black mb-2">No results found</p>
                    <p className="text-black/70 font-semibold">Try searching with a different username</p>
                  </div>
                </div>
              )}

              {!loading &&
                searchResults.map((result) => (
                  <div
                    key={result.uid}
                    className="bg-white rounded-2xl border-4 border-black p-6 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-14 w-14 bg-purple-300 border-3 border-black flex items-center justify-center flex-shrink-0">
                        <Users className="h-7 w-7 text-black" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-black">{result.displayName}</p>
                        <p className="text-xs font-semibold text-black/70">@{result.username}</p>
                      </div>
                    </div>
                    <button
                      disabled={
                        loading ||
                        result.relationshipStatus === "friend" ||
                        result.relationshipStatus === "pending_sent" ||
                        result.relationshipStatus === "pending_received"
                      }
                      onClick={() => sendRequest(result.uid, result.username)}
                      className={`px-5 py-2 font-black text-xs border-3 transition-all duration-200 flex-shrink-0 ${
                        result.relationshipStatus === "friend"
                          ? "bg-gray-300 border-black text-black/70 cursor-not-allowed"
                          : result.relationshipStatus === "pending_sent"
                            ? "bg-blue-300 border-black text-black cursor-not-allowed"
                            : result.relationshipStatus === "pending_received"
                              ? "bg-yellow-300 border-black text-black cursor-not-allowed"
                              : "bg-yellow-400 border-black text-black hover:bg-yellow-500"
                      }`}
                    >
                      {result.relationshipStatus === "friend"
                        ? "Friends"
                        : result.relationshipStatus === "pending_sent"
                          ? "Pending"
                          : result.relationshipStatus === "pending_received"
                            ? "React"
                            : "Add"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Friends;
