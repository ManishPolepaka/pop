import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { getReminderNotificationPlans } from "./localNotifications";

const baseReminder = {
  id: "r1",
  message: "",
  triggered: false,
  createdAt: Timestamp.fromDate(new Date("2026-04-14T08:00:00")),
} as const;

describe("localNotifications", () => {
  it("returns the next upcoming time for a daily scheduled reminder", () => {
    const now = new Date("2026-04-14T09:15:00");
    const plans = getReminderNotificationPlans(
      {
        ...baseReminder,
        type: "schedule" as const,
        time: "10:30",
        repeatMode: "daily" as const,
      },
      now
    );

    expect(plans).toHaveLength(1);
    expect(plans[0].at.getHours()).toBe(10);
    expect(plans[0].at.getMinutes()).toBe(30);
  });

  it("creates one plan per selected weekly day", () => {
    const now = new Date("2026-04-14T09:15:00"); // Tuesday
    const plans = getReminderNotificationPlans(
      {
        ...baseReminder,
        id: "r-weekly",
        type: "schedule" as const,
        time: "11:00",
        repeatMode: "weekly" as const,
        days: [2, 4],
      },
      now
    );

    expect(plans).toHaveLength(2);
    expect(plans.every((plan) => plan.at > now)).toBe(true);
  });

  it("generates a recurring schedule window starting from nextTriggerAt", () => {
    const now = new Date("2026-04-14T09:15:00");
    const nextTriggerAt = Timestamp.fromDate(new Date("2026-04-14T09:45:00"));

    const plans = getReminderNotificationPlans(
      {
        ...baseReminder,
        id: "r-recurring",
        type: "recurring" as const,
        time: "",
        interval: 30,
        nextTriggerAt,
      },
      now
    );

    expect(plans.length).toBeGreaterThan(1);
    expect(plans[0].at.getTime()).toBe(nextTriggerAt.toDate().getTime());
    expect(plans[1].at.getTime()).toBe(nextTriggerAt.toDate().getTime() + 30 * 60 * 1000);
  });
});
