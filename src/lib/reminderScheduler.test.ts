import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  getReminderTriggerState,
  getDeliveryKey,
  getNextRecurringTriggerFromNow,
  getValidRecurringNextTrigger,
  shouldClearActiveNotification,
  shouldIgnoreReminderTrigger,
  type SchedulableReminder,
} from "./reminderScheduler";

const baseReminder: SchedulableReminder = {
  id: "r1",
  time: "09:00",
  message: "",
  triggered: false,
  type: "schedule",
  createdAt: Timestamp.fromDate(new Date("2026-04-14T08:00:00")),
};

describe("reminderScheduler", () => {
  it("triggers a daily scheduled POP only at the matching minute", () => {
    const now = new Date("2026-04-14T09:00:10");

    const result = getReminderTriggerState(
      {
        ...baseReminder,
        repeatMode: "daily",
      },
      now
    );

    expect(result.shouldTrigger).toBe(true);
    expect(result.shouldMarkTriggered).toBe(false);
  });

  it("does not re-deliver a scheduled POP again in the same minute", () => {
    const now = new Date("2026-04-14T09:00:25");
    const deliveryKey = getDeliveryKey({ ...baseReminder, repeatMode: "daily" }, now);

    const result = getReminderTriggerState(
      {
        ...baseReminder,
        repeatMode: "daily",
      },
      now,
      { lastDeliveredKey: deliveryKey }
    );

    expect(result.shouldTrigger).toBe(false);
  });

  it("triggers recurring POPs even when nextTriggerAt is missing", () => {
    const now = new Date("2026-04-14T09:31:00");

    const result = getReminderTriggerState(
      {
        ...baseReminder,
        id: "r2",
        type: "recurring",
        time: "",
        interval: 30,
        createdAt: Timestamp.fromDate(new Date("2026-04-14T09:00:00")),
      },
      now
    );

    expect(result.shouldTrigger).toBe(true);
    expect(result.nextTriggerAtMs).toBeGreaterThan(now.getTime());
  });

  it("does not trigger weekly POPs on non-selected days", () => {
    const now = new Date("2026-04-14T09:00:00"); // Tuesday

    const result = getReminderTriggerState(
      {
        ...baseReminder,
        repeatMode: "weekly",
        days: [1, 4],
      },
      now
    );

    expect(result.shouldTrigger).toBe(false);
  });

  it("reschedules recurring POPs one full interval after dismissal", () => {
    const dismissedAt = new Date("2026-04-14T09:00:10");

    const nextAllowedAt = getNextRecurringTriggerFromNow(1, dismissedAt);

    expect(nextAllowedAt).toBe(new Date("2026-04-14T09:01:10").getTime());
  });

  it("clears the active popup when its reminder has been deleted", () => {
    const shouldClear = shouldClearActiveNotification("deleted-id", [
      { id: "r1" },
      { id: "r2" },
    ]);

    expect(shouldClear).toBe(true);
  });

  it("ignores triggers for reminders deleted during the session", () => {
    const shouldIgnore = shouldIgnoreReminderTrigger(
      "deleted-id",
      [{ id: "deleted-id" }],
      new Set(["deleted-id"])
    );

    expect(shouldIgnore).toBe(true);
  });

  it("resets overdue recurring reminders to the next future interval on refresh", () => {
    const now = new Date("2026-04-14T09:31:00");

    const nextTriggerAtMs = getValidRecurringNextTrigger(
      {
        interval: 1,
        nextTriggerAt: Timestamp.fromDate(new Date("2026-04-14T09:30:00")),
      },
      now
    );

    expect(nextTriggerAtMs).toBe(new Date("2026-04-14T09:32:00").getTime());
  });

  it("does not trigger malformed legacy reminders with no valid type", () => {
    const now = new Date("2026-04-14T09:31:00");

    const result = getReminderTriggerState(
      {
        ...baseReminder,
        id: "legacy-r1",
        type: "legacy" as never,
        interval: 5,
        nextTriggerAt: Timestamp.fromDate(new Date("2026-04-14T09:30:00")),
      },
      now
    );

    expect(result.shouldTrigger).toBe(false);
  });

  it("collapses missed recurring intervals into a single current POP when the user returns", () => {
    const now = new Date("2026-04-14T10:00:00");

    const result = getReminderTriggerState(
      {
        ...baseReminder,
        id: "r-refresh",
        type: "recurring",
        time: "",
        interval: 20,
        nextTriggerAt: Timestamp.fromDate(new Date("2026-04-14T09:00:00")),
      },
      now,
      {
        suppressMissedRecurring: true,
      }
    );

    expect(result.shouldTrigger).toBe(true);
    expect(result.wasSuppressed).not.toBe(true);
    expect(result.nextTriggerAtMs).toBeGreaterThan(now.getTime());
  });
});
