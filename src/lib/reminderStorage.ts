const LEGACY_REMINDERS_KEY = "reminders";
export const DELETED_REMINDER_IDS_KEY = "deletedReminderIds";
const LAST_DELIVERY_KEYS_KEY = "lastDeliveredPopKeys";

export const clearLegacyReminderStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_REMINDERS_KEY);
  } catch {
    // ignore storage errors
  }
};

export const loadDeletedReminderIds = () => {
  clearLegacyReminderStorage();

  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(DELETED_REMINDER_IDS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
};

export const persistDeletedReminderIds = (ids: Set<string>) => {
  clearLegacyReminderStorage();

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      DELETED_REMINDER_IDS_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // ignore storage errors
  }
};

export const loadLastDeliveryKeys = (): Record<string, string> => {
  clearLegacyReminderStorage();

  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(LAST_DELIVERY_KEYS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === "string")
    ) as Record<string, string>;
  } catch {
    return {};
  }
};

export const persistLastDeliveryKeys = (keys: Record<string, string>) => {
  clearLegacyReminderStorage();

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LAST_DELIVERY_KEYS_KEY, JSON.stringify(keys));
  } catch {
    // ignore storage errors
  }
};
