import { insightHeroLine, parseReflectionInsight } from "./parse-reflection-insight";

export interface InsightReportSnapshot {
  id: string;
  categoryId: string;
  categoryTitle: string;
  reportTitle?: string;
  answers: Record<string, string>;
  formattedInsight: string;
  matchedPrinciples?: Array<{ id?: string; principleTitle?: string }>;
  createdAt?: unknown;
}

export function reportCreatedAtMs(createdAt: unknown): number {
  if (!createdAt || typeof createdAt !== "object") return 0;
  if ("toDate" in createdAt && typeof (createdAt as { toDate: () => Date }).toDate === "function") {
    return (createdAt as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

export function sortReportsNewestFirst(reports: InsightReportSnapshot[]): InsightReportSnapshot[] {
  return [...reports].sort((a, b) => reportCreatedAtMs(b.createdAt) - reportCreatedAtMs(a.createdAt));
}

export function reportsInCategory(
  reports: InsightReportSnapshot[],
  categoryId: string
): InsightReportSnapshot[] {
  return sortReportsNewestFirst(reports.filter((r) => r.categoryId === categoryId));
}

/** Newer = reportId; older = next newest in the same category. */
export function resolveComparePair(
  reports: InsightReportSnapshot[],
  newerReportId: string
): { newer: InsightReportSnapshot; older: InsightReportSnapshot } | null {
  const newer = reports.find((r) => r.id === newerReportId);
  if (!newer) return null;
  const inCat = reportsInCategory(reports, newer.categoryId);
  const idx = inCat.findIndex((r) => r.id === newerReportId);
  const older = idx >= 0 && idx + 1 < inCat.length ? inCat[idx + 1] : null;
  if (!older) return null;
  return { newer, older };
}

export function canCompareReport(reports: InsightReportSnapshot[], reportId: string): boolean {
  return resolveComparePair(reports, reportId) !== null;
}

export type AnswerDiffStatus = "unchanged" | "changed" | "new" | "cleared";

export interface AnswerDiffRow {
  questionId: string;
  questionNumber: string;
  questionLabel?: string;
  status: AnswerDiffStatus;
  thenText: string;
  nowText: string;
}

const normalizeAnswer = (text: string) => text.trim().replace(/\s+/g, " ");

export function diffAnswers(
  older: InsightReportSnapshot,
  newer: InsightReportSnapshot,
  questionOrder: string[],
  questionLabels: Record<string, string>
): AnswerDiffRow[] {
  const ids =
    questionOrder.length > 0
      ? questionOrder
      : Array.from(new Set([...Object.keys(older.answers), ...Object.keys(newer.answers)])).sort(
          (a, b) => Number(a.replace(/\D+/g, "") || 0) - Number(b.replace(/\D+/g, "") || 0)
        );

  return ids
    .map((qId) => {
      const thenText = (older.answers[qId] ?? "").trim();
      const nowText = (newer.answers[qId] ?? "").trim();
      const n = qId.replace(/\D+/g, "") || qId;
      let status: AnswerDiffStatus;
      if (!thenText && nowText) status = "new";
      else if (thenText && !nowText) status = "cleared";
      else if (normalizeAnswer(thenText) === normalizeAnswer(nowText)) status = "unchanged";
      else status = "changed";

      return {
        questionId: qId,
        questionNumber: n,
        questionLabel: questionLabels[qId],
        status,
        thenText,
        nowText,
      };
    })
    .filter((row) => row.thenText || row.nowText);
}

export interface PrincipleDiff {
  kept: string[];
  added: string[];
  dropped: string[];
}

export function diffPrincipleTitles(
  older: InsightReportSnapshot,
  newer: InsightReportSnapshot
): PrincipleDiff {
  const titles = (r: InsightReportSnapshot) =>
    (r.matchedPrinciples ?? [])
      .map((p) => (p.principleTitle || p.id || "").trim())
      .filter(Boolean);

  const oldSet = new Set(titles(older));
  const newSet = new Set(titles(newer));
  return {
    kept: [...newSet].filter((t) => oldSet.has(t)),
    added: [...newSet].filter((t) => !oldSet.has(t)),
    dropped: [...oldSet].filter((t) => !newSet.has(t)),
  };
}

export function daysBetweenReports(
  older: InsightReportSnapshot,
  newer: InsightReportSnapshot
): number | null {
  const a = reportCreatedAtMs(older.createdAt);
  const b = reportCreatedAtMs(newer.createdAt);
  if (!a || !b) return null;
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

export interface CompareSummaryBullet {
  text: string;
}

export function buildCompareSummary(
  older: InsightReportSnapshot,
  newer: InsightReportSnapshot,
  answerDiffs: AnswerDiffRow[],
  principleDiff: PrincipleDiff
): CompareSummaryBullet[] {
  const bullets: CompareSummaryBullet[] = [];
  const days = daysBetweenReports(older, newer);

  if (days !== null) {
    bullets.push({
      text:
        days === 0
          ? "Same-day check-in—two runs close together."
          : `${days} day${days === 1 ? "" : "s"} between these reflections.`,
    });
  }

  const changed = answerDiffs.filter((r) => r.status === "changed").length;
  const unchanged = answerDiffs.filter((r) => r.status === "unchanged").length;
  const total = answerDiffs.filter((r) => r.thenText || r.nowText).length;

  if (total > 0) {
    if (changed === 0) {
      bullets.push({
        text: "Your answers are mostly the same wording—focus on how the framing or your focus may have shifted.",
      });
    } else {
      bullets.push({
        text: `${changed} of ${total} answers use different wording${unchanged > 0 ? `; ${unchanged} stayed similar` : ""}.`,
      });
    }
  }

  const q6Then = (older.answers.q6 ?? "").trim();
  const q6Now = (newer.answers.q6 ?? "").trim();
  if (q6Then && q6Now) {
    if (normalizeAnswer(q6Then) === normalizeAnswer(q6Now)) {
      const snippet = q6Now.length > 90 ? `${q6Now.slice(0, 87)}…` : q6Now;
      bullets.push({ text: `What you want ahead is still centered on: “${snippet}”` });
    } else {
      bullets.push({ text: "What you want going forward shifted between check-ins (see Q6)." });
    }
  }

  if (principleDiff.added.length > 0) {
    const names = principleDiff.added.slice(0, 2).join(", ");
    bullets.push({
      text: `New ideas this time: ${names}${principleDiff.added.length > 2 ? "…" : ""}.`,
    });
  } else if (principleDiff.kept.length > 0) {
    const names = principleDiff.kept.slice(0, 2).join(", ");
    bullets.push({
      text: `Themes that showed up both times: ${names}${principleDiff.kept.length > 2 ? "…" : ""}.`,
    });
  }

  return bullets.slice(0, 5);
}

export interface InsightCompareModel {
  older: InsightReportSnapshot;
  newer: InsightReportSnapshot;
  answerDiffs: AnswerDiffRow[];
  principleDiff: PrincipleDiff;
  summary: CompareSummaryBullet[];
  olderThread: string;
  newerThread: string;
  daysBetween: number | null;
}

export function buildInsightCompareModel(
  reports: InsightReportSnapshot[],
  newerReportId: string,
  questionLabels: Record<string, string>,
  questionOrder: string[]
): InsightCompareModel | null {
  const pair = resolveComparePair(reports, newerReportId);
  if (!pair) return null;

  const { older, newer } = pair;
  const answerDiffs = diffAnswers(older, newer, questionOrder, questionLabels);
  const principleDiff = diffPrincipleTitles(older, newer);
  const summary = buildCompareSummary(older, newer, answerDiffs, principleDiff);

  const olderParsed = parseReflectionInsight(older.formattedInsight);
  const newerParsed = parseReflectionInsight(newer.formattedInsight);
  const olderThread = olderParsed.thread.trim() || insightHeroLine(older.formattedInsight);
  const newerThread = newerParsed.thread.trim() || insightHeroLine(newer.formattedInsight);

  return {
    older,
    newer,
    answerDiffs,
    principleDiff,
    summary,
    olderThread,
    newerThread,
    daysBetween: daysBetweenReports(older, newer),
  };
}
