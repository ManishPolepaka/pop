import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLegacyReminderStorage,
  loadLastDeliveryKeys,
  persistLastDeliveryKeys,
} from "./reminderStorage";

describe("reminderStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("clears legacy local reminder data on refresh", () => {
    window.localStorage.setItem(
      "reminders",
      JSON.stringify([{ id: "old-1", time: "09:00", message: "legacy" }])
    );

    clearLegacyReminderStorage();

    expect(window.localStorage.getItem("reminders")).toBeNull();
  });

  it("keeps unrelated local storage entries intact", () => {
    window.localStorage.setItem("reminders", JSON.stringify([{ id: "old-1" }]));
    window.localStorage.setItem("theme", "dark");

    clearLegacyReminderStorage();

    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("persists delivered reminder keys across refreshes", () => {
    persistLastDeliveryKeys({
      recurring1: "recurring1:recurring:1713110400000",
      schedule1: "schedule1:schedule:2026-04-14:09:00",
    });

    expect(loadLastDeliveryKeys()).toEqual({
      recurring1: "recurring1:recurring:1713110400000",
      schedule1: "schedule1:schedule:2026-04-14:09:00",
    });
  });
});
