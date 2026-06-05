import { Clock, Repeat2, Trash2 } from "lucide-react";
import { parseReminderTime } from "@/lib/reminderScheduler";

interface Reminder {
  id: string;
  time: string;
  message: string;
  name?: string;
  type?: "schedule" | "recurring";
  interval?: number;
  days?: number[];
  repeatMode?: "once" | "daily" | "weekly";
}

interface ReminderCardProps {
  reminder: Reminder;
  onDelete: (id: string) => void;
}

const ReminderCard = ({ reminder, onDelete }: ReminderCardProps) => {
  const formatTime = (time: string) => {
    if (!time) return "Not set";

    const parsed = parseReminderTime(time);
    if (!parsed) {
      return time;
    }

    const ampm = parsed.hours >= 12 ? "PM" : "AM";
    const displayHour = parsed.hours % 12 || 12;
    const minutes = parsed.minutes.toString().padStart(2, "0");
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDisplayText = () => {
    if (reminder.type === "recurring" && reminder.interval) {
      return `Every ${reminder.interval} minute${reminder.interval > 1 ? "s" : ""}`;
    }
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const timeStr = formatTime(reminder.time);
    const repeatMode = reminder.repeatMode || "once";
    
    if (repeatMode === "daily") {
      return `${timeStr} (Daily)`;
    } else if (repeatMode === "weekly") {
      if (reminder.days && reminder.days.length > 0) {
        const daysStr = reminder.days.map(d => dayNames[d]).join(", ");
        return `${timeStr} (Weekly: ${daysStr})`;
      }
      return `${timeStr} (Weekly)`;
    } else {
      // once
      if (reminder.days && reminder.days.length > 0) {
        const daysStr = reminder.days.map(d => dayNames[d]).join(", ");
        return `${timeStr} (Once on ${daysStr})`;
      }
      return `${timeStr} (Once)`;
    }
  };

  const getIcon = () => {
    if (reminder.type === "recurring") {
      return <Repeat2 className="h-6 w-6 text-black" />;
    }
    return <Clock className="h-6 w-6 text-black" />;
  };

  return (
    <div className="group relative flex items-center justify-between gap-4 bg-white border-2 border-black rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="h-12 w-12 rounded-lg bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-black">
            {getDisplayText()}
          </p>
          <p className="text-black/70 text-sm mt-0.5 line-clamp-2">
            {reminder.name || reminder.message || "Reminder"}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(reminder.id)}
        className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border-2 border-black text-black hover:bg-red-100 hover:border-red-600 hover:text-red-600 transition-all duration-200 flex-shrink-0 group-hover:scale-110"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ReminderCard;
