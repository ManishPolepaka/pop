import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getRandomPOPByIntent } from "@/firebase/pops";
import {
  getNextRecurringTriggerFromNow,
  getReminderTriggerState,
  getValidRecurringNextTrigger,
  isSupportedReminder,
  shouldClearActiveNotification,
  shouldIgnoreReminderTrigger,
} from "@/lib/reminderScheduler";
import { buildPopResponsePayload } from "@/lib/popResponseUtils";
import {
  clearLegacyReminderStorage,
  loadDeletedReminderIds,
  loadLastDeliveryKeys,
  persistDeletedReminderIds,
  persistLastDeliveryKeys,
} from "@/lib/reminderStorage";
import {
  consumePendingPopContent,
  consumePendingPopReminderId,
  syncReminderLocalNotifications,
} from "@/lib/localNotifications";

export interface Reminder {
  id: string;
  time: string;
  message: string;
  name?: string;
  popContent?: string;
  popId?: string;
  triggered: boolean;
  type: "schedule" | "recurring";
  interval?: number;
  days?: number[];
  repeatMode?: "once" | "daily" | "weekly";
  intentType?: "break-distraction" | "stay-productive";
  createdAt: Timestamp;
  lastTriggeredAt?: Timestamp;
  nextTriggerAt?: Timestamp;
}

export interface PopResponseEntry {
  id: string;
  reminderId: string;
  popId?: string;
  question: string;
  answer: string;
  status: "answered" | "skipped";
  reminderName?: string;
  reminderType?: "schedule" | "recurring";
  createdAt?: Timestamp;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [popResponses, setPopResponses] = useState<PopResponseEntry[]>([]);
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(
    null
  );
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const localNextTriggerAtRef = useRef<Record<string, number>>({});
  const lastDeliveryKeyRef = useRef<Record<string, string>>(loadLastDeliveryKeys());
  const deletedReminderIdsRef = useRef<Set<string>>(loadDeletedReminderIds());
  const remindersRef = useRef<Reminder[]>([]);
  const checkGenerationRef = useRef(0);
  const isCheckingRef = useRef(false);
  const isHandlingPendingOpenRef = useRef(false);

  const toDebugReminder = (reminder: Partial<Reminder> | null | undefined) => {
    if (!reminder) return null;

    const createdAt = reminder.createdAt && "toDate" in reminder.createdAt
      ? reminder.createdAt.toDate().toISOString()
      : undefined;
    const lastTriggeredAt = reminder.lastTriggeredAt && "toDate" in reminder.lastTriggeredAt
      ? reminder.lastTriggeredAt.toDate().toISOString()
      : undefined;
    const nextTriggerAt = reminder.nextTriggerAt && "toDate" in reminder.nextTriggerAt
      ? reminder.nextTriggerAt.toDate().toISOString()
      : undefined;

    return {
      id: reminder.id,
      name: reminder.name || reminder.message || "Unnamed reminder",
      type: reminder.type,
      time: reminder.time,
      interval: reminder.interval,
      repeatMode: reminder.repeatMode,
      triggered: reminder.triggered,
      createdAt,
      lastTriggeredAt,
      nextTriggerAt,
    };
  };

