import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

const FEATURE_TAGS = [
  { id: "insights", label: "🔭 Insights & Analysis" },
  { id: "reminders", label: "⏰ Better Reminders" },
  { id: "social", label: "👥 Social Features" },
  { id: "ai_coaching", label: "🤖 AI Coaching" },
  { id: "habit_tracking", label: "📈 Habit Tracking" },
  { id: "progress_reports", label: "📊 Progress Reports" },
  { id: "notifications", label: "🔔 Smarter Notifications" },
  { id: "other", label: "✨ Something Else" },
];

interface FeedbackProps {
  embedded?: boolean;
  onBack?: () => void;
}

const Feedback = ({ embedded = false, onBack }: FeedbackProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!message.trim() && selectedTags.length === 0) {
      setError("Please write something or select at least one option.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "feedback"), {
        userId: user?.uid ?? "anonymous",
        displayName: user?.displayName ?? "Anonymous",
        email: user?.email ?? null,
        message: message.trim(),
        tags: selectedTags,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (embedded) {
      onBack?.();
      return;
    }

    navigate(-1);
  };

  return (
    <div className={embedded ? "w-full" : "min-h-dvh bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-200 flex flex-col"}>
      {/* Header */}
      {!embedded && (
      <header className="sticky top-0 bg-yellow-300/95 backdrop-blur-sm border-b border-black/15 z-40 pt-safe">
        <div className="px-5 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-100 border border-black/20 hover:bg-yellow-200 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </button>
          <h1 className="text-2xl font-black text-black">Feedback</h1>
        </div>
      </header>
      )}

      <main className={embedded ? "space-y-6 max-w-lg mx-auto w-full" : "flex-1 px-5 py-6 space-y-6 max-w-lg mx-auto w-full"}>
        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
            <div className="bg-yellow-100 rounded-2xl border border-black/15 p-8 w-full space-y-4 shadow-sm">
              <CheckCircle className="h-16 w-16 text-black mx-auto" />
              <h2 className="text-2xl font-black text-black">Thank you!</h2>
              <p className="text-base font-semibold text-black/70">
                Your feedback helps us build a better app for everyone. We read every single response.
              </p>
              <button
                onClick={handleBack}
                className="w-full rounded-xl bg-black text-yellow-300 font-black text-base py-3 px-5 border border-black hover:bg-yellow-300 hover:text-black transition-all duration-200 shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]"
              >
                {embedded ? "Back to Feed" : "Back to App"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Intro */}
            <div className="bg-yellow-100 rounded-2xl border border-black/15 p-5 shadow-sm">
              <p className="text-xl font-black text-black leading-snug">
                What do you want more from Pop?
              </p>
              <p className="text-sm font-semibold text-black/60 mt-1">
                We're actively building — your voice shapes what comes next.
              </p>
            </div>

            {/* Quick Tags */}
            <div className="space-y-3">
              <p className="text-sm font-black text-black uppercase tracking-wider">
                Pick what excites you
              </p>
              <div className="grid grid-cols-2 gap-3">
                {FEATURE_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`text-left px-4 py-3 rounded-xl border border-black/20 font-bold text-sm transition-all duration-200 ${
                        active
                          ? "bg-black text-yellow-300"
                          : "bg-yellow-100 text-black hover:bg-yellow-200"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Free Text */}
            <div className="space-y-3">
              <p className="text-sm font-black text-black uppercase tracking-wider">
                Tell us more (optional)
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's missing? What would make this app awesome for you?"
                rows={5}
                maxLength={1000}
                className="w-full rounded-2xl bg-yellow-100 border border-black/20 p-4 text-black font-semibold text-base placeholder:text-black/40 resize-none focus:outline-none focus:border-black/35"
              />
              <p className="text-xs font-semibold text-black/50 text-right">
                {message.length}/1000
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 rounded-xl border border-red-300 p-4">
                <p className="text-sm font-black text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black text-yellow-300 font-black text-base py-4 border border-black hover:bg-yellow-300 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Feedback
                </>
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default Feedback;
