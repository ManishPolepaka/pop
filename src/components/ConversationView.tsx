import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader, Send } from "lucide-react";
import { PopMessage } from "./PopMessage";
import { ReplyMessage } from "./ReplyMessage";
import { SentPop } from "@/types/friendPop";

interface ConversationViewProps {
  conversation: SentPop[];
  currentUserId: string;
  friendUsername: string;
  loading: boolean;
  onBack: () => void;
  onReply: (sentPopId: string, message: string) => Promise<boolean>;
  onSendNewPOP: () => void;
}

export const ConversationView = ({
  conversation,
  currentUserId,
  friendUsername,
  loading,
  onBack,
  onReply,
  onSendNewPOP,
}: ConversationViewProps) => {
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation]);

  const handleSendReply = async () => {
    if (!replyText.trim() || conversation.length === 0) return;

    const lastPop = conversation[conversation.length - 1];
    setReplying(true);

    const success = await onReply(lastPop.id, replyText);
    if (success) {
      setReplyText("");
    }

    setReplying(false);
  };

  return (
    <div className="flex flex-col h-screen bg-yellow-300">
      {/* Header */}
      <header className="sticky top-0 bg-yellow-300 z-50 px-5 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="group flex items-center justify-center h-8 w-8 rounded-lg bg-white border-2 border-black hover:bg-gray-100 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 text-black" />
          </button>
          <div>
            <h1 className="text-xl font-black text-black">
              {friendUsername}
            </h1>
          </div>
        </div>
      </header>

      {/* Conversation Content */}
      <div className="relative z-10 flex-1 overflow-y-auto py-6 px-5">
          {loading && conversation.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-6 w-6 text-black animate-spin" />
            </div>
          ) : conversation.length === 0 ? (
            <div className="rounded-lg bg-white border-2 border-black p-12 text-center">
              <p className="text-black font-bold text-lg mb-2">
                No conversation yet
              </p>
              <p className="text-black/70">
                Send a random POP to start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* POPs and Replies */}
              {conversation.map((pop) => (
                <div key={pop.id}>
                  {/* The POP itself */}
                  <PopMessage
                    pop={pop}
                    isFromCurrentUser={pop.fromUserId === currentUserId}
                  />

                  {/* Replies to this POP */}
                  {pop.replies && pop.replies.length > 0 && (
                    <div className="ml-4 mt-3 border-l-4 border-black pl-4 space-y-2">
                      {pop.replies.map((reply, idx) => (
                        <ReplyMessage
                          key={idx}
                          reply={reply}
                          isFromCurrentUser={reply.from === currentUserId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Scroll anchor */}
              <div ref={scrollRef} />
            </div>
          )}
      </div>

      {/* Reply Input Area */}
      {conversation.length > 0 && (
        <div className="sticky bottom-0 bg-yellow-300 border-t-4 border-black px-5 py-4">
          <div className="space-y-3">
            {/* Reply Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !replying) {
                    handleSendReply();
                  }
                }}
                placeholder="Write your thoughts..."
                className="flex-1 bg-white border-2 border-black rounded-lg px-4 py-3 font-semibold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || replying}
                className="flex items-center justify-center h-12 px-6 bg-white border-2 border-black rounded-lg font-bold text-black hover:bg-gray-100 disabled:opacity-50 transition-all duration-200"
              >
                {replying ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={onSendNewPOP}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-3 font-bold text-black hover:bg-gray-100 transition-all duration-200"
            >
              ⚡ Send Another Random POP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
