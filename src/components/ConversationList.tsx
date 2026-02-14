import { ArrowLeft, MessageSquare, Loader } from "lucide-react";
import { PopConversation } from "@/types/friendPop";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: PopConversation[];
  loading: boolean;
  onBack: () => void;
  onSelectConversation: (friendId: string) => void;
  onSendPOP: () => void;
}

export const ConversationList = ({
  conversations,
  loading,
  onBack,
  onSelectConversation,
  onSendPOP,
}: ConversationListProps) => {
  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden flex flex-col">
      {/* Main Content */}
      <section className="relative z-10 flex-1 overflow-y-auto py-6 px-5">
        <div className="space-y-4">
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-6 w-6 text-black animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            /* Empty State */
            <div className="rounded-lg bg-white border-2 border-black p-12 text-center">
              <MessageSquare className="h-12 w-12 text-black/40 mx-auto mb-4" />
              <p className="text-black font-bold text-lg mb-2">
                No conversations yet
              </p>
              <p className="text-black/70">
                Send a POP to a friend to start a conversation!
              </p>
            </div>
          ) : (
            /* Conversation Items */
            conversations.map((conv) => (
              <button
                key={conv.friendId}
                onClick={() => onSelectConversation(conv.friendId)}
                className="w-full bg-white rounded-2xl border-2 border-black p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-black">
                      👤 {conv.friendDisplayName}
                    </p>
                    <p className="text-sm text-black/70">
                      @{conv.friendUsername}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {conv.unreadCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-300 border-2 border-black text-xs font-bold text-black">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Last Message Preview */}
                <p className="text-black/80 mb-2 line-clamp-2">
                  💬 {conv.lastMessage}
                </p>

                {/* Time and Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/60">
                    {formatDistanceToNow(conv.lastMessageTime.toDate(), {
                      addSuffix: true,
                    })}
                  </span>

                  {conv.status === "new" && (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                      🔴 New
                    </span>
                  )}
                  {conv.status === "replied" && (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                      ✅ Replied
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Footer Button */}
      <div className="sticky bottom-0 bg-yellow-300 border-t-4 border-black px-5 py-4">
        <button
          onClick={onSendPOP}
          className="w-full bg-white border-2 border-black rounded-xl px-6 py-4 font-bold text-black hover:bg-gray-100 transition-all duration-200 text-lg"
        >
          ⚡ Send Random POP to Friend
        </button>
      </div>
    </div>
  );
};
