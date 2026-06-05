import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import CustomTimePicker from "@/components/CustomTimePicker";

interface AddReminderFormProps {
  onAdd: (time: { type: "recurring" | "schedule"; value: string; interval?: number; days?: number[]; name?: string; repeatMode?: "once" | "daily" | "weekly"; intentType?: "break-distraction" | "stay-productive" } | string) => void;
  onReminderTypeChange?: (type: "schedule" | "recurring") => void;
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INTERVAL_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "4 hours", value: 240 },
  { label: "Custom", value: -1 },
];

const AddReminderForm = ({ onAdd, onReminderTypeChange }: AddReminderFormProps) => {
  const [timeType, setTimeType]       = useState<"schedule" | "recurring">("schedule");
  const [time, setTime]               = useState("");
  const [interval, setInterval]       = useState("");
  const [intervalPreset, setIntervalPreset] = useState<number | null>(null);
  const [customHours, setCustomHours]         = useState(0);
  const [customMins, setCustomMins]           = useState(0);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [name, setName]               = useState("");
  const [repeatMode, setRepeatMode]   = useState<"once" | "daily" | "weekly">("once");
  const [intentType, setIntentType]   = useState<"break-distraction" | "stay-productive">("break-distraction");

  const canSubmit = useMemo(() => {
    if (timeType === "recurring") {
      return intervalPreset === -1 ? !!interval : intervalPreset !== null;
    }
    if (!time) return false;
    if (repeatMode === "daily") return true;
    return selectedDays.length > 0;
  }, [timeType, time, interval, intervalPreset, selectedDays, repeatMode]);

  const summaryText = useMemo(() => {
    if (timeType === "recurring") {
      const mins = intervalPreset === -1 ? parseInt(interval) : intervalPreset;
      if (!mins || mins <= 0) return null;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const label = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
      return `Every ${label}`;
    }
    if (!time) return null;
    if (repeatMode === "daily") return `Every day at ${time}`;
    if (selectedDays.length === 0) return null;
    const dayStr = selectedDays.map((d) => DAY_NAMES[d]).join(", ");
    if (repeatMode === "weekly") return `Every ${dayStr} at ${time}`;
    return `Once on ${dayStr} at ${time}`;
  }, [timeType, time, interval, intervalPreset, selectedDays, repeatMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (timeType === "schedule") {
      onAdd({ type: "schedule", value: time, days: selectedDays, name, repeatMode, intentType });
      setTime("");
      setSelectedDays([]);
      setName("");
      setRepeatMode("once");
    } else {
      const mins = intervalPreset === -1 ? parseInt(interval, 10) : (intervalPreset ?? 0);
      onAdd({ type: "recurring", value: "", interval: mins, name, intentType });
      setInterval("");
      setIntervalPreset(null);
      setCustomHours(0);
      setCustomMins(0);
      setName("");
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-black/15">

      {/* â”€â”€ Label â”€â”€ */}
      <div className="pb-4">
        <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
          Label{" "}
          <span className="text-black/40 normal-case font-semibold tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="w-full h-12 rounded-xl bg-white border border-black/20 text-black text-base font-semibold px-4 focus:outline-none focus:bg-yellow-50 focus:border-black/40 transition-colors placeholder-black/35"
          placeholder="e.g., Morning Motivation"
        />
      </div>

      {/* â”€â”€ Type Toggle â”€â”€ */}
      <div className="py-4">
        <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
          Type
        </label>
        <div className="flex rounded-xl border border-black/20 overflow-hidden">
          <button
            type="button"
            onClick={() => { setTimeType("schedule"); onReminderTypeChange?.("schedule"); }}
            className={`flex-1 h-12 font-black text-sm transition-all duration-300 ease-out border-r border-black/20 ${
              timeType === "schedule" ? "bg-black text-yellow-300" : "bg-white text-black hover:bg-yellow-100"
            }`}
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={() => { setTimeType("recurring"); onReminderTypeChange?.("recurring"); }}
            className={`flex-1 h-12 font-black text-sm transition-all duration-300 ease-out ${
              timeType === "recurring" ? "bg-black text-yellow-300" : "bg-white text-black hover:bg-yellow-100"
            }`}
          >
            Recurring
          </button>
        </div>
      </div>

      {/* Intent */}
      <div className="py-4">
        <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
          Intent
        </label>
        <div className="flex rounded-xl border border-black/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setIntentType("break-distraction")}
            className={`flex-1 h-10 font-black text-sm transition-all duration-300 ease-out border-r border-black/20 ${
              intentType === "break-distraction"
                ? "bg-black text-yellow-300"
                : "bg-white text-black hover:bg-yellow-100"
            }`}
          >
            Break Distraction
          </button>
          <button
            type="button"
            onClick={() => setIntentType("stay-productive")}
            className={`flex-1 h-10 font-black text-sm transition-all duration-300 ease-out ${
              intentType === "stay-productive"
                ? "bg-black text-yellow-300"
                : "bg-white text-black hover:bg-yellow-100"
            }`}
          >
            Stay Productive
          </button>
        </div>
      </div>

      {/* â”€â”€ Schedule: Time â”€â”€ */}
      {timeType === "schedule" && (
        <>
          <div className="py-4">
            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
              Time
            </label>
            <CustomTimePicker time={time} setTime={setTime} />
          </div>

          {/* â”€â”€ Repeat Mode â”€â”€ */}
          <div className="py-4">
            <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
              Repeat
            </label>
            <div className="flex rounded-xl border border-black/20 overflow-hidden">
              {(["once", "daily", "weekly"] as const).map((mode, i) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRepeatMode(mode)}
                  className={`flex-1 h-10 font-black text-sm transition-all duration-300 ease-out ${
                    i < 2 ? "border-r border-black/20" : ""
                  } ${
                    repeatMode === mode ? "bg-black text-yellow-300" : "bg-white text-black hover:bg-yellow-100"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {repeatMode === "daily" && (
              <p className="text-xs font-bold text-black/50 mt-2 pl-1">
                Fires every day at the chosen time
              </p>
            )}
          </div>

          {/* â”€â”€ Days â”€â”€ */}
          {repeatMode !== "daily" && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-black uppercase tracking-widest">
                  {repeatMode === "weekly" ? "Days" : "Day"}
                </label>
                {selectedDays.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDays([])}
                    className="text-xs font-black text-black/40 uppercase tracking-wider hover:text-black transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_LETTERS.map((letter, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`h-9 rounded-lg text-sm font-black border border-black/20 transition-all duration-300 ease-out ${
                      selectedDays.includes(index)
                        ? "bg-black text-yellow-300 border-black"
                        : "bg-white text-black hover:bg-yellow-100"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              {selectedDays.length > 0 && (
                <p className="text-xs font-bold text-black/50 mt-2 pl-1">
                  {selectedDays.map((d) => DAY_NAMES[d]).join(" · ")}
                </p>
              )}
              {repeatMode === "once" && selectedDays.length === 0 && (
                <p className="text-xs font-bold text-black/40 mt-2 pl-1">
                  Select a day for this one-time POP
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* â”€â”€ Recurring: Interval Presets â”€â”€ */}
      {timeType === "recurring" && (
        <div className="py-4">
          <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
            Repeat Every
          </label>
          <div className="grid grid-cols-3 gap-2">
            {INTERVAL_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setIntervalPreset(preset.value);
                  if (preset.value !== -1) setInterval("");
                }}
                className={`h-12 rounded-xl font-black text-sm border border-black/20 transition-all duration-300 ease-out ${
                  intervalPreset === preset.value
                    ? "bg-black text-yellow-300 border-black"
                    : "bg-white text-black hover:bg-yellow-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {intervalPreset === -1 && (
            <div className="mt-3 border border-black/20 rounded-xl overflow-hidden">
              <div className="flex divide-x divide-black/20">
                <div className="flex-1 flex flex-col items-center py-2 px-2">
                  <input
                    type="number"
                    value={customHours}
                    onChange={(e) => {
                      const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                      setCustomHours(h);
                      setInterval(String(h * 60 + customMins));
                    }}
                    className="w-full h-10 bg-white text-black text-xl font-black text-center focus:outline-none focus:bg-yellow-50 transition-colors"
                    min="0"
                    max="23"
                    placeholder="0"
                    autoFocus
                  />
                  <span className="text-xs font-black text-black/50 uppercase tracking-widest mt-1">Hours</span>
                </div>
                <div className="flex-1 flex flex-col items-center py-2 px-2">
                  <input
                    type="number"
                    value={customMins}
                    onChange={(e) => {
                      const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                      setCustomMins(m);
                      setInterval(String(customHours * 60 + m));
                    }}
                    className="w-full h-10 bg-white text-black text-xl font-black text-center focus:outline-none focus:bg-yellow-50 transition-colors"
                    min="0"
                    max="59"
                    placeholder="0"
                  />
                  <span className="text-xs font-black text-black/50 uppercase tracking-widest mt-1">Minutes</span>
                </div>
              </div>
              {(customHours > 0 || customMins > 0) && (
                <div className="border-t border-black/20 px-4 py-2 bg-yellow-50">
                  <p className="text-xs font-black text-black/60">
                    = {customHours * 60 + customMins} minutes total
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ Summary Preview â”€â”€ */}
      {summaryText && (
        <div className="py-4">
          <div className="rounded-xl bg-black px-4 py-3 flex items-start gap-3 shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]">
            <div className="h-2 w-2 rounded-full bg-yellow-300 mt-1.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-yellow-300/50 uppercase tracking-widest mb-0.5">Will fire</p>
              <p className="text-base font-black text-yellow-300 leading-snug">{summaryText}</p>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Submit â”€â”€ */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-xl bg-black text-yellow-300 font-black text-base border border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-300 hover:text-black transition-colors duration-150 flex items-center justify-center gap-2 shadow-[0_10px_20px_-16px_rgba(0,0,0,1)]"
        >
          <Plus className="h-5 w-5" />
          Add Self POP
        </button>
      </div>

    </form>
  );
};

export default AddReminderForm;
