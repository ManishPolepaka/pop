/**
 * CATEGORY 4: PHYSICAL HEALTH & LIFESTYLE - INTEGRATION TEST
 *
 * End-to-end test validating the complete Category 4 pipeline.
 * Ensures signals, patterns, state classification, practices, and report work together.
 */

import { healthLifestyleQuestionnaire } from "../lib/questionnaire-questions-cat4";
import { physicalHealthSignalOntology, extractSignalsFromAnswers } from "../lib/signal-ontology-cat4";
import { healthPatternLibrary, detectPatterns } from "../lib/pattern-library-cat4";
import { classifyUserWellnessState } from "../lib/user-state-classification-cat4";
import { barrierPractices } from "../lib/practice-selection-cat4";

describe("Category 4: Physical Health & Lifestyle - Integration Pipeline", () => {
  
  it("should have 12 questions with correct structure", () => {
    const q = healthLifestyleQuestionnaire;
    expect(q.totalQuestions).toBe(12);
    expect(q.questions.length).toBe(12);
    expect(q.structure.scaleQuestions).toBe(5);
    expect(q.structure.multipleChoiceQuestions).toBe(5);
    expect(q.structure.openQuestions).toBe(2);
  });

  it("should have 56+ signals with answer-level mapping", () => {
    const ontology = physicalHealthSignalOntology;
    expect(ontology.totalSignals).toBeGreaterThanOrEqual(56);
    expect(Object.keys(ontology.signals).length).toBeGreaterThanOrEqual(56);

    // Check answer-level precision
    const sedentarySignal = ontology.signals.sedentary_lifestyle;
    expect(sedentarySignal.triggerAnswerMap["cat4_q1"]).toEqual(["1"]);
  });

  it("should extract signals from user answers", () => {
    const testAnswers = {
      cat4_q1: "1",  // sedentary
      cat4_q2: "1",  // dissatisfied eating
      cat4_q3: "1",  // poor sleep
      cat4_q4: "1",  // high stress
      cat4_q5: "1",  // depleted
      cat4_q6: "A",  // time barrier
      cat4_q7: "A",  // stress eating
      cat4_q8: "A",  // emotional eating
      cat4_q9: "A",  // external motivation
      cat4_q10: "E", // challenging environment
    };

    const signals = extractSignalsFromAnswers(testAnswers);
    expect(signals.sedentary_lifestyle).toBe(1);
    expect(signals.time_barrier_primary).toBe(1);
    expect(Object.keys(signals).length).toBeGreaterThan(0);
  });

  it("should have 15+ patterns", () => {
    expect(Object.keys(healthPatternLibrary).length).toBeGreaterThanOrEqual(15);
  });

  it("should detect patterns from signals", () => {
    const testAnswers = {
      cat4_q1: "1",
      cat4_q2: "1",
      cat4_q3: "1",
      cat4_q4: "1",
      cat4_q5: "1",
      cat4_q6: "A",
      cat4_q7: "A",
      cat4_q8: "A",
      cat4_q9: "C",
      cat4_q10: "E",
    };

    const signals = extractSignalsFromAnswers(testAnswers);
    const patterns = detectPatterns(signals);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].score).toBeGreaterThan(0);
  });

  it("should classify wellness state", () => {
    const crisisAnswers = {
      cat4_q1: "1", // sedentary
      cat4_q3: "1", // poor sleep
      cat4_q4: "1", // chronic stress
      cat4_q5: "1", // depleted
      cat4_q6: "D", // motivation barrier
      cat4_q7: "A", // stress eating
    };

    const signals = extractSignalsFromAnswers(crisisAnswers);
    const patterns = detectPatterns(signals).map(p => p.patternId);
    const state = classifyUserWellnessState(signals, patterns);
    
    expect(["crisis_survival", "chronic_dysregulation"]).toContain(state);
  });

  it("should have 6 barrier groups with practices", () => {
    const barriers = ["A", "B", "C", "D", "E", "F"];
    barriers.forEach(barrier => {
      expect(barrierPractices[barrier]).toBeDefined();
      expect(barrierPractices[barrier].practices.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("should have 24-30 total practices", () => {
    let totalPractices = 0;
    (Object.values(barrierPractices) as { practices: unknown[] }[]).forEach(group => {
      totalPractices += group.practices.length;
    });
    expect(totalPractices).toBeGreaterThanOrEqual(24);
    expect(totalPractices).toBeLessThanOrEqual(30);
  });

  it("should have complete end-to-end pipeline", () => {
    // Simulate user completing assessment
    const userAnswers = {
      cat4_q1: "3",
      cat4_q2: "2",
      cat4_q3: "2",
      cat4_q4: "2",
      cat4_q5: "3",
      cat4_q6: "A",
      cat4_q7: "C",
      cat4_q8: "E",
      cat4_q9: "D",
      cat4_q10: "C",
    };

    // Extract signals
    const signals = extractSignalsFromAnswers(userAnswers);
    expect(Object.keys(signals).length).toBeGreaterThan(0);

    // Detect patterns
    const patterns = detectPatterns(signals);
    expect(patterns.length).toBeGreaterThan(0);

    // Classify state
    const patternIds = patterns.map(p => p.patternId);
    const state = classifyUserWellnessState(signals, patternIds);
    expect(["crisis_survival", "chronic_dysregulation", "fragmented_efforts", "stable_foundation", "active_optimization"]).toContain(state);

    // Get barrier practices
    const primaryBarrier = userAnswers.cat4_q6 as string;
    const practices = barrierPractices[primaryBarrier];
    expect(practices).toBeDefined();
    expect(practices.practices.length).toBeGreaterThan(0);

    console.log("✓ Complete pipeline validated");
    console.log(`  Signals extracted: ${Object.keys(signals).length}`);
    console.log(`  Patterns detected: ${patterns.length}`);
    console.log(`  User state: ${state}`);
    console.log(`  Barrier: ${primaryBarrier}`);
    console.log(`  Practices available: ${practices.practices.length}`);
  });
});
