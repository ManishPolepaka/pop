import { useState } from "react";
import ModernDropdown from "./ModernDropdown";

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const periods = ["AM", "PM"];

const CustomTimePicker = ({ time, setTime }: { time: string; setTime: (value: string) => void }) => {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  return (
    <div className="flex items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm">
      <ModernDropdown
        options={hours}
        value={hour}
        onChange={(value) => {
          setHour(value);
          setTime(`${value}:${minute} ${period}`);
        }}
        width="w-18"
      />

      <span className="text-3xl font-bold text-yellow-600">:</span>

      <ModernDropdown
        options={minutes}
        value={minute}
        onChange={(value) => {
          setMinute(value);
          setTime(`${hour}:${value} ${period}`);
        }}
        width="w-18"
      />

      <ModernDropdown
        options={periods}
        value={period}
        onChange={(value) => {
          setPeriod(value);
          setTime(`${hour}:${minute} ${value}`);
        }}
        width="w-20"
      />
    </div>
  );
};

export default CustomTimePicker;