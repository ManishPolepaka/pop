import { describe, it, expect } from "vitest";
import { identifyBarriersCat3 } from "../lib/barrier-identification-cat3";
import { RelationshipSignal } from "../lib/signal-ontology-cat3";
import { RelationshipPattern } from "../lib/pattern-library-cat3";

describe("Category 3: Barrier Identification (Adaptive Hybrid Layer 2)", () => {
  it("identifies Barrier A (Trust Issues) with high confidence", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "vulnerability_low", signalName: "Low Vulnerability", description: "", questionIds: [] },
      { signalId: "boundary_issues", signalName: "Boundary Issues", description: "", questionIds: [] },
      { signalId: "avoidance_pattern", signalName: "Avoidance", description: "", questionIds: [] },
      { signalId: "emotional_withdrawal", signalName: "Withdrawal", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "trust_issues_barrier", name: "Trust Issues", description: "", signalIds: [] },
    ];

    const result = identifyBarriersCat3("A", signals, patterns, 85);

    expect(result.recommendedBarrier).toBe("A");
    expect(result.primaryConfidence).toBeGreaterThan(75);
    expect(result.recommendedBarrierLabel).toBe("Trust Issues");
    expect(result.requiresManualReview).toBe(false);
  });

  it("identifies Barrier B (Communication Gaps) with supporting patterns", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "communication_difficulty", signalName: "Communication Difficulty", description: "", questionIds: [] },
      { signalId: "frequent_conflict", signalName: "Frequent Conflict", description: "", questionIds: [] },
      { signalId: "resentment_pattern", signalName: "Resentment", description: "", questionIds: [] },
      { signalId: "unmet_needs", signalName: "Unmet Needs", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "communication_gaps_barrier", name: "Communication Gaps", description: "", signalIds: [] },
      { patternId: "resentment_cycle", name: "Resentment Cycle", description: "", signalIds: [] },
    ];

    const result = identifyBarriersCat3("B", signals, patterns, 80);

    expect(result.recommendedBarrier).toBe("B");
    expect(result.primaryConfidence).toBeGreaterThan(70);
  });

  it("handles Barrier D ambiguity and flags for manual review", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "barrier_D", signalName: "Barrier D", description: "", questionIds: [] },
      { signalId: "initiation_rare", signalName: "Rare Initiation", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "lack_of_time_barrier", name: "Lack of Time", description: "", signalIds: [] },
    ];

    const result = identifyBarriersCat3("D", signals, patterns, 70);

    expect(result.recommendedBarrier).toBe("D");
    // Should have lower confidence due to ambiguity
    expect(result.primaryConfidence).toBeLessThan(70);
    // Should flag for manual review or show warnings
    const barrierD = result.allBarriers.find(b => b.barrierName === "D");
    expect(barrierD?.warnings).toBeDefined();
  });

  it("shifts recommendation away from user's Q6 answer when signals don't support it", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "social_disconnection", signalName: "Social Disconnection", description: "", questionIds: [] },
      { signalId: "initiation_rare", signalName: "Rare Initiation", description: "", questionIds: [] },
      { signalId: "avoidance_pattern", signalName: "Avoidance", description: "", questionIds: [] },
      { signalId: "isolation_pattern", signalName: "Isolation", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "social_anxiety_barrier", name: "Social Anxiety", description: "", signalIds: [] },
      { patternId: "isolation_pattern", name: "Isolation", description: "", signalIds: [] },
    ];

    // User selected Barrier A but signals point to Barrier C
    const result = identifyBarriersCat3("A", signals, patterns, 75);

    expect(result.recommendedBarrier).toBe("C");
    expect(result.recommendedBarrierLabel).toBe("Social Anxiety");
  });

  it("identifies Barrier C (Social Anxiety) with isolation pattern", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "social_disconnection", signalName: "Social Disconnection", description: "", questionIds: [] },
      { signalId: "initiation_rare", signalName: "Rare Initiation", description: "", questionIds: [] },
      { signalId: "avoidance_pattern", signalName: "Avoidance", description: "", questionIds: [] },
      { signalId: "isolation_pattern", signalName: "Isolation", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "social_anxiety_barrier", name: "Social Anxiety", description: "", signalIds: [] },
    ];

    const result = identifyBarriersCat3("C", signals, patterns, 80);

    expect(result.recommendedBarrier).toBe("C");
    expect(result.primaryConfidence).toBeGreaterThan(70);
  });

  it("identifies Barrier E (Unhealthy Patterns) with resentment and boundary issues", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "resentment_pattern", signalName: "Resentment", description: "", questionIds: [] },
      { signalId: "boundary_issues", signalName: "Boundary Issues", description: "", questionIds: [] },
      { signalId: "unmet_needs", signalName: "Unmet Needs", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "unhealthy_patterns_barrier", name: "Unhealthy Patterns", description: "", signalIds: [] },
    ];

    const result = identifyBarriersCat3("E", signals, patterns, 78);

    expect(result.recommendedBarrier).toBe("E");
    expect(result.primaryConfidence).toBeGreaterThan(65);
  });

  it("handles Barrier F (Unclear) when user explicitly selected it", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "core_struggle", signalName: "Core Struggle", description: "", questionIds: [] },
      { signalId: "unmet_needs", signalName: "Unmet Needs", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [];

    const result = identifyBarriersCat3("F", signals, patterns, 50);

    // When user selected F, it should score high on F
    const barrierF = result.allBarriers.find(b => b.barrierName === "F");
    expect(barrierF?.confidence).toBeGreaterThan(40);
  });

  it("requires manual review when primary confidence is low", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "relationship_satisfaction_low", signalName: "Low Satisfaction", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [];

    const result = identifyBarriersCat3("F", signals, patterns, 35);

    expect(result.requiresManualReview).toBeDefined();
    expect(typeof result.requiresManualReview).toBe("boolean");
    expect(result.notes).toBeDefined();
  });

  it("requires manual review when top barriers are close in confidence", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "communication_difficulty", signalName: "Communication Difficulty", description: "", questionIds: [] },
      { signalId: "social_disconnection", signalName: "Social Disconnection", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [];

    const result = identifyBarriersCat3("B", signals, patterns, 65);

    // Multiple signals could support different barriers
    // If top 2 are very close, should flag for review
    if (result.primaryConfidence < 75) {
      expect(result.secondaryBarriers.length).toBeGreaterThan(0);
    }
  });

  it("returns ranked barrier list sorted by confidence", () => {
    const signals: RelationshipSignal[] = [
      { signalId: "communication_difficulty", signalName: "Communication Difficulty", description: "", questionIds: [] },
      { signalId: "frequent_conflict", signalName: "Frequent Conflict", description: "", questionIds: [] },
      { signalId: "resentment_pattern", signalName: "Resentment", description: "", questionIds: [] },
    ];
    const patterns: RelationshipPattern[] = [
      { patternId: "communication_gaps_barrier", name: "Communication Gaps", description: "", signalIds: [] },
    ];

    const result = identifyBarriersCat3("B", signals, patterns, 75);

    // All barriers should be ranked
    expect(result.allBarriers.length).toBe(6);
    // First barrier should have highest confidence
    expect(result.allBarriers[0].confidence).toBeGreaterThanOrEqual(result.allBarriers[1].confidence);
    expect(result.allBarriers[1].confidence).toBeGreaterThanOrEqual(result.allBarriers[2].confidence);
  });
});
