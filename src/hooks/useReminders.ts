import { useState, useEffect, useCallback } from "react";

export interface Reminder {
  id: string;
  time: string;
  message: string;
  triggered: boolean;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      reminders.forEach((reminder) => {
        if (reminder.time === currentTime && !reminder.triggered && !activeNotification) {
          setActiveNotification(reminder);
          setReminders((prev) =>
            prev.map((r) =>
              r.id === reminder.id ? { ...r, triggered: true } : r
            )
          );
        }
      });
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [reminders, activeNotification]);

  const addReminder = useCallback((time: { type: "recurring" | "one-time"; value: string; interval?: number } | string) => {
    const timeValue = typeof time === "string" ? time : time.value;
    const newReminder: Reminder = {
      id: Date.now().toString(),
      time: timeValue,
      message: "",
      triggered: false,
    };
    setReminders((prev) => [...prev, newReminder]);
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const dismissNotification = useCallback(() => {
    if (activeNotification) {
      setReminders((prev) =>
        prev.filter((r) => r.id !== activeNotification.id)
      );
      setActiveNotification(null);
    }
  }, [activeNotification]);

  const pendingReminders = reminders.filter((r) => !r.triggered);

  return {
    reminders: pendingReminders,
    activeNotification,
    addReminder,
    deleteReminder,
    dismissNotification,
  };
};
