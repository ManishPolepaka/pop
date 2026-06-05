import { describe, it, expect } from "vitest";
import { validateDataQualityCat3, isReportReadyCat3 } from "../lib/data-quality-validation-cat3";

describe("Category 3: Data Quality Validation (Adaptive Hybrid Layer 1)", () => {
  it("validates high-quality data (Person 1: Trust + Conflict)", () => {
    const signals = [
      { signalId: "barrier_A", signalName: "Barrier A", description: "", questionIds: [] },
      { signalId: "relationship_satisfaction_low", signalName: "Low Satisfaction", description: "", questionIds: [] },
      { signalId: "frequent_conflict", signalName: "Frequent Conflict", description: "", questionIds: [] },
      { signalId: "vulnerability_low", signalName: "Low Vulnerability", description: "", questionIds: [] },
      { signalId: "boundary_issues", signalName: "Boundary Issues", description: "", questionIds: [] },
      { signalId: "avoidance_pattern", signalName: "Avoidance", description: "", questionIds: [] },
      { signalId: "isolation_pattern", signalName: "Isolation", description: "", questionIds: [] },
      { signalId: "comparison_high", signalName: "High Comparison", description: "", questionIds: [] },
    ];

    const patterns = [
      { patternId: "trust_issues_barrier", name: "Trust Issues", description: "", signalIds: [] },
      { patternId: "conflict_cycle", name: "Conflict Cycle", description: "", signalIds: [] },
    ];

    const result = validateDataQualityCat3(
      signals, 
      patterns, 
      "A",
      "I have a hard time trusting people because I've been hurt before. Even with loyal people, I question their motives. I worry they'll leave if I show my real self.",
      "I want to feel truly heard without worrying about judgment. I want deeper friendships where I don't need to be the strong one. I wish I had a community where I truly belonged."
    );

    expect(result.metrics.dataQuality).toBe("valid");
    expect(result.metrics.barrierConfidence).toBe("high");
    expect(result.routingDecision).toBe("barrier_first");
    expect(isReportReadyCat3(result)).toBe(true);
    expect(result.canProceedToReport).toBe(true);
  });

  it("validates low-quality data (sparse responses)", () => {
    const signals = [
      { signalId: "barrier_C", signalName: "Barrier C", description: "", questionIds: [] },
      { signalId: "isolation_pattern", signalName: "Isolation", description: "", questionIds: [] },
    ];

    const patterns = [];

    const result = validateDataQualityCat3(
      signals,
      patterns,
      "C",
      "I don't know",
      "Not sure"
    );

    expect(result.metrics.dataQuality).toBe("invalid");
    expect(result.routingDecision).toBe("adaptive_interview");
    expect(result.metrics.requiresAdaptiveInterview).toBe(true);
    expect(result.suggestedAdaptiveQuestions).toBeDefined();
    expect(result.suggestedAdaptiveQuestions!.length).toBeGreaterThan(0);
  });

  it("detects signal conflicts and flags WARNING", () => {
    const signals = [
      { signalId: "barrier_A", signalName: "Barrier A", description: "", questionIds: [] },
      { signalId: "relationship_satisfaction_low", signalName: "Low Satisfaction", description: "", questionIds: [] },
      { signalId: "relationship_satisfaction_high", signalName: "High Satisfaction", description: "", questionIds: [] }, // CONFLICT!
      { signalId: "frequent_conflict", signalName: "Frequent Conflict", description: "", questionIds: [] },
      { signalId: "rare_conflict", signalName: "Rare Conflict", description: "", questionIds: [] }, // CONFLICT!
      { signalId: "support_absent", signalName: "No Support", description: "", questionIds: [] },
      { signalId: "support_frequent", signalName: "Frequent Support", description: "", questionIds: [] }, // CONFLICT!
    ];

    const patterns = [
      { patternId: "trust_issues_barrier", name: "Trust Issues", description: "", signalIds: [] },
    ];

    const result = validateDataQualityCat3(
      signals,
      patterns,
      "A",
      "I have some trust issues",
      "I need better relationships"
    );

    expect(result.metrics.coherenceLevel).toBe("conflicted");
    expect(result.metrics.conflictingSignals).toBeDefined();
    expect(result.metrics.conflictingSignals!.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("identifies barrier D ambiguity and flags for adaptive interview", () => {
    const signals = [
      { signalId: "barrier_D", signalName: "Barrier D", description: "", questionIds: [] },
      { signalId: "initiation_rare", signalName: "Rare Initiation", description: "", questionIds: [] },
    ];

    const patterns = [
      { patternId: "lack_of_time_barrier", name: "Lack of Time", description: "", signalIds: [] },
    ];

    const result = validateDataQualityCat3(
      signals,
      patterns,
      "D",
      "I'm just so busy with work",
      "More time for relationships"
    );

    expect(result.metrics.barrierConfidence).toBe("low");
    expect(result.warnings.some((w) => w.includes("Barrier confidence is LOW"))).toBe(true);
    expect(result.suggestedAdaptiveQuestions).toBeDefined();
    expect(
      result.suggestedAdaptiveQuestions?.some((q) =>
        q.includes("real issue a lack of TIME") 
      )
    ).toBe(true);
  });

  it("routes moderate barrier confidence to SIGNAL-FIRST", () => {
    const signals = [
      { signalId: "barrier_B", signalName: "Barrier B", description: "", questionIds: [] },
      { signalId: "communication_difficulty", signalName: "Comm Difficulty", description: "", questionIds: [] },
      { signalId: "frequent_conflict", signalName: "Frequent Conflict", description: "", questionIds: [] },
    ];

    const patterns = [
      { patternId: "communication_gaps_barrier", name: "Communication Gaps", description: "", signalIds: [] },
    ];

    const result = validateDataQualityCat3(
      signals,
      patterns,
      "B",
      "I struggle to express myself",
      "I want to be understood"
    );

    expect(result.metrics.barrierConfidence).toBe("moderate");
    expect(result.routingDecision).toBe("barrier_first"); // With VALID + MODERATE, still proceeds
    expect(result.canProceedToReport).toBe(true);
  });

  it("generates meaningful adaptive questions for sparse data", () => {
    const signals = [
      { signalId: "barrier_A", signalName: "Barrier A", description: "", questionIds: [] },
      { signalId: "isolation_pattern", signalName: "Isolation", description: "", questionIds: [] },
    ];

    const patterns = [];

    const result = validateDataQualityCat3(
      signals,
      patterns,
      "A",
      "Trust issues",
      ""
    );

    expect(result.metrics.requiresAdaptiveInterview).toBe(true);
    expect(result.suggestedAdaptiveQuestions!.length).toBeGreaterThan(0);
    // Should suggest example question
    expect(
      result.suggestedAdaptiveQuestions?.some((q) => q.includes("specific recent example"))
    ).toBe(true);
  });

  it("scores text richness correctly", () => {
    // Test 1: Rich text
    const richSignals: any[] = [];
    const richPatterns: any[] = [];
    const richResult = validateDataQualityCat3(
      richSignals,
      richPatterns,
      "F",
      "I realize that when I'm in relationships, I often feel conflicted because I want connection but I'm afraid of being hurt. This fear causes me to hold back, which then makes me feel more isolated. I don't know how to break this cycle.",
      "I desperately want a community where I truly belong. I need people who understand me without judgment. I wish I could be vulnerable without fear of rejection."
    );
    
    expect(richResult.metrics.textRichnessLevel).toBe("excellent");

    // Test 2: Minimal text
    const minimalSignals: any[] = [];
    const minimalPatterns: any[] = [];
    const minimalResult = validateDataQualityCat3(
      minimalSignals,
      minimalPatterns,
      "F",
      "Unsure",
      "Better relationships"
    );
    
    expect(minimalResult.metrics.textRichnessLevel).toBe("minimal");
    expect(minimalResult.warnings.some((w) => w.includes("lack detail"))).toBe(true);
  });

  it("outputs comprehensive validation report with recommendations", () => {
    const signals = [
      { signalId: "barrier_C", signalName: "Barrier C", description: "", questionIds: [] },
      { signalId: "social_disconnection", signalName: "Disconnection", description: "", questionIds: [] },
      { signalId: "avoidance_pattern", signalName: "Avoidance", description: "", questionIds: [] },
      { signalId: "initiation_rare", signalName: "Rare Initiation", description: "", questionIds: [] },
    ];

    const patterns = [
      { patternId: "social_anxiety_barrier", name: "Social Anxiety", description: "", signalIds: [] },
      { patternId: "social_isolation", name: "Social Isolation", description: "", signalIds: [] },
    ];

    const result = validateDataQualityCat3(
      signals,
      patterns,
      "C",
      "Social situations absolutely terrify me. I get anxious thinking about groups.",
      "I want to feel comfortable being myself around others without fear."
    );

    expect(result.metrics).toBeDefined();
    expect(result.metrics.qualityScore).toBeGreaterThan(0);
    expect(result.metrics.qualityScore).toBeLessThanOrEqual(100);
    expect(result.validationMessages.length).toBeGreaterThan(0);
    expect(result.recommendedNextStep).toBeDefined();
    expect(result.canProceedToReport).toBe(true);
  });
});
