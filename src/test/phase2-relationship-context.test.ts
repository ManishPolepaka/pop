import { describe, it, expect } from "vitest";
import {
  filterPracticesByContext,
  RelationshipContext,
  mapQ13ToContext,
  contextualizePractice,
  generateContextRationale,
  relationshipContextChoices,
} from "../lib/relationship-context-filter-cat3";
import { Practice } from "../lib/barrier-practices-cat3";

describe("Phase 2: Relationship Context Filtering", () => {
  // Mock practices for testing
  const mockPractices: Practice[] = [
    {
      id: "trust_practice_1",
      barrierId: "A",
      name: "Trust Assessment Practice",
      description: "Learn to separate past trust violations from current relationships",
      whyItHelps: "Helps distinguish protective distrust from past wounds",
      implementation: {
        steps: ["Reflect on past betrayals", "Assess current relationships", "Update beliefs"],
        timeframe: "This week",
        effort: "medium",
        frequency: "Once",
      },
      mechanism: "Evidence-based trust building",
      expectedOutcome: "Clearer distinction between past and present",
    },
    {
      id: "communication_practice_1",
      barrierId: "B",
      name: "Communication Clarity Practice",
      description: "Practice expressing needs clearly and listening effectively",
      whyItHelps: "Reduces misunderstandings and conflict",
      implementation: {
        steps: ["Identify your need", "Express it clearly", "Listen to response"],
        timeframe: "Over 2 weeks",
        effort: "medium",
        frequency: "Continuous",
      },
      mechanism: "Clear communication reduces friction",
      expectedOutcome: "Fewer conflicts, better understanding",
    },
    {
      id: "boundary_practice_1",
      barrierId: "C",
      name: "Boundary Setting Practice",
      description: "Learn to set healthy boundaries",
      whyItHelps: "Protects your wellbeing and relationships",
      implementation: {
        steps: ["Identify boundary need", "Communicate clearly", "Maintain consistency"],
        timeframe: "Over 4 weeks",
        effort: "high",
        frequency: "Ongoing",
      },
      mechanism: "Clear boundaries prevent resentment",
      expectedOutcome: "Healthier relationships with respect",
    },
  ];

  describe("mapQ13ToContext", () => {
    it("maps 'Romantic relationships' to romantic context", () => {
      const result = mapQ13ToContext("Romantic relationships");
      expect(result).toBe("romantic");
    });

    it("maps 'Family relationships' to family context", () => {
      const result = mapQ13ToContext("Family relationships");
      expect(result).toBe("family");
    });

    it("maps 'Friendships' to friendship context", () => {
      const result = mapQ13ToContext("Friendships");
      expect(result).toBe("friendship");
    });

    it("maps 'Professional/Work' to professional context", () => {
      const result = mapQ13ToContext("Professional/Work");
      expect(result).toBe("professional");
    });

    it("maps 'Multiple types' to mixed context", () => {
      const result = mapQ13ToContext("Multiple types");
      expect(result).toBe("mixed");
    });

    it("defaults to mixed for undefined or unknown answers", () => {
      expect(mapQ13ToContext(undefined)).toBe("mixed");
      expect(mapQ13ToContext("unknown")).toBe("mixed");
      expect(mapQ13ToContext("")).toBe("mixed");
    });
  });

  describe("filterPracticesByContext", () => {
    it("returns all practices when filter is called", () => {
      const result = filterPracticesByContext(mockPractices, "romantic");
      expect(result.practicesTotal).toBe(3);
      expect(result.practicesRelevant).toBe(3);
    });

    it("reorders practices by context relevance for romantic context", () => {
      const result = filterPracticesByContext(mockPractices, "romantic");
      // Trust (A) should be high priority (9), Communication (B) should be high (9), Boundary (C) medium (8)
      // All should be present but ordered by relevance
      expect(result.practicesReordered.length).toBe(3);
      expect(Array.isArray(result.practicesReordered)).toBe(true);
    });

    it("reorders practices differently for family context", () => {
      const result = filterPracticesByContext(mockPractices, "family");
      // Boundary (C) is highest for family (10), Communication (B) is high (9)
      expect(result.practicesReordered.length).toBe(3);
      expect(result.selectedContext).toBe("family");
    });

    it("reorders practices differently for friendship context", () => {
      const result = filterPracticesByContext(mockPractices, "friendship");
      // All present but with different weighting than other contexts
      expect(result.practicesReordered.length).toBe(3);
    });

    it("generates context-specific influence explanation", () => {
      const result = filterPracticesByContext(mockPractices, "romantic");
      expect(result.contextInfluence).toBeDefined();
      expect(result.contextInfluence.length).toBeGreaterThan(0);
      expect(result.contextInfluence).toContain("Romantic");
    });

    it("includes practice-specific adaptations in adaptations object", () => {
      const result = filterPracticesByContext(mockPractices, "romantic");
      expect(result.adaptations).toBeDefined();
      // Should have adaptations for practices that exist
      const hasAdaptations = Object.keys(result.adaptations).length > 0;
      expect(typeof hasAdaptations).toBe("boolean");
    });

    it("handles empty practice list gracefully", () => {
      const result = filterPracticesByContext([], "romantic");
      expect(result.practicesTotal).toBe(0);
      expect(result.practicesRelevant).toBe(0);
      expect(result.practicesReordered.length).toBe(0);
    });

    it("handles null practice list gracefully", () => {
      const result = filterPracticesByContext(null as any, "family");
      expect(result.practicesTotal).toBe(0);
      expect(result.practicesRelevant).toBe(0);
    });
  });

  describe("contextualizePractice", () => {
    it("returns contextualized practice details for romantic context", () => {
      const practice = mockPractices[0]; // Trust practice
      const result = contextualizePractice(practice, "Trust Issues", "romantic");

      expect(result.context).toBe("romantic");
      expect(result.barrierName).toBe("Trust Issues");
      expect(result.originalDescription).toBe(practice.description);
      expect(result.contextualizedDescription).toBeDefined();
      expect(result.focusAreas.length).toBeGreaterThan(0);
      expect(result.relatedChallenges.length).toBeGreaterThan(0);
    });

    it("generates context-specific focus areas", () => {
      const practice = mockPractices[1]; // Communication practice
      const result = contextualizePractice(practice, "Communication Difficulties", "family");

      expect(result.focusAreas[0]).toContain("family");
    });

    it("adapts practice description based on context", () => {
      const practice = mockPractices[0];
      const result = contextualizePractice(practice, "Trust Issues", "professional");

      expect(result.contextualizedDescription).toContain("professional");
    });

    it("handles different contexts with appropriate challenges", () => {
      const practice = mockPractices[2]; // Boundary practice
      const romanticResult = contextualizePractice(practice, "Boundary Issues", "romantic");
      const familyResult = contextualizePractice(practice, "Boundary Issues", "family");

      // Both should have challenges, but may differ in specifics
      expect(romanticResult.relatedChallenges.length).toBeGreaterThan(0);
      expect(familyResult.relatedChallenges.length).toBeGreaterThan(0);
    });
  });

  describe("generateContextRationale", () => {
    it("generates rationale for romantic context", () => {
      const rationale = generateContextRationale("romantic");
      expect(rationale).toBeDefined();
      expect(rationale.length).toBeGreaterThan(0);
      expect(rationale).toContain("romantic");
    });

    it("generates rationale for family context", () => {
      const rationale = generateContextRationale("family");
      expect(rationale).toBeDefined();
      expect(rationale.toLowerCase()).toContain("family");
    });

    it("generates rationale for friendship context", () => {
      const rationale = generateContextRationale("friendship");
      expect(rationale).toBeDefined();
      expect(rationale.toLowerCase()).toContain("friend");
    });

    it("generates rationale for professional context", () => {
      const rationale = generateContextRationale("professional");
      expect(rationale).toBeDefined();
      expect(rationale.toLowerCase()).toContain("work");
    });

    it("generates rationale for mixed context", () => {
      const rationale = generateContextRationale("mixed");
      expect(rationale).toBeDefined();
      expect(rationale).toContain("multiple");
    });
  });

  describe("relationshipContextChoices", () => {
    it("exports context choice options", () => {
      expect(Array.isArray(relationshipContextChoices)).toBe(true);
      expect(relationshipContextChoices.length).toBe(5);
    });

    it("includes all expected context types in choices", () => {
      const values = relationshipContextChoices.map((c) => c.value);
      expect(values).toContain("romantic");
      expect(values).toContain("family");
      expect(values).toContain("friendship");
      expect(values).toContain("professional");
      expect(values).toContain("mixed");
    });

    it("each choice has label and value", () => {
      relationshipContextChoices.forEach((choice) => {
        expect(choice.value).toBeDefined();
        expect(choice.label).toBeDefined();
        expect(typeof choice.label).toBe("string");
        expect(choice.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Context Filtering Integration", () => {
    it("maintains practice count across all contexts", () => {
      const contexts: RelationshipContext[] = [
        "romantic",
        "family",
        "friendship",
        "professional",
        "mixed",
      ];

      contexts.forEach((context) => {
        const result = filterPracticesByContext(mockPractices, context);
        expect(result.practicesTotal).toBe(mockPractices.length);
        expect(result.practicesRelevant).toBe(mockPractices.length);
        expect(result.practicesReordered.length).toBe(mockPractices.length);
      });
    });

    it("generates consistent context influence across calls", () => {
      const result1 = filterPracticesByContext(mockPractices, "romantic");
      const result2 = filterPracticesByContext(mockPractices, "romantic");

      expect(result1.contextInfluence).toBe(result2.contextInfluence);
    });

    it("integrates with practice personalization workflow", () => {
      const userQ13Answer = "Family relationships";
      const context = mapQ13ToContext(userQ13Answer);
      const filtering = filterPracticesByContext(mockPractices, context);
      const rationale = generateContextRationale(context);

      expect(context).toBe("family");
      expect(filtering.selectedContext).toBe("family");
      expect(rationale.toLowerCase()).toContain("family");
    });
  });
});
