import { useEffect, useState } from "react";
import { X, Bell, Lightbulb } from "lucide-react";
import { Button } from "./ui/button";

interface NotificationPopupProps {
  message: string;
  popContent?: string;  // The actual POP message
  onDismiss: () => void;
}

const NotificationPopup = ({ message, popContent, onDismiss }: NotificationPopupProps) => {
  const [isShaking, setIsShaking] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const displayContent = popContent || message || "Take a moment to relax and reflect";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`relative w-full max-w-2xl rounded-3xl bg-white border-4 border-black p-8 shadow-2xl ${
          isShaking ? "animate-bounce" : ""
        }`}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-black" />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          {/* Icon */}
          <div className="h-16 w-16 rounded-full bg-yellow-300 flex items-center justify-center border-2 border-black animate-pulse">
            <Lightbulb className="h-8 w-8 text-black" />
          </div>
          
          {/* Content */}
          <div className="space-y-4 w-full">
            <h2 className="text-3xl font-black text-black">
              Pop!
            </h2>
            <div className="bg-yellow-100 border-2 border-black rounded-2xl p-8 w-full">
              <p className="text-black text-xl font-semibold leading-relaxed break-words">
                {displayContent}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-4">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-3 bg-yellow-300 border-2 border-black rounded-lg font-bold text-black hover:bg-yellow-400 transition-all duration-200"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
