import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  getValidRecurringNextTrigger,
  isSupportedReminder,
  parseReminderTime,
} from "@/lib/reminderScheduler";

export interface NotificationReadyReminder {
  id: string;
  time: string;
  message: string;
  name?: string;
  triggered: boolean;
  type: "schedule" | "recurring";
  interval?: number;
  days?: number[];
  repeatMode?: "once" | "daily" | "weekly";
  nextTriggerAt?: unknown;
}

export interface ReminderNotificationPlan {
  id: number;
  reminderId: string;
  at: Date;
  title: string;
  body: string;
  every?: "day" | "week";
  repeats?: boolean;
}

const CHANNEL_ID = "self-pop-reminders";
const CHANNEL_NAME = "Self POP reminders";
const CHANNEL_DESCRIPTION = "Reflection reminders from Self POP";
const PENDING_POP_REMINDER_ID_KEY = "pendingPopReminderId";
const PENDING_POP_CONTENT_KEY = "pendingPopContent";
const NOTIFICATION_PERMISSION_REQUESTED_KEY = "popNotificationPermissionRequested";
const EXACT_ALARM_SETTINGS_REQUESTED_KEY = "popExactAlarmSettingsRequested";
const MAX_RECURRING_PLAN_COUNT = 60;
const RECURRING_WINDOW_MS = 6 * 60 * 60 * 1000;
const SCHEDULE_WINDOW_DAYS = 14;
const DEFAULT_PENDING_POP_CONTENT = "What matters most right now?";

const toPositiveNotificationId = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
};

const getDisplayName = (reminder: Pick<NotificationReadyReminder, "name" | "message">) => {
  return reminder.name?.trim() || reminder.message?.trim() || "Time for a quick reset";
};

const getNextTimeTodayOrTomorrow = (
  hours: number,
  minutes: number,
  now: Date
) => {
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const getNextWeekdayTime = (
  weekday: number,
  hours: number,
  minutes: number,
  now: Date
) => {
  const next = new Date(now);
  const offset = (weekday - now.getDay() + 7) % 7;
  next.setDate(now.getDate() + offset);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 7);
  }

  return next;
};

const addDays = (date: Date, count: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
};

const toAtTime = (date: Date, hours: number, minutes: number) => {
  const at = new Date(date);
  at.setHours(hours, minutes, 0, 0);
  return at;
};

export const getReminderNotificationPlans = (
  reminder: NotificationReadyReminder,
  now: Date = new Date()
): ReminderNotificationPlan[] => {
  if (!isSupportedReminder(reminder) || reminder.triggered) {
    return [];
  }

  const title = "Pop!";
  const body = getDisplayName(reminder);

  if (reminder.type === "recurring") {
    const nextTriggerAtMs = getValidRecurringNextTrigger(reminder, now);
    if (!nextTriggerAtMs) {
      return [];
    }

    const intervalMs = Math.max(reminder.interval ?? 0, 0) * 60 * 1000;
    if (intervalMs <= 0) {
      return [];
    }

    const windowEndMs = now.getTime() + RECURRING_WINDOW_MS;
    const plans: ReminderNotificationPlan[] = [];
    let currentAtMs = nextTriggerAtMs;

    while (
      currentAtMs <= windowEndMs &&
      plans.length < MAX_RECURRING_PLAN_COUNT
    ) {
      plans.push({
        id: toPositiveNotificationId(`${reminder.id}:recurring:${currentAtMs}`),
        reminderId: reminder.id,
        at: new Date(currentAtMs),
        title,
        body,
      });

      currentAtMs += intervalMs;
    }

    return plans;
  }

  const parsedTime = parseReminderTime(reminder.time);
  if (!parsedTime) {
    return [];
  }

  const repeatMode = reminder.repeatMode ?? "once";

  if (repeatMode === "daily") {
    const plans: ReminderNotificationPlan[] = [];

    for (let dayOffset = 0; dayOffset <= SCHEDULE_WINDOW_DAYS; dayOffset += 1) {
      const day = addDays(now, dayOffset);
      const at = toAtTime(day, parsedTime.hours, parsedTime.minutes);

      if (at <= now) {
        continue;
      }

      plans.push({
        id: toPositiveNotificationId(`${reminder.id}:daily:${at.getTime()}`),
        reminderId: reminder.id,
        at,
        title,
        body,
      });
    }

    return plans;
  }

  if (repeatMode === "weekly") {
    const days = reminder.days?.length ? reminder.days : [now.getDay()];
    const plans: ReminderNotificationPlan[] = [];

    for (let week = 0; week <= Math.ceil(SCHEDULE_WINDOW_DAYS / 7); week += 1) {
      for (const day of days) {
        const base = week === 0
          ? getNextWeekdayTime(day, parsedTime.hours, parsedTime.minutes, now)
          : addDays(getNextWeekdayTime(day, parsedTime.hours, parsedTime.minutes, now), week * 7);

        if (base <= now) {
          continue;
        }

        const horizon = addDays(now, SCHEDULE_WINDOW_DAYS + 1);
        if (base > horizon) {
          continue;
        }

        plans.push({
          id: toPositiveNotificationId(`${reminder.id}:weekly:${day}:${base.getTime()}`),
          reminderId: reminder.id,
          at: base,
          title,
          body,
        });
      }
    }

    return plans;
  }

  if (reminder.days?.length) {
    return reminder.days.map((day) => ({
      id: toPositiveNotificationId(`${reminder.id}:once:${day}`),
      reminderId: reminder.id,
      at: getNextWeekdayTime(day, parsedTime.hours, parsedTime.minutes, now),
      title,
      body,
    }));
  }

  return [
    {
      id: toPositiveNotificationId(`${reminder.id}:once`),
      reminderId: reminder.id,
      at: getNextTimeTodayOrTomorrow(parsedTime.hours, parsedTime.minutes, now),
      title,
      body,
    },
  ];
};

