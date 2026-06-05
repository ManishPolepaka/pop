import { useState } from "react";
import { X, Lightbulb } from "lucide-react";

interface NotificationPopupProps {
  message: string;
  popContent?: string;
  onDismiss: (answer?: string) => void | Promise<void>;
}

const NotificationPopup = ({ message, popContent, onDismiss }: NotificationPopupProps) => {
  const [answer, setAnswer] = useState("");

  const displayContent = popContent || message || "Take a moment to relax and reflect";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/55 backdrop-blur-sm p-3 md:p-4">
      <div
        className="relative w-full max-w-xl bg-yellow-100 border border-black/20 p-5 md:p-7 shadow-2xl rounded-t-2xl md:rounded-2xl animate-pop-entry-bounce"
      >
        <button
          onClick={() => onDismiss()}
          className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-black hover:bg-yellow-200 transition-colors"
        >
          <X className="h-5 w-5 text-black" />
        </button>

        <div className="flex flex-col items-center text-center gap-4 md:gap-6">
          {/* Icon */}
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-yellow-300 flex items-center justify-center border border-black/25 transition-transform duration-300 shadow-sm">
            <Lightbulb className="h-7 w-7 md:h-8 md:w-8 text-black" />
          </div>
          
          {/* Content */}
          <div className="space-y-3 w-full">
            <h2 className="text-2xl md:text-3xl font-black text-black">
              Pop!
            </h2>
            <div className="bg-yellow-50 border border-black/20 rounded-2xl p-4 md:p-6 w-full shadow-sm">
              <p className="text-black text-lg md:text-xl font-semibold leading-relaxed break-words">
                {displayContent}
              </p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here, or skip for now..."
              className="w-full min-h-24 bg-white border border-black/20 rounded-2xl p-3 text-black font-semibold resize-none focus:outline-none focus:bg-yellow-50 focus:border-black/35"
              maxLength={280}
            />
            <p className="text-xs font-bold text-black/50 text-right">
              {answer.trim().length}/280
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full pt-1">
            <button
              onClick={() => onDismiss(answer)}
              className="w-full px-4 py-3 bg-black border border-black rounded-xl font-bold text-yellow-300 hover:bg-yellow-300 hover:text-black transition-all duration-200 disabled:opacity-40 shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]"
              disabled={!answer.trim()}
            >
              Save Answer
            </button>
            <button
              onClick={() => onDismiss()}
              className="w-full px-4 py-3 bg-white border border-black/25 rounded-xl font-bold text-black hover:bg-yellow-50 transition-all duration-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
