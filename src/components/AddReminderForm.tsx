import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CustomTimePicker from "@/components/CustomTimePicker";

interface AddReminderFormProps {
  onAdd: (time: { type: "recurring" | "one-time"; value: string; interval?: number } | string) => void;
}

const AddReminderForm = ({ onAdd }: AddReminderFormProps) => {
  const [timeType, setTimeType] = useState("one-time");
  const [time, setTime] = useState("");
  const [interval, setInterval] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeType === "one-time" && time) {
      onAdd({ type: "one-time", value: time });
      setTime("");
    } else if (timeType === "recurring" && interval) {
      onAdd({ type: "recurring", value: "", interval: parseInt(interval, 10) });
      setInterval("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-bold text-black uppercase tracking-wider">
          Reminder Type
        </label>
        <div className="flex gap-4 bg-transparent p-0">
          <button
            type="button"
            onClick={() => setTimeType("one-time")}
            className={`flex-1 h-12 px-4 text-center font-bold rounded-xl transition-all duration-300 border-2 ${
              timeType === "one-time"
                ? "bg-yellow-400 text-black border-black shadow-md hover:shadow-lg hover:bg-yellow-500"
                : "bg-white text-black border-black hover:bg-gray-50"
            }`}
          >
            One-Time
          </button>
          <button
            type="button"
            onClick={() => setTimeType("recurring")}
            className={`flex-1 h-12 px-4 text-center font-bold rounded-xl transition-all duration-300 border-2 ${
              timeType === "recurring"
                ? "bg-yellow-400 text-black border-black shadow-md hover:shadow-lg hover:bg-yellow-500"
                : "bg-white text-black border-black hover:bg-gray-50"
            }`}
          >
            Recurring
          </button>
        </div>
      </div>

      {timeType === "one-time" && (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-black uppercase tracking-wider">
            Select Time (Alarm)
          </label>
          <CustomTimePicker time={time} setTime={setTime} />
        </div>
      )}

      {timeType === "recurring" && (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-black uppercase tracking-wider">
            Repeat Every (Minutes)
          </label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full h-12 bg-white border-2 border-black text-black text-lg font-semibold text-center rounded-lg focus:border-black focus:ring-2 focus:ring-yellow-300 transition-all duration-300 placeholder-gray-500"
            min="1"
            placeholder="e.g., 5 for every 5 minutes"
            required
          />
          <p className="text-sm text-black/60 font-semibold">POPs will trigger automatically every {interval || '?'} minute(s)</p>
        </div>
      )}

      <button
        type="submit"
        disabled={timeType === "one-time" ? !time : !interval}
        className="w-full h-12 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 border-2 border-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
      >
        <Plus className="h-5 w-5 group-active:rotate-90 transition-transform" />
        Add Reminder
      </button>
    </form>
  );
};

export default AddReminderForm;
