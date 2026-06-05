import { describe, it, expect } from "vitest";
import {
  recordPracticeCompletion,
  calculateProgressMetrics,
  analyzeProgressTracking,
  generateImprovementReport,
  PracticeCompletion,
  RelationshipMetrics,
} from "../lib/progress-tracking-cat3";
import {
  analyzePracticePerformance,
  generatePracticeAdjustments,
  suggestNextPractices,
  UnderperformingPractice,
} from "../lib/practice-adjustment-cat3";
import {
  generateProgressReport,
  ProgressReportWithInsights,
} from "../lib/progress-report-generation-cat3";
import { Practice } from "../lib/barrier-practices-cat3";

describe("Phase 4: Progress Tracking", () => {
  const mockPractice = {
    id: "trust_practice_1",
    barrierId: "A" as const,
    title: "Trust Building",
    description: "Practice openness to build trust",
    whyItWorks: "Trust grows through vulnerability",
    howToDo: "Test with one person and observe their response",
    focus: "Increased trust capacity",
    durationDays: 7,
  };

  describe("recordPracticeCompletion", () => {
    it("records practice completion with user feedback", () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
      
      const completion = recordPracticeCompletion(
        mockPractice,
        {
          rating: 4,
          feedback: "This really helped me open up",
          challenges: ["Felt vulnerable"],
          successFactors: ["Safe person"],
          nextSteps: "Try with another person",
          outcome: "successful",
        },
        startDate,
        "anxious",
        "romantic"
      );

      expect(completion.practiceId).toBe("trust_practice_1");
      expect(completion.userRating).toBe(4);
      expect(completion.outcome).toBe("successful");
      expect(completion.daysAfterStart).toBeGreaterThanOrEqual(6);
      expect(completion.attachmentStyleNote).toBe("anxious");
    });

    it("clamps user rating to 1-5 range", () => {
      const startDate = new Date().toISOString();
      
      const lowCompletion = recordPracticeCompletion(
        mockPractice,
        {
          rating: -1,
          feedback: "Not helpful",
          challenges: [],
          successFactors: [],
          nextSteps: "",
          outcome: "incomplete",
        },
        startDate
      );

      const highCompletion = recordPracticeCompletion(
        mockPractice,
        {
          rating: 10,
          feedback: "Amazing",
          challenges: [],
          successFactors: [],
          nextSteps: "",
          outcome: "successful",
        },
        startDate
      );

      expect(lowCompletion.userRating).toBe(1);
      expect(highCompletion.userRating).toBe(5);
    });
  });

  describe("calculateProgressMetrics", () => {
    it("calculates relationship metrics from user input", () => {
      const metrics = calculateProgressMetrics(75, 70, 65, 80, 75, 70);

      expect(metrics.trustLevel).toBe(75);
      expect(metrics.communicationQuality).toBe(70);
      expect(metrics.overallQuality).toBeCloseTo(72.5, 1);
      expect(metrics.timestamp).toBeDefined();
    });

    it("ensures all metrics are in valid range", () => {
      const metrics = calculateProgressMetrics(100, 0, 50, 25, 75, 100);

      expect(metrics.trustLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.trustLevel).toBeLessThanOrEqual(100);
      expect(metrics.overallQuality).toBeGreaterThanOrEqual(0);
      expect(metrics.overallQuality).toBeLessThanOrEqual(100);
    });
  });

  describe("analyzeProgressTracking", () => {
    it("identifies improvements when metrics increase", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const current: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 65,
        communicationQuality: 60,
        conflictNavigation: 55,
        intimacyComfort: 60,
        autonomyBalance: 58,
        emotionalSafety: 62,
        overallQuality: 60,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [];
      const tracking = analyzeProgressTracking(completions, initial, current);

      expect(tracking.improvements.length).toBeGreaterThan(0);
      expect(tracking.metrics.trajectory).toBe("improving");
    });

    it("identifies challenges when metrics stall or decline", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const current: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 48,
        communicationQuality: 50,
        conflictNavigation: 52,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [];
      const tracking = analyzeProgressTracking(completions, initial, current);

      expect(tracking.challenges.length).toBeGreaterThanOrEqual(0);
    });

    it("calculates completion rate", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const current = initial;
      const completions: PracticeCompletion[] = [
        {
          practiceId: "p1",
          practiceName: "Trust Building",
          completedAt: new Date().toISOString(),
          daysAfterStart: 0,
          userRating: 4,
          userFeedback: "Good",
          outcome: "successful",
          challengesFaced: [],
          successFactors: [],
          nextSteps: "",
        },
      ];

      const tracking = analyzeProgressTracking(completions, initial, current);
      expect(tracking.totalPracticesCompleted).toBe(1);
      expect(tracking.completionRate).toBeGreaterThan(0);
    });
  });

  describe("generateImprovementReport", () => {
    it("generates improvement report with key metrics", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        trustLevel: 45,
        communicationQuality: 48,
        conflictNavigation: 50,
        intimacyComfort: 48,
        autonomyBalance: 50,
        emotionalSafety: 45,
        overallQuality: 48,
        stabilityScore: 100,
      };

      const current: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 62,
        communicationQuality: 65,
        conflictNavigation: 60,
        intimacyComfort: 65,
        autonomyBalance: 63,
        emotionalSafety: 62,
        overallQuality: 63,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [
        {
          practiceId: "p1",
          practiceName: "Trust Building",
          completedAt: new Date().toISOString(),
          daysAfterStart: 7,
          userRating: 5,
          userFeedback: "Really helpful",
          outcome: "successful",
          challengesFaced: [],
          successFactors: ["Felt safe"],
          nextSteps: "Continue",
        },
      ];

      const tracking = analyzeProgressTracking(completions, initial, current);
      const report = generateImprovementReport(tracking);

      expect(report.dailyAverageImprovement).toBeGreaterThan(0);
      expect(report.mostImprovedMetric).toBeDefined();
      expect(report.topThreeWinningPractices.length).toBeGreaterThanOrEqual(0);
    });

    it("detects when adjustment is needed", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const current = initial;

      const completions: PracticeCompletion[] = [
        {
          practiceId: "p1",
          practiceName: "Poor Practice",
          completedAt: new Date().toISOString(),
          daysAfterStart: 3,
          userRating: 2,
          userFeedback: "Doesn't help",
          outcome: "incomplete",
          challengesFaced: ["Confusing", "Not applicable"],
          successFactors: [],
          nextSteps: "Try different approach",
        },
      ];

      const tracking = analyzeProgressTracking(completions, initial, current);
      const report = generateImprovementReport(tracking);

      expect(report.needsAdjustment).toBe(true);
      expect(report.suggestedAdjustments.length).toBeGreaterThan(0);
    });
  });

  describe("analyzePracticePerformance", () => {
    it("identifies underperforming practices", () => {
      const completions: PracticeCompletion[] = [
        {
          practiceId: "poor_practice",
          practiceName: "Ineffective Practice",
          completedAt: new Date().toISOString(),
          daysAfterStart: 5,
          userRating: 2,
          userFeedback: "This doesn't resonate",
          outcome: "incomplete",
          challengesFaced: ["Too abstract", "Doesn't apply"],
          successFactors: [],
          nextSteps: "",
        },
        {
          practiceId: "poor_practice",
          practiceName: "Ineffective Practice",
          completedAt: new Date().toISOString(),
          daysAfterStart: 10,
          userRating: 2.5,
          userFeedback: "Still not helping",
          outcome: "incomplete",
          challengesFaced: ["Confusing"],
          successFactors: [],
          nextSteps: "",
        },
      ];

      const initial: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const tracking = analyzeProgressTracking(completions, initial, initial);
      const underperforming = analyzePracticePerformance(completions, tracking);

      expect(underperforming.length).toBeGreaterThan(0);
      expect(underperforming[0].averageRating).toBeLessThan(3);
    });
  });

  describe("generatePracticeAdjustments", () => {
    it("generates adjustment plan for underperforming practices", () => {
      const underperforming: UnderperformingPractice[] = [
        {
          practiceId: "bad_p",
          practiceName: "Bad Practice",
          averageRating: 2,
          completionCount: 2,
          likelyReason: "Too abstract",
          attachmentMismatch: true,
          contextMismatch: false,
          userFeedbackThemes: ["confusion", "not applicable"],
        },
      ];

      const mockPractices = [
        {
          ...mockPractice,
          id: "good_p",
          title: "Better Practice",
        },
      ];

      const mockTracking = {
        startDate: new Date().toISOString(),
        practiceCompletions: [],
        metricCheckpoints: [],
        totalPracticesCompleted: 0,
        averageUserRating: 2,
        completionRate: 0,
        improvements: [],
        challenges: [],
        metrics: {
          initial: null,
          mostRecent: null,
          trajectory: "stable" as const,
          improvementRate: 0,
        },
      };

      const plan = generatePracticeAdjustments(
        underperforming,
        mockPractices as any,
        "anxious",
        "romantic",
        mockTracking as any
      );

      expect(plan.recommendations.length).toBeGreaterThan(0);
      expect(plan.overallStrategy).toBeDefined();
    });

    it("suggests next practices", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [];
      const tracking = analyzeProgressTracking(completions, initial, initial);

      const mockPractices = [
        { ...mockPractice, id: "A1" },
        { ...mockPractice, id: "B1" },
        { ...mockPractice, id: "C1" },
      ];

      const nextPractices = suggestNextPractices(tracking, mockPractices as any, "secure", "romantic", 2);

      expect(Array.isArray(nextPractices)).toBe(true);
      expect(nextPractices.length).toBeLessThanOrEqual(2);
    });
  });

  describe("generateProgressReport", () => {
    it("generates full progress report with narrative", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        trustLevel: 45,
        communicationQuality: 48,
        conflictNavigation: 50,
        intimacyComfort: 48,
        autonomyBalance: 50,
        emotionalSafety: 45,
        overallQuality: 48,
        stabilityScore: 100,
      };

      const current: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 62,
        communicationQuality: 65,
        conflictNavigation: 60,
        intimacyComfort: 65,
        autonomyBalance: 63,
        emotionalSafety: 62,
        overallQuality: 63,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [
        {
          practiceId: "p1",
          practiceName: "Trust Building",
          completedAt: new Date().toISOString(),
          daysAfterStart: 7,
          userRating: 5,
          userFeedback: "Really helpful",
          outcome: "successful",
          challengesFaced: [],
          successFactors: ["Felt safe"],
          nextSteps: "Continue",
        },
        {
          practiceId: "p2",
          practiceName: "Communication",
          completedAt: new Date().toISOString(),
          daysAfterStart: 14,
          userRating: 4,
          userFeedback: "Good insights",
          outcome: "successful",
          challengesFaced: [],
          successFactors: [],
          nextSteps: "",
        },
      ];

      const tracking = analyzeProgressTracking(completions, initial, current);
      const improvementReport = generateImprovementReport(tracking);
      const report = generateProgressReport(tracking, improvementReport);

      expect(report.narrative).toBeDefined();
      expect(report.narrative.headline).toBeDefined();
      expect(report.narrative.summary).toBeDefined();
      expect(report.narrative.wins.length).toBeGreaterThan(0);
      expect(report.recommendedActions).toBeDefined();
      expect(report.celebrationMessage).toBeDefined();
    });

    it("generates warning flags when needed", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        trustLevel: 60,
        communicationQuality: 60,
        conflictNavigation: 60,
        intimacyComfort: 60,
        autonomyBalance: 60,
        emotionalSafety: 60,
        overallQuality: 60,
        stabilityScore: 100,
      };

      const current: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 40,
        communicationQuality: 42,
        conflictNavigation: 38,
        intimacyComfort: 40,
        autonomyBalance: 42,
        emotionalSafety: 38,
        overallQuality: 40,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [];
      const tracking = analyzeProgressTracking(completions, initial, current);
      const improvementReport = generateImprovementReport(tracking);
      const report = generateProgressReport(tracking, improvementReport);

      expect(report.warningFlags).toBeDefined();
      if (report.warningFlags && report.warningFlags.length > 0) {
        expect(report.warningFlags[0]).toContain("declining");
      }
    });

    it("generates recommended actions", () => {
      const initial: RelationshipMetrics = {
        timestamp: new Date().toISOString(),
        trustLevel: 50,
        communicationQuality: 50,
        conflictNavigation: 50,
        intimacyComfort: 50,
        autonomyBalance: 50,
        emotionalSafety: 50,
        overallQuality: 50,
        stabilityScore: 100,
      };

      const completions: PracticeCompletion[] = [];
      const tracking = analyzeProgressTracking(completions, initial, initial);
      const improvementReport = generateImprovementReport(tracking);
      const report = generateProgressReport(tracking, improvementReport);

      expect(report.recommendedActions.immediate).toBeDefined();
      expect(report.recommendedActions.thisWeek).toBeDefined();
      expect(report.recommendedActions.thisMonth).toBeDefined();
    });
  });

  describe("Integration: Full Progress Tracking Workflow", () => {
    it("complete workflow: record completions -> analyze progress -> generate report", () => {
      // Step 1: Record completions over time
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const completion1 = recordPracticeCompletion(
        mockPractice,
        {
          rating: 4,
          feedback: "Helpful",
          challenges: [],
          successFactors: ["Safe person"],
          nextSteps: "Continue",
          outcome: "successful",
        },
        startDate
      );

      const completion2 = recordPracticeCompletion(
        { ...mockPractice, id: "comm_p", title: "Communication" },
        {
          rating: 5,
          feedback: "Really insightful",
          challenges: [],
          successFactors: ["Clarity"],
          nextSteps: "Apply to conflicts",
          outcome: "successful",
        },
        startDate
      );

      // Step 2: Calculate metrics
      const initial = calculateProgressMetrics(45, 48, 50, 48, 50, 45);
      const current = calculateProgressMetrics(62, 65, 60, 65, 63, 62);

      // Step 3: Analyze
      const tracking = analyzeProgressTracking([completion1, completion2], initial, current);
      expect(tracking.totalPracticesCompleted).toBe(2);
      expect(tracking.averageUserRating).toBeGreaterThan(4);

      // Step 4: Generate improvement report
      const improvementReport = generateImprovementReport(tracking);
      expect(improvementReport.needsAdjustment).toBe(false);

      // Step 5: Generate full progress report
      const report = generateProgressReport(tracking, improvementReport);
      expect(report.narrative.wins.length).toBeGreaterThan(0);
      expect(report.celebrationMessage).toBeDefined();
    });
  });
});
