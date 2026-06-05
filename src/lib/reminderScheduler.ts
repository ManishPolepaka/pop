export interface SchedulableReminder {
  id: string;
  time: string;
  message: string;
  triggered: boolean;
  type: "schedule" | "recurring";
  interval?: number;
  days?: number[];
  repeatMode?: "once" | "daily" | "weekly";
  createdAt?: unknown;
  lastTriggeredAt?: unknown;
  nextTriggerAt?: unknown;
}

export interface ReminderTriggerOptions {
  lastDeliveredKey?: string;
  localNextTriggerAtMs?: number;
  suppressMissedRecurring?: boolean;
}

export interface ReminderTriggerState {
  shouldTrigger: boolean;
  shouldMarkTriggered: boolean;
  nextTriggerAtMs?: number;
  deliveryKey?: string;
  wasSuppressed?: boolean;
}

const SCHEDULE_TRIGGER_GRACE_MS = 5 * 60 * 1000;

const formatCurrentTime = (date: Date) => {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

const to24HourTime = (hours24: number, minutes: number) => {
  const hh = hours24.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

export const parseReminderTime = (value: string | undefined | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const raw = value.trim();
  if (!raw) {
    return null;
  }

  const withPeriodMatch = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (withPeriodMatch) {
    const parsedHours = Number.parseInt(withPeriodMatch[1], 10);
    const parsedMinutes = Number.parseInt(withPeriodMatch[2], 10);
    const period = withPeriodMatch[3].toUpperCase();

    if (
      !Number.isFinite(parsedHours) ||
      !Number.isFinite(parsedMinutes) ||
      parsedHours < 1 ||
      parsedHours > 12 ||
      parsedMinutes < 0 ||
      parsedMinutes > 59
    ) {
      return null;
    }

    let hours24 = parsedHours % 12;
    if (period === "PM") {
      hours24 += 12;
    }

    return { hours: hours24, minutes: parsedMinutes };
  }

  const basicMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!basicMatch) {
    return null;
  }

  const parsedHours = Number.parseInt(basicMatch[1], 10);
  const parsedMinutes = Number.parseInt(basicMatch[2], 10);

  if (
    !Number.isFinite(parsedHours) ||
    !Number.isFinite(parsedMinutes) ||
    parsedHours < 0 ||
    parsedHours > 23 ||
    parsedMinutes < 0 ||
    parsedMinutes > 59
  ) {
    return null;
  }

  return { hours: parsedHours, minutes: parsedMinutes };
};

const formatLocalDateKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toMillis = (value: unknown): number | null => {
  if (!value) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  if (typeof value === "string") {
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  if (typeof value === "object") {
    const maybeTimestamp = value as {
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
    };

    if (typeof maybeTimestamp.toDate === "function") {
      const ms = maybeTimestamp.toDate().getTime();
      return Number.isFinite(ms) ? ms : null;
    }

    if (typeof maybeTimestamp.seconds === "number") {
      const nanos = typeof maybeTimestamp.nanoseconds === "number" ? maybeTimestamp.nanoseconds : 0;
      return maybeTimestamp.seconds * 1000 + Math.floor(nanos / 1_000_000);
    }
  }

  return null;
};

export const getNextRecurringTriggerFromNow = (
  intervalMinutes: number,
  now: Date = new Date()
) => now.getTime() + Math.max(intervalMinutes, 0) * 60 * 1000;

export const getValidRecurringNextTrigger = (
  reminder: Pick<SchedulableReminder, "interval" | "nextTriggerAt">,
  now: Date = new Date()
) => {
  const intervalMs = Math.max(reminder.interval ?? 0, 0) * 60 * 1000;
  if (intervalMs <= 0) {
    return null;
  }

  const persistedNextTriggerMs = toMillis(reminder.nextTriggerAt);
  if (persistedNextTriggerMs && persistedNextTriggerMs > now.getTime()) {
    return persistedNextTriggerMs;
  }

  return now.getTime() + intervalMs;
};

export const shouldClearActiveNotification = (
  activeNotificationId: string | undefined,
  reminders: Array<Pick<SchedulableReminder, "id">>
) => {
  if (!activeNotificationId) {
    return false;
  }

  return !reminders.some((reminder) => reminder.id === activeNotificationId);
};

export const shouldIgnoreReminderTrigger = (
  reminderId: string,
  reminders: Array<Pick<SchedulableReminder, "id">>,
  deletedReminderIds: Set<string>
) => {
  if (deletedReminderIds.has(reminderId)) {
    return true;
  }

  return !reminders.some((reminder) => reminder.id === reminderId);
};

export const getDeliveryKey = (
  reminder: SchedulableReminder,
  now: Date,
  baseTriggerMs?: number
) => {
  if (reminder.type === "schedule") {
    const parsed = parseReminderTime(reminder.time);
    const normalized = parsed
      ? to24HourTime(parsed.hours, parsed.minutes)
      : reminder.time;
    return `${reminder.id}:schedule:${formatLocalDateKey(now)}:${normalized}`;
  }

  const intervalMs = (reminder.interval ?? 0) * 60 * 1000;
  if (intervalMs <= 0) {
    return `${reminder.id}:recurring:${formatLocalDateKey(now)}`;
  }

  const slot = baseTriggerMs ?? Math.floor(now.getTime() / intervalMs) * intervalMs;
  return `${reminder.id}:recurring:${slot}`;
};

export const isSupportedReminder = (
  reminder: Partial<SchedulableReminder>
) => {
  if (reminder.type === "schedule") {
    return parseReminderTime(reminder.time) !== null;
  }

  if (reminder.type === "recurring") {
    return typeof reminder.interval === "number" && reminder.interval > 0;
  }

  return false;
};

export const getReminderTriggerState = (
  reminder: SchedulableReminder,
  now: Date,
  options: ReminderTriggerOptions = {}
): ReminderTriggerState => {
  if (!isSupportedReminder(reminder)) {
    return { shouldTrigger: false, shouldMarkTriggered: false };
  }

  const currentTime = formatCurrentTime(now);
  const currentDay = now.getDay();

  if (reminder.type === "schedule") {
    const parsedTime = parseReminderTime(reminder.time);
    if (!parsedTime) {
      return { shouldTrigger: false, shouldMarkTriggered: false };
    }

    const reminderTime = to24HourTime(parsedTime.hours, parsedTime.minutes);
    const scheduledAt = new Date(now);
    scheduledAt.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    const nowMs = now.getTime();
    const scheduledAtMs = scheduledAt.getTime();

    const isWithinTriggerWindow =
      nowMs >= scheduledAtMs &&
      nowMs < scheduledAtMs + SCHEDULE_TRIGGER_GRACE_MS;

    if (!isWithinTriggerWindow) {
      return { shouldTrigger: false, shouldMarkTriggered: false };
    }

    const repeatMode = reminder.repeatMode || "once";
    const dayMatches = !reminder.days || reminder.days.length === 0 || reminder.days.includes(currentDay);
    const deliveryKey = getDeliveryKey(reminder, now);

    if (options.lastDeliveredKey === deliveryKey) {
      return { shouldTrigger: false, shouldMarkTriggered: false, deliveryKey };
    }

    if (repeatMode === "once") {
      return {
        shouldTrigger: !reminder.triggered && dayMatches,
        shouldMarkTriggered: !reminder.triggered && dayMatches,
        deliveryKey,
      };
    }

    if (repeatMode === "daily") {
      return { shouldTrigger: true, shouldMarkTriggered: false, deliveryKey };
    }

    if (repeatMode === "weekly" && dayMatches) {
      return { shouldTrigger: true, shouldMarkTriggered: false, deliveryKey };
    }

    return { shouldTrigger: false, shouldMarkTriggered: false, deliveryKey };
  }

  const intervalMs = (reminder.interval ?? 0) * 60 * 1000;
  if (intervalMs <= 0) {
    return { shouldTrigger: false, shouldMarkTriggered: false };
  }

  const createdAtMs = toMillis(reminder.createdAt) ?? now.getTime();
  const lastTriggeredAtMs = toMillis(reminder.lastTriggeredAt);
  const persistedNextTriggerMs =
    options.localNextTriggerAtMs ??
    toMillis(reminder.nextTriggerAt) ??
    ((lastTriggeredAtMs ?? createdAtMs) + intervalMs);

  if (!Number.isFinite(persistedNextTriggerMs)) {
    return { shouldTrigger: false, shouldMarkTriggered: false };
  }

  const deliveryKey = getDeliveryKey(reminder, now, persistedNextTriggerMs);
  if (options.lastDeliveredKey === deliveryKey) {
    return {
      shouldTrigger: false,
      shouldMarkTriggered: false,
      nextTriggerAtMs: persistedNextTriggerMs,
      deliveryKey,
    };
  }

  if (now.getTime() < persistedNextTriggerMs) {
    return {
      shouldTrigger: false,
      shouldMarkTriggered: false,
      nextTriggerAtMs: persistedNextTriggerMs,
      deliveryKey,
    };
  }

  let nextTriggerAtMs = persistedNextTriggerMs;
  while (nextTriggerAtMs <= now.getTime()) {
    nextTriggerAtMs += intervalMs;
  }

  return {
    shouldTrigger: true,
    shouldMarkTriggered: false,
    nextTriggerAtMs,
    deliveryKey,
  };
};

