import { useEffect, useState } from "react";
import ModernDropdown from "./ModernDropdown";

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const periods = ["AM", "PM"];

const CustomTimePicker = ({ time, setTime }: { time: string; setTime: (value: string) => void }) => {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const to24Hour = (hour12: string, minuteValue: string, periodValue: string) => {
    const parsedHour = Number.parseInt(hour12, 10);
    const safeHour = Number.isFinite(parsedHour) ? parsedHour : 12;
    const hours24 = (safeHour % 12) + (periodValue === "PM" ? 12 : 0);
    return `${hours24.toString().padStart(2, "0")}:${minuteValue}`;
  };

  useEffect(() => {
    if (!time) {
      return;
    }

    const match = time.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
    if (!match) {
      return;
    }

    const rawHours = Number.parseInt(match[1], 10);
    const rawMinutes = Number.parseInt(match[2], 10);
    if (!Number.isFinite(rawHours) || !Number.isFinite(rawMinutes)) {
      return;
    }

    if (match[3]) {
      setHour(rawHours.toString().padStart(2, "0"));
      setMinute(rawMinutes.toString().padStart(2, "0"));
      setPeriod(match[3].toUpperCase());
      return;
    }

    if (rawHours < 0 || rawHours > 23 || rawMinutes < 0 || rawMinutes > 59) {
      return;
    }

    const nextPeriod = rawHours >= 12 ? "PM" : "AM";
    const hour12 = rawHours % 12 || 12;
    setHour(hour12.toString().padStart(2, "0"));
    setMinute(rawMinutes.toString().padStart(2, "0"));
    setPeriod(nextPeriod);
  }, [time]);

  return (
    <div className="flex items-center gap-2.5">
      <ModernDropdown
        options={hours}
        value={hour}
        onChange={(value) => {
          setHour(value);
          setTime(to24Hour(value, minute, period));
        }}
        width="w-20"
      />
      <span className="text-xl font-black text-black/80 select-none leading-none">:</span>
      <ModernDropdown
        options={minutes}
        value={minute}
        onChange={(value) => {
          setMinute(value);
          setTime(to24Hour(hour, value, period));
        }}
        width="w-20"
      />
      <ModernDropdown
        options={periods}
        value={period}
        onChange={(value) => {
          setPeriod(value);
          setTime(to24Hour(hour, minute, value));
        }}
        width="w-20"
      />
    </div>
  );
};

export default CustomTimePicker;