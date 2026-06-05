import { selectPracticesCat3, PracticeSelectionContext } from "../lib/practice-selection-cat3";
import { generateCat3Narrative } from "../lib/narrative-generation-cat3";
import { assembleCat3Report } from "../lib/report-assembly-cat3";

describe("Category 3: Relationships & Social Life Pipeline", () => {
  it("selects correct practices for each barrier", () => {
    const barriers = ["A", "B", "C", "D", "E", "F"];
    for (const barrierId of barriers) {
      const practices = selectPracticesCat3(barrierId as any, {});
      expect(practices.length).toBeGreaterThanOrEqual(3);
      expect(practices.every(p => p.barrierId === barrierId)).toBe(true);
    }
  });

  it("reorders practices based on detected signals", () => {
    // Barrier A (Trust) with high conflict should prioritize boundaries (A2)
    const context: PracticeSelectionContext = {
      barrierId: "A",
      detectedSignalIds: ["frequent_conflict", "avoidance_pattern"],
      secondaryFactors: {
        conflictFrequency: "frequent",
        vulnerabilityComfort: "low"
      }
    };
    
    const practices = selectPracticesCat3("A", context);
    // A2 (Boundaries) should come first when conflict is frequent
    expect(practices[0].id).toBe("A2");
    expect(practices.length).toBeGreaterThanOrEqual(3);
  });

  it("generates a narrative with pattern cycle explanation", () => {
    const context: PracticeSelectionContext = {
      barrierId: "A",
      detectedSignalIds: ["avoidance_pattern", "frequent_conflict", "isolation_pattern", "comparison_high"],
      secondaryFactors: {
        conflictFrequency: "frequent",
        vulnerabilityComfort: "low"
      }
    };
    
    const practices = selectPracticesCat3("A", context);
    const narrative = generateCat3Narrative({
      barrierId: "A",
      barrierLabel: "Trust & Safety",
      secondaryFactors: ["avoidance pattern", "frequent conflict"],
      selectedPractices: practices,
      detectedSignalIds: context.detectedSignalIds,
      coreStruggle: "I worry people will leave if I show my real self"
    });
    
    // Should include pattern cycle explanation, not just generic barrier description
    expect(narrative).toContain("protective cycle");
    expect(narrative).toContain("Practice 1");
    expect(narrative).toContain("Your Personalized Practices");
  });

  it("assembles a full report with all fields", () => {
    const practices = selectPracticesCat3("B", {
      detectedSignalIds: ["frequent_conflict", "communication_difficulty"],
      secondaryFactors: { conflictFrequency: "frequent" }
    });
    
    const report = assembleCat3Report({
      answers: { 
        cat3_q1: "2", 
        cat3_q11: "I struggle to communicate during conflicts because I tend to shut down or say things I regret. I want to be able to express myself clearly without escalating the situation.",
        cat3_q12: "I need to feel heard and understood during conversations. I want my partner to validate my feelings and work together toward solutions rather than just defending their position."
      },
      q11Text: "I struggle to communicate during conflicts because I tend to shut down or say things I regret. I want to be able to express myself clearly without escalating the situation.",
      q12Text: "I need to feel heard and understood during conversations. I want my partner to validate my feelings and work together toward solutions rather than just defending their position.",
      signals: [
        { signalId: "frequent_conflict", signalName: "Frequent Conflict", description: "", questionIds: [] },
        { signalId: "communication_difficulty", signalName: "Communication Difficulty", description: "", questionIds: [] },
        { signalId: "avoidance_pattern", signalName: "Avoidance Pattern", description: "", questionIds: [] }
      ],
      patterns: [
        { patternId: "conflict_cycle", name: "Conflict Cycle", description: "", signalIds: [] }
      ],
      userState: {
        primaryBarrier: "Communication & Repair",
        barrierId: "B",
        secondaryFactors: ["conflict avoidance"],
        quality: "high"
      },
      selectedPractices: practices
    });
    
    // Report may require adaptive interview due to quality, or may generate full report
    // Check that report is generated (either type)
    expect(report).toBeDefined();
    expect(report.answers).toBeDefined();
    expect(report.signals).toBeDefined();
    expect(report.patterns).toBeDefined();
    expect(report.userState.barrierId).toBe("B");
    // Summary should either contain barrier info or indicate data quality check
    expect(report.summary).toBeDefined();
    if (report.summary.includes("Data Quality Check") === false) {
      expect(report.summary).toContain("Communication");
      expect(report.practices.length).toBeGreaterThanOrEqual(3);
      expect(report.narrative).toContain("Practices");
    }
    expect(report.dataQuality).toBeDefined();
  });
});
