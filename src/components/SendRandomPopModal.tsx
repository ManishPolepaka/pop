import { useState } from "react";
import { X, Loader, Users } from "lucide-react";
import { Friend } from "@/types/friend";

interface SendRandomPopModalProps {
  isOpen: boolean;
  friends: Friend[];
  loading: boolean;
  onClose: () => void;
  onSend: (friendId: string, friendUsername: string, note: string) => Promise<void>;
}

export const SendRandomPopModal = ({
  isOpen,
  friends,
  loading,
  onClose,
  onSend,
}: SendRandomPopModalProps) => {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const selectedFriend = friends.find((f) => f.uid === selectedFriendId);
  const filteredFriends = friends.filter(
    (f) =>
      f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!selectedFriend) return;

    setSending(true);
    try {
      await onSend(selectedFriend.uid, selectedFriend.username, personalNote);
      // Reset form
      setSelectedFriendId(null);
      setPersonalNote("");
      setSearchQuery("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-yellow-300 border-4 border-black rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-yellow-300 border-b-4 border-black p-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-black">Send Random POP</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border-2 border-black hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Friend Selection */}
          <div>
            <label className="block text-lg font-bold text-black mb-3">
              Choose a Friend:
            </label>

            {/* Search */}
            <input
              type="text"
              placeholder="Search friend..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 mb-3 font-semibold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* Friends List */}
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader className="h-6 w-6 text-black animate-spin" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="rounded-lg bg-white border-2 border-black p-6 text-center">
                <Users className="h-8 w-8 text-black/40 mx-auto mb-2" />
                <p className="text-black/70 font-semibold">
                  {friends.length === 0
                    ? "You have no friends yet"
                    : "No friends match your search"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.uid}
                    onClick={() => setSelectedFriendId(friend.uid)}
                    className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all duration-200 border-2 ${
                      selectedFriendId === friend.uid
                        ? "bg-green-300 border-black"
                        : "bg-white border-black hover:bg-gray-100"
                    }`}
                  >
                    <p className="text-black">👤 {friend.displayName}</p>
                    <p className="text-xs text-black/70">@{friend.username}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Personal Note */}
          {selectedFriend && (
            <div>
              <label className="block text-lg font-bold text-black mb-2">
                Add a Personal Note (optional):
              </label>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="What made you think of them?..."
                maxLength={150}
                className="w-full bg-white border-2 border-black rounded-lg px-4 py-3 font-semibold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black resize-none h-24"
              />
              <p className="text-xs text-black/60 mt-1">
                {personalNote.length}/150 characters
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-white border-2 border-black p-4">
            <p className="text-sm font-semibold text-black mb-2">
              ✨ A Random POP will be selected
            </p>
            <p className="text-xs text-black/70">
              Neither of you will know which question until they open it!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 bg-gray-200 border-2 border-black rounded-lg px-4 py-3 font-bold text-black hover:bg-gray-300 disabled:opacity-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedFriend || sending}
              className="flex-1 bg-yellow-400 border-2 border-black rounded-lg px-4 py-3 font-bold text-black hover:bg-yellow-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "⚡ Send Random POP"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
