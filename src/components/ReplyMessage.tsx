import { PopReply } from "@/types/friendPop";
import { format } from "date-fns";

interface ReplyMessageProps {
  reply: PopReply;
  isFromCurrentUser: boolean;
}

export const ReplyMessage = ({ reply, isFromCurrentUser }: ReplyMessageProps) => {
  const timestamp = format(reply.sentAt.toDate(), "h:mm a");

  return (
    <div
      className={`mb-3 flex ${
        isFromCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-md rounded-lg border-2 p-4 ${
          isFromCurrentUser
            ? "border-yellow-400 bg-yellow-50"
            : "border-blue-400 bg-blue-50"
        }`}
      >
        <p className="text-sm font-semibold text-black">
          {isFromCurrentUser ? "You" : reply.username}
        </p>
        <p className="mt-1 text-black">{reply.message}</p>
        <p className="mt-2 text-xs text-black/60">{timestamp}</p>
      </div>
    </div>
  );
};
