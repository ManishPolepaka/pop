import { SentPop } from "@/types/friendPop";
import { format } from "date-fns";

interface PopMessageProps {
  pop: SentPop;
  isFromCurrentUser: boolean;
}

export const PopMessage = ({ pop, isFromCurrentUser }: PopMessageProps) => {
  const timestamp = format(pop.sentAt.toDate(), "MMM d, h:mm a");

  return (
    <div
      className={`mb-4 flex ${
        isFromCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-md rounded-xl border-2 p-5 ${
          isFromCurrentUser
            ? "border-yellow-500 bg-yellow-100"
            : "border-blue-500 bg-blue-100"
        }`}
      >
        {/* POP Content */}
        <div className="mb-3">
          <p className="text-lg font-bold text-black">
            💡 {pop.popContent}
          </p>
        </div>

        {/* Personal Note */}
        {pop.personalNote && (
          <div className="mb-3 border-t-2 border-current pt-2">
            <p className="text-sm font-semibold text-black/80">
              💭 {pop.personalNote}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-black/70">
          <span>{isFromCurrentUser ? "YOU SENT" : `${pop.fromUsername} SENT`}</span>
          <span className="ml-2">{timestamp}</span>
        </div>

        {/* Status Badge */}
        <div className="mt-2">
          {pop.status === "new" && (
            <span className="inline-block rounded-full bg-red-200 px-2 py-1 text-xs font-bold text-red-700">
              🔴 New
            </span>
          )}
          {pop.status === "seen" && (
            <span className="inline-block rounded-full bg-yellow-200 px-2 py-1 text-xs font-bold text-yellow-700">
              👀 Seen
            </span>
          )}
          {pop.status === "replied" && (
            <span className="inline-block rounded-full bg-green-200 px-2 py-1 text-xs font-bold text-green-700">
              ✅ Replied
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
