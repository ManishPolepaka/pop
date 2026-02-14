import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getRandomPOP } from "@/firebase/pops";
import { POP } from "@/types/pop";

export interface Reminder {
  id: string;
  time: string;
  message: string;
  popContent?: string;  // The actual POP message
  popId?: string;       // Reference to POP document
  triggered: boolean;
  type: "one-time" | "recurring";
  interval?: number;
  userId: string;
  createdAt: Timestamp;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(
    null
  );
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch reminders from Firestore
  useEffect(() => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "reminders"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remindersData: Reminder[] = [];
      snapshot.forEach((doc) => {
        remindersData.push({
          id: doc.id,
          ...doc.data(),
        } as Reminder);
      });
      setReminders(remindersData.filter((r) => !r.triggered));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Check for reminders to trigger
  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      for (const reminder of reminders) {
        if (!reminder.triggered && !activeNotification) {
          let shouldTrigger = false;

          // ONE-TIME: Check if current time matches exactly
          if (reminder.type === "one-time" && reminder.time === currentTime) {
            shouldTrigger = true;
            console.log("⏰ ONE-TIME alarm triggered at:", currentTime);
          }

          // RECURRING: Check if interval has elapsed since creation
          if (reminder.type === "recurring" && reminder.interval) {
            const createdTime = reminder.createdAt instanceof Object && 'toDate' in reminder.createdAt 
              ? reminder.createdAt.toDate() 
              : new Date(reminder.createdAt);
            
            const elapsedSeconds = Math.floor((now.getTime() - createdTime.getTime()) / 1000);
            const intervalSeconds = reminder.interval * 60;

            // Trigger if elapsed time is a multiple of interval
            if (elapsedSeconds > 0 && elapsedSeconds % intervalSeconds < 1) {
              shouldTrigger = true;
              console.log("🔄 RECURRING reminder triggered. Next in", reminder.interval, "minutes");
            }
          }

          if (shouldTrigger) {
            // Fetch a random POP for this reminder
            const pop = await getRandomPOP();
            console.log("🎯 POP fetched:", pop?.content?.substring(0, 50) + "...");

            const reminderWithPOP = {
              ...reminder,
              popContent: pop?.content || "Take a moment to relax",
              popId: pop?.id,
            };

            setActiveNotification(reminderWithPOP);

            // For one-time reminders: mark as triggered
            if (reminder.type === "one-time") {
              await markReminderAsTriggered(reminder.id);
            }
            // For recurring: don't mark as triggered, let it keep running
          }
        }
      }
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [reminders, activeNotification]);

  const markReminderAsTriggered = async (id: string) => {
    try {
      await updateDoc(doc(db, "reminders", id), {
        triggered: true,
      });
      console.log("✅ One-time reminder marked as triggered");
    } catch (error) {
      console.error("Error marking reminder as triggered:", error);
    }
  };

  const addReminder = useCallback(
    async (
      time: {
        type: "recurring" | "one-time";
        value: string;
        interval?: number;
      } | string
    ) => {
      if (!user) {
        alert("Please sign in to add reminders");
        return;
      }

      try {
        const reminderData =
          typeof time === "string"
            ? {
                time: time,
                message: "",
                type: "one-time" as const,
                userId: user.uid,
                triggered: false,
                createdAt: Timestamp.now(),
              }
            : {
                time: time.value,
                message: "",
                type: time.type,
                interval: time.interval,
                userId: user.uid,
                triggered: false,
                createdAt: Timestamp.now(),
              };

        await addDoc(collection(db, "reminders"), reminderData);
      } catch (error) {
        console.error("Error adding reminder:", error);
        alert("Failed to add reminder");
      }
    },
    [user]
  );

  const deleteReminder = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "reminders", id));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder");
    }
  }, []);

  const dismissNotification = useCallback(async () => {
    if (activeNotification) {
      await deleteReminder(activeNotification.id);
      setActiveNotification(null);
    }
  }, [activeNotification, deleteReminder]);

  return {
    reminders,
    activeNotification,
    addReminder,
    deleteReminder,
    dismissNotification,
    user,
    loading,
  };
};