  // Monitor auth state
  useEffect(() => {
    clearLegacyReminderStorage();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch reminders from Firestore (per-user collection)
  useEffect(() => {
    if (!user) {
      setReminders([]);
      setPopResponses([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/reminders`)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remindersData: Reminder[] = [];
      snapshot.forEach((doc) => {
        remindersData.push({
          id: doc.id,
          ...doc.data(),
        } as Reminder);
      });

      const supportedReminders = remindersData.filter((reminder) => isSupportedReminder(reminder));
      const ignoredLegacyReminders = remindersData.filter((reminder) => !isSupportedReminder(reminder));

      if (ignoredLegacyReminders.length > 0) {
        console.warn("[Self POP Debug] Ignoring malformed legacy reminders", {
          reminders: ignoredLegacyReminders.map(toDebugReminder),
        });
      }

      const visibleReminders = supportedReminders.filter(
        (r) => !r.triggered && !deletedReminderIdsRef.current.has(r.id)
      );

      const now = new Date();
      visibleReminders.forEach((reminder) => {
        if (reminder.type !== "recurring" || !reminder.interval) {
          return;
        }

        if (localNextTriggerAtRef.current[reminder.id]) {
          return;
        }

        const safeNextTriggerAtMs = getValidRecurringNextTrigger(reminder, now);
        if (!safeNextTriggerAtMs) {
          return;
        }

        localNextTriggerAtRef.current[reminder.id] = safeNextTriggerAtMs;

        const persistedNextTriggerAtMs = reminder.nextTriggerAt?.toDate?.().getTime();
        if (!persistedNextTriggerAtMs || persistedNextTriggerAtMs <= now.getTime()) {
          void updateDoc(doc(db, `users/${user.uid}/reminders`, reminder.id), {
            nextTriggerAt: Timestamp.fromMillis(safeNextTriggerAtMs),
          });
          console.log("[Self POP Debug] Reset recurring timer on load", {
            reminder: toDebugReminder(reminder),
            nextTriggerAt: new Date(safeNextTriggerAtMs).toISOString(),
          });
        }
      });

      setReminders(visibleReminders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setPopResponses([]);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/popResponses`),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const responseData: PopResponseEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PopResponseEntry, "id">),
      }));
      setPopResponses(responseData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    void syncReminderLocalNotifications(reminders);
  }, [reminders]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listenerPromise = CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        return;
      }

      void syncReminderLocalNotifications(remindersRef.current);
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  useEffect(() => {
    if (activeNotification || reminders.length === 0) {
      return;
    }

    const pendingReminderId = consumePendingPopReminderId();
    const pendingPopContent = consumePendingPopContent();

    if (!pendingReminderId) {
      return;
    }

    const pendingReminder = reminders.find((reminder) => reminder.id === pendingReminderId);
    if (!pendingReminder) {
      const fallbackContent = pendingPopContent || "Take a moment to relax";
      const fallbackReminder: Reminder = {
        id: pendingReminderId,
        time: "",
        message: fallbackContent,
        name: "POP Reminder",
        triggered: false,
        type: "schedule",
        createdAt: Timestamp.now(),
        popContent: fallbackContent,
      };

      setActiveNotification(fallbackReminder);
      return;
    }

    checkGenerationRef.current += 1;
    const pendingGeneration = checkGenerationRef.current;
    isHandlingPendingOpenRef.current = true;

    void (async () => {
      try {
        const now = new Date();
        const triggerState = getReminderTriggerState(pendingReminder, now, {
          localNextTriggerAtMs: localNextTriggerAtRef.current[pendingReminder.id],
          lastDeliveredKey: lastDeliveryKeyRef.current[pendingReminder.id],
        });

        if (!triggerState.shouldTrigger) {
          // User explicitly tapped a system notification. Even if this delivery key was
          // already observed by in-app polling, we should still show the POP card.
          const pop = await getRandomPOPByIntent(
            pendingReminder.intentType ?? "break-distraction"
          );
          if (checkGenerationRef.current !== pendingGeneration) {
            return;
          }

          setActiveNotification({
            ...pendingReminder,
            popContent: pop?.content || pendingPopContent || "Take a moment to relax",
            popId: pop?.id,
          });
          return;
        }

        if (triggerState.deliveryKey) {
          lastDeliveryKeyRef.current[pendingReminder.id] = triggerState.deliveryKey;
          persistLastDeliveryKeys(lastDeliveryKeyRef.current);
        }

        if (pendingReminder.type === "recurring" && pendingReminder.interval) {
          const nowMs = now.getTime();
          const nextTriggerAtMs =
            triggerState.nextTriggerAtMs ??
            getNextRecurringTriggerFromNow(pendingReminder.interval, now);
          localNextTriggerAtRef.current[pendingReminder.id] = nextTriggerAtMs;
          await markReminderRecurringTriggered(pendingReminder.id, nowMs, nextTriggerAtMs);
        }

        if (pendingReminder.type === "schedule" && triggerState.shouldMarkTriggered) {
          await markReminderAsTriggered(pendingReminder.id);
        }

        const pop = await getRandomPOPByIntent(
          pendingReminder.intentType ?? "break-distraction"
        );
        if (checkGenerationRef.current !== pendingGeneration) {
          return;
        }

        setActiveNotification({
          ...pendingReminder,
          popContent: pop?.content || pendingPopContent || "Take a moment to relax",
          popId: pop?.id,
        });
      } finally {
        isHandlingPendingOpenRef.current = false;
      }
    })();
  }, [reminders, activeNotification]);

  useEffect(() => {
    remindersRef.current = reminders;
    const activeIds = new Set(reminders.map((reminder) => reminder.id));

    Object.keys(localNextTriggerAtRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        delete localNextTriggerAtRef.current[id];
      }
    });

    Object.keys(lastDeliveryKeyRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        delete lastDeliveryKeyRef.current[id];
      }
    });

    persistLastDeliveryKeys(lastDeliveryKeyRef.current);

    if (typeof window !== "undefined") {
      (window as Window & { __selfPopDebug?: unknown }).__selfPopDebug = {
        path: window.location.pathname,
        reminders: reminders.map(toDebugReminder),
        activeNotification: toDebugReminder(activeNotification),
        deletedReminderIds: Array.from(deletedReminderIdsRef.current),
        lastDeliveryKeys: { ...lastDeliveryKeyRef.current },
        generatedAt: new Date().toISOString(),
      };
      console.log("[Self POP Debug] Reminder state refreshed", (window as Window & { __selfPopDebug?: unknown }).__selfPopDebug);
    }

    if (shouldClearActiveNotification(activeNotification?.id, reminders)) {
      setActiveNotification(null);
    }
  }, [reminders, activeNotification]);

  // Check for reminders to trigger
  useEffect(() => {
    const checkReminders = async () => {
      if (
        activeNotification ||
        isCheckingRef.current ||
        isHandlingPendingOpenRef.current ||
        reminders.length === 0
      ) {
        return;
      }

      isCheckingRef.current = true;
      const checkGeneration = checkGenerationRef.current;

      try {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.

        for (const reminder of reminders) {
          if (shouldIgnoreReminderTrigger(reminder.id, remindersRef.current, deletedReminderIdsRef.current)) {
            continue;
          }

          const triggerState = getReminderTriggerState(reminder, now, {
            lastDeliveredKey: lastDeliveryKeyRef.current[reminder.id],
            localNextTriggerAtMs: localNextTriggerAtRef.current[reminder.id],
          });

        if (!triggerState.shouldTrigger) {
          continue;
        }

        if (triggerState.deliveryKey) {
          lastDeliveryKeyRef.current[reminder.id] = triggerState.deliveryKey;
          persistLastDeliveryKeys(lastDeliveryKeyRef.current);
          console.log("[Self POP Debug] Trigger matched", {
            now: now.toISOString(),
            reminder: toDebugReminder(reminder),
            triggerState,
            deletedReminderIds: Array.from(deletedReminderIdsRef.current),
          });
        }

        if (reminder.type === "schedule") {
          const repeatMode = reminder.repeatMode || "once";
          console.log(`📅 SCHEDULE (${repeatMode}) triggered at:`, currentTime, "on day:", currentDay);
        }

        if (reminder.type === "recurring" && triggerState.nextTriggerAtMs) {
          const nowMs = now.getTime();
          localNextTriggerAtRef.current[reminder.id] = triggerState.nextTriggerAtMs;
          console.log("🔄 RECURRING reminder triggered. Next at:", new Date(triggerState.nextTriggerAtMs).toLocaleTimeString());
          await markReminderRecurringTriggered(reminder.id, nowMs, triggerState.nextTriggerAtMs);
        }

          if (checkGeneration !== checkGenerationRef.current) {
            return;
          }

          const pop = await getRandomPOPByIntent(
            reminder.intentType ?? "break-distraction"
          );

          if (
            checkGeneration !== checkGenerationRef.current ||
            shouldIgnoreReminderTrigger(reminder.id, remindersRef.current, deletedReminderIdsRef.current)
          ) {
            continue;
          }

          console.log("🎯 POP fetched:", pop?.content?.substring(0, 50) + "...");
          console.log("[Self POP Debug] POP source", {
            reminder: toDebugReminder(reminder),
            deliveryKey: triggerState.deliveryKey,
            popId: pop?.id,
            popPreview: pop?.content?.substring(0, 80),
          });

          const reminderWithPOP = {
          ...reminder,
          popContent: pop?.content || "Take a moment to relax",
          popId: pop?.id,
        };

        setActiveNotification(reminderWithPOP);

          if (triggerState.shouldMarkTriggered) {
            await markReminderAsTriggered(reminder.id);
          }

          break;
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [reminders, activeNotification]);

  const markReminderAsTriggered = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/reminders`, id), {
        triggered: true,
      });
      console.log("✅ Schedule reminder marked as triggered");
    } catch (error) {
      console.error("Error marking reminder as triggered:", error);
    }
  };

  const markReminderRecurringTriggered = async (id: string, firedAtMs: number, nextTriggerAtMs: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/reminders`, id), {
        lastTriggeredAt: Timestamp.fromMillis(firedAtMs),
        nextTriggerAt: Timestamp.fromMillis(nextTriggerAtMs),
      });
    } catch (error) {
      console.error("Error updating recurring trigger timestamp:", error);
    }
  };

  const addReminder = useCallback(
    async (
      time: {
        type: "recurring" | "schedule";
        value: string;
        interval?: number;
        days?: number[];
        name?: string;
        repeatMode?: "once" | "daily" | "weekly";
        intentType?: "break-distraction" | "stay-productive";
      } | string
    ) => {
      if (!user) {
        alert("Please sign in to add reminders");
        return;
      }

      try {
        const baseData = {
          time: typeof time === "string" ? time : time.value,
          type: typeof time === "string" ? "schedule" : time.type,
          message: "",
          triggered: false,
          createdAt: Timestamp.now(),
          lastTriggeredAt: Timestamp.now(),
        };

        const reminderData = typeof time === "string" 
          ? baseData
          : {
              ...baseData,
              intentType: time.intentType ?? "break-distraction",
              ...(time.name && { name: time.name }),
              ...(time.interval !== undefined && { interval: time.interval }),
              ...(time.days && time.days.length > 0 && { days: time.days }),
              ...(time.repeatMode && { repeatMode: time.repeatMode }),
              ...(time.type === "recurring" && time.interval !== undefined && {
                nextTriggerAt: Timestamp.fromMillis(Date.now() + time.interval * 60 * 1000),
              }),
            };

        await addDoc(collection(db, `users/${user.uid}/reminders`), reminderData);
      } catch (error) {
        console.error("Error adding reminder:", error);
        alert("Failed to add reminder");
      }
    },
    [user]
  );

  const deleteReminder = useCallback(async (id: string) => {
    if (!user) return;
    try {
      deletedReminderIdsRef.current.add(id);
      persistDeletedReminderIds(deletedReminderIdsRef.current);
      console.log("[Self POP Debug] Deleting reminder", {
        id,
        reminder: toDebugReminder(remindersRef.current.find((reminder) => reminder.id === id)),
        deletedReminderIds: Array.from(deletedReminderIdsRef.current),
      });
      checkGenerationRef.current += 1;
      delete localNextTriggerAtRef.current[id];
      delete lastDeliveryKeyRef.current[id];
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
      setActiveNotification((prev) => (prev?.id === id ? null : prev));
      await deleteDoc(doc(db, `users/${user.uid}/reminders`, id));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder");
    }
  }, [user]);
  const dismissNotification = useCallback(async (answer?: string) => {
    const notification = activeNotification;
    if (!notification) return;

    checkGenerationRef.current += 1;

    if (user) {
      try {
        const payload = buildPopResponsePayload(notification, answer);
        await addDoc(collection(db, `users/${user.uid}/popResponses`), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      } catch (error) {
        console.error("Error saving POP response:", error);
      }
    }

    if (
      !deletedReminderIdsRef.current.has(notification.id) &&
      notification.type === "recurring" &&
      notification.interval
    ) {
      const nextAllowedAt = getNextRecurringTriggerFromNow(notification.interval);
      localNextTriggerAtRef.current[notification.id] = nextAllowedAt;

      if (user) {
        try {
          await updateDoc(doc(db, `users/${user.uid}/reminders`, notification.id), {
            nextTriggerAt: Timestamp.fromMillis(nextAllowedAt),
          });
          console.log("⏳ Recurring reminder snoozed until:", new Date(nextAllowedAt).toLocaleTimeString());
        } catch (error) {
          console.error("Error delaying recurring reminder after dismiss:", error);
        }
      }
    }

    setActiveNotification(null);
  }, [activeNotification, user]);

  return {
    reminders,
    popResponses,
    activeNotification,
    addReminder,
    deleteReminder,
    dismissNotification,
    user,
    loading,
  };
};
