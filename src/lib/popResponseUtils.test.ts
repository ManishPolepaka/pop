import { describe, expect, it } from "vitest";
import { buildPopResponsePayload } from "./popResponseUtils";

describe("popResponseUtils", () => {
  it("stores answered POP responses", () => {
    const payload = buildPopResponsePayload(
      {
        id: "r1",
        popId: "p1",
        popContent: "What would you do if you weren't afraid?",
        name: "Morning POP",
        type: "recurring",
      },
      "I would start building my idea."
    );

    expect(payload.question).toContain("weren't afraid");
    expect(payload.answer).toBe("I would start building my idea.");
    expect(payload.status).toBe("answered");
  });

  it("stores skipped POPs as not answered", () => {
    const payload = buildPopResponsePayload(
      {
        id: "r2",
        popContent: "What are you avoiding right now?",
        type: "schedule",
      },
      "   "
    );

    expect(payload.answer).toBe("Not answered");
    expect(payload.status).toBe("skipped");
  });

  it("omits undefined optional fields for Firestore", () => {
    const payload = buildPopResponsePayload(
      {
        id: "r3",
        popContent: "What matters most right now?",
      },
      ""
    );

    expect("reminderName" in payload).toBe(false);
    expect("popId" in payload).toBe(false);
    expect("reminderType" in payload).toBe(false);
  });

  it("treats non-string dismiss values as skipped safely", () => {
    const payload = buildPopResponsePayload(
      {
        id: "r4",
        popContent: "What would momentum feel like right now?",
        type: "recurring",
      },
      { type: "click" } as unknown as string
    );

    expect(payload.answer).toBe("Not answered");
    expect(payload.status).toBe("skipped");
  });
});
