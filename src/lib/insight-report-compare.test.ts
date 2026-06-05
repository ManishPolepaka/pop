import { describe, expect, it } from "vitest";
import {
  buildCompareSummary,
  buildInsightCompareModel,
  canCompareReport,
  diffAnswers,
  resolveComparePair,
} from "./insight-report-compare";

const base = (id: string, categoryId: string, answers: Record<string, string>, iso: string) => ({
  id,
  categoryId,
  categoryTitle: "Test",
  answers,
  formattedInsight: "## What we're seeing\n\nThread " + id + ".\n\n## Ideas that fit",
  matchedPrinciples: [{ id: "p1", principleTitle: "Principle A" }],
  createdAt: { toDate: () => new Date(iso) },
});

describe("insight-report-compare", () => {
  const reports = [
    base("new", "cat1", { q1: "b", q6: "grow" }, "2026-03-10T12:00:00Z"),
    base("old", "cat1", { q1: "a", q6: "grow" }, "2026-03-01T12:00:00Z"),
  ];

  it("pairs newer with previous in category", () => {
    const pair = resolveComparePair(reports, "new");
    expect(pair?.older.id).toBe("old");
    expect(pair?.newer.id).toBe("new");
    expect(canCompareReport(reports, "new")).toBe(true);
    expect(canCompareReport(reports, "old")).toBe(false);
  });

  it("diffs answers and builds summary", () => {
    const model = buildInsightCompareModel(reports, "new", { q1: "Q1?" }, ["q1", "q6"]);
    expect(model).not.toBeNull();
    expect(model!.answerDiffs.find((r) => r.questionId === "q1")?.status).toBe("changed");
    expect(model!.daysBetween).toBe(9);
    const summary = buildCompareSummary(
      model!.older,
      model!.newer,
      model!.answerDiffs,
      model!.principleDiff
    );
    expect(summary.length).toBeGreaterThan(0);
  });

  it("marks identical answers unchanged", () => {
    const diffs = diffAnswers(
      base("o", "c", { q2: "same text" }, "2026-01-01"),
      base("n", "c", { q2: "same text" }, "2026-02-01"),
      ["q2"],
      {}
    );
    expect(diffs[0]?.status).toBe("unchanged");
  });
});