export const requestPopNotificationPermission = async () => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  const permissions = await LocalNotifications.checkPermissions();
  let display = permissions.display;

  if (display !== "granted") {
    if (typeof window !== "undefined") {
      const alreadyRequested = window.localStorage.getItem(
        NOTIFICATION_PERMISSION_REQUESTED_KEY
      );

      if (alreadyRequested === "1") {
        return false;
      }

      window.localStorage.setItem(NOTIFICATION_PERMISSION_REQUESTED_KEY, "1");
    }

    const requested = await LocalNotifications.requestPermissions();
    display = requested.display;
  }

  if (display !== "granted") {
    return false;
  }

  // Android exact alarms improve timing reliability under doze/background limits.
  // Open exact-alarm settings only once for this install to avoid repetitive redirects.
  if (
    Capacitor.getPlatform() === "android" &&
    typeof LocalNotifications.checkExactNotificationSetting === "function" &&
    typeof LocalNotifications.changeExactNotificationSetting === "function"
  ) {
    try {
      const exactSetting = await LocalNotifications.checkExactNotificationSetting();
      if (!exactSetting.value && typeof window !== "undefined") {
        const alreadyPrompted =
          window.localStorage.getItem(EXACT_ALARM_SETTINGS_REQUESTED_KEY) === "1";

        if (!alreadyPrompted) {
          window.localStorage.setItem(EXACT_ALARM_SETTINGS_REQUESTED_KEY, "1");
          await LocalNotifications.changeExactNotificationSetting();
          return false;
        }
      }
    } catch {
      // Keep scheduling even if exact-alarm checks are unavailable on a device build.
    }
  }

  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      description: CHANNEL_DESCRIPTION,
      importance: 5,
      visibility: 1,
    });
  } catch {
    // channel may already exist
  }

  return true;
};

export const syncReminderLocalNotifications = async (
  reminders: NotificationReadyReminder[]
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const now = new Date();
  const plans = reminders.flatMap((reminder) =>
    getReminderNotificationPlans(reminder, now)
  );

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((notification) => ({
        id: notification.id,
      })),
    });
  }

  if (plans.length === 0) {
    return;
  }

  const isAllowed = await requestPopNotificationPermission();
  if (!isAllowed) {
    return;
  }

  await LocalNotifications.schedule({
    notifications: plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      body: plan.body,
      channelId: CHANNEL_ID,
      schedule: {
        at: plan.at,
        allowWhileIdle: true,
        repeats: plan.repeats ?? false,
        every: plan.every,
      },
      extra: {
        reminderId: plan.reminderId,
        route: "/main",
      },
    })),
  });
};

export const setPendingPopReminderId = (reminderId: string | null | undefined) => {
  if (typeof window === "undefined") {
    return;
  }

  const safeReminderId = typeof reminderId === "string" ? reminderId.trim() : "";
  if (!safeReminderId) {
    window.localStorage.removeItem(PENDING_POP_REMINDER_ID_KEY);
    return;
  }

  window.localStorage.setItem(PENDING_POP_REMINDER_ID_KEY, safeReminderId);
};

export const setPendingPopContent = (content: string | null | undefined) => {
  if (typeof window === "undefined") {
    return;
  }

  const safeContent = typeof content === "string" ? content.trim() : "";
  if (!safeContent) {
    window.localStorage.removeItem(PENDING_POP_CONTENT_KEY);
    return;
  }

  window.localStorage.setItem(PENDING_POP_CONTENT_KEY, safeContent);
};

export const consumePendingPopReminderId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const reminderId = window.localStorage.getItem(PENDING_POP_REMINDER_ID_KEY);
  window.localStorage.removeItem(PENDING_POP_REMINDER_ID_KEY);

  if (!reminderId || !reminderId.trim()) {
    return null;
  }

  return reminderId;
};

export const consumePendingPopContent = () => {
  if (typeof window === "undefined") {
    return DEFAULT_PENDING_POP_CONTENT;
  }

  const content = window.localStorage.getItem(PENDING_POP_CONTENT_KEY);
  window.localStorage.removeItem(PENDING_POP_CONTENT_KEY);

  if (!content || !content.trim()) {
    return DEFAULT_PENDING_POP_CONTENT;
  }

  return content;
};
