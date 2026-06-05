import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme, type AppTheme } from "@/contexts/ThemeContext";

interface SettingsProps {
  embedded?: boolean;
  onBack?: () => void;
}

const THEME_OPTIONS: Array<{
  id: AppTheme;
  title: string;
  description: string;
}> = [
  {
    id: "modern",
    title: "Modern (Default)",
    description: "Clean rounded cards, softer borders, and the updated yellow style.",
  },
  {
    id: "classic",
    title: "Classic",
    description: "Brighter yellow and stronger contrast similar to the previous UI style.",
  },
];

const Settings = ({ embedded = false, onBack }: SettingsProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleBack = () => {
    if (embedded) {
      onBack?.();
      return;
    }
    navigate(-1);
  };

  return (
    <div className={embedded ? "w-full" : "min-h-dvh bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-200 flex flex-col"}>
      {!embedded && (
        <header className="sticky top-0 bg-yellow-300/95 backdrop-blur-sm border-b border-black/15 z-40 pt-safe">
          <div className="px-5 py-4 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 border border-black/20 hover:bg-yellow-200 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-black" />
            </button>
            <h1 className="text-2xl font-black text-black">Settings</h1>
          </div>
        </header>
      )}

      <main className={embedded ? "space-y-4 max-w-lg mx-auto w-full" : "flex-1 px-5 py-6 space-y-4 max-w-lg mx-auto w-full"}>
        <div className="bg-yellow-100 border border-black/15 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-black text-black/50 uppercase tracking-widest mb-2">Appearance</p>
          <p className="text-xl font-black text-black">Choose app theme</p>
          <p className="text-sm font-semibold text-black/60 mt-1">
            Changes apply instantly across the app and stay saved for next time.
          </p>
        </div>

        <div className="space-y-3">
          {THEME_OPTIONS.map((option) => {
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 ${
                  isActive
                    ? "border-black bg-black text-yellow-300 shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]"
                    : "border-black/15 bg-yellow-100 text-black hover:bg-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black">{option.title}</p>
                    <p className={`mt-1 text-sm font-semibold ${isActive ? "text-yellow-300/80" : "text-black/65"}`}>
                      {option.description}
                    </p>
                  </div>
                  {isActive && (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-yellow-300/60 bg-yellow-300/20 shrink-0">
                      <Check className="h-4 w-4 text-yellow-300" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Settings;

