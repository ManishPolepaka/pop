import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

export interface InsightRelationship {
  categoryA_id: number;
  categoryA_title: string;
  categoryB_id: number;
  categoryB_title: string;
  description: string;
  correlationStrength: number; // 0.0 to 1.0
  firstObservedAt: Timestamp;
  lastConfirmedAt: Timestamp;
  occurrences: number;
}

/**
 * Detect relationships between two diagnostics based on patterns
 */
export const detectRelationship = (
  diagA: any,
  diagB: any
): { strength: number; description: string } | null => {
  // Check if both have patterns
  if (!diagA.patterns || !diagB.patterns) return null;

  let strength = 0.0;
  const descriptions: string[] = [];

  // Sentiment alignment (strong indicator)
  if (diagA.patterns.sentiment === diagB.patterns.sentiment) {
    strength += 0.4;
    descriptions.push(
      `Both show ${diagA.patterns.sentiment} sentiment patterns`
    );
  } else {
    strength += 0.1; // Slight correlation even if different
  }

  // Intensity alignment
  if (diagA.patterns.intensity === diagB.patterns.intensity) {
    strength += 0.3;
    descriptions.push(
      `Similar intensity level (${diagA.patterns.intensity})`
    );
  } else {
    strength += 0.1;
  }

  // Keyword overlap (theme correlation)
  const keywordA = new Set(diagA.patterns.keywords.map((k: string) => k.toLowerCase()));
  const keywordB = new Set(diagB.patterns.keywords.map((k: string) => k.toLowerCase()));
  const intersection = [...keywordA].filter((k) => keywordB.has(k));

  if (intersection.length > 0) {
    strength += 0.3;
    descriptions.push(`Shared themes: ${intersection.join(", ")}`);
  }

  if (strength <= 0.3) return null; // Not a meaningful relationship

  return {
    strength: Math.min(strength, 1.0),
    description: descriptions.join(". "),
  };
};

/**
 * Save or update a relationship between two categories
 */
export const saveInsightRelationship = async (
  userId: string,
  categoryA_id: number,
  categoryA_title: string,
  categoryB_id: number,
  categoryB_title: string,
  description: string,
  correlationStrength: number
): Promise<string> => {
  try {
    // Check if relationship already exists
    const existing = await findExistingRelationship(
      userId,
      categoryA_id,
      categoryB_id
    );

    if (existing) {
      // Update existing relationship
      const docRef = doc(
        db,
        `users/${userId}/insightRelationships`,
        existing.id
      );
      await updateDoc(docRef, {
        description,
        correlationStrength: Math.max(
          existing.data.correlationStrength,
          correlationStrength
        ),
        lastConfirmedAt: Timestamp.now(),
        occurrences: existing.data.occurrences + 1,
      });
      return existing.id;
    }

    // Create new relationship
    const docRef = await addDoc(
      collection(db, `users/${userId}/insightRelationships`),
      {
        categoryA_id,
        categoryA_title,
        categoryB_id,
        categoryB_title,
        description,
        correlationStrength,
        firstObservedAt: Timestamp.now(),
        lastConfirmedAt: Timestamp.now(),
        occurrences: 1,
      } as InsightRelationship
    );

    return docRef.id;
  } catch (error) {
    console.error("Error saving relationship:", error);
    throw error;
  }
};

/**
 * Find existing relationship between two categories
 */
const findExistingRelationship = async (
  userId: string,
  categoryA_id: number,
  categoryB_id: number
) => {
  try {
    // Query both directions (A->B or B->A)
    const q = query(
      collection(db, `users/${userId}/insightRelationships`),
      where("categoryA_id", "in", [categoryA_id, categoryB_id]),
      where("categoryB_id", "in", [categoryA_id, categoryB_id])
    );

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (
        (data.categoryA_id === categoryA_id &&
          data.categoryB_id === categoryB_id) ||
        (data.categoryA_id === categoryB_id && data.categoryB_id === categoryA_id)
      ) {
        return { id: doc.id, data };
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding existing relationship:", error);
    return null;
  }
};

/**
 * Get all relationships for a user
 */
export const getUserRelationships = async (
  userId: string
): Promise<(DocumentData & { id: string })[]> => {
  try {
    const q = query(
      collection(db, `users/${userId}/insightRelationships`),
      orderBy("correlationStrength", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching relationships:", error);
    throw error;
  }
};

/**
 * Get relationships for a specific category
 */
export const getCategoryRelationships = async (
  userId: string,
  categoryId: number
): Promise<(DocumentData & { id: string })[]> => {
  try {
    const relationships = await getUserRelationships(userId);
    return relationships.filter(
      (rel) => rel.categoryA_id === categoryId || rel.categoryB_id === categoryId
    );
  } catch (error) {
    console.error("Error fetching category relationships:", error);
    throw error;
  }
};

/**
 * Analyze all diagnostics for category relationships
 */
export const analyzeInsightRelationships = async (
  userId: string,
  allDiagnostics: any[]
) => {
  try {
    const analyzed: Set<string> = new Set();
    const relationships = [];

    // Compare every pair of diagnostics
    for (let i = 0; i < allDiagnostics.length; i++) {
      for (let j = i + 1; j < allDiagnostics.length; j++) {
        const diagA = allDiagnostics[i];
        const diagB = allDiagnostics[j];

        // Only compare if from different categories
        if (diagA.categoryId === diagB.categoryId) continue;

        const pairKey = [diagA.categoryId, diagB.categoryId].sort().join("_");

        // Skip if we already analyzed this pair
        if (analyzed.has(pairKey)) continue;
        analyzed.add(pairKey);

        const relationship = detectRelationship(diagA, diagB);
        if (relationship) {
          relationships.push({
            categoryA_id: diagA.categoryId,
            categoryA_title: diagA.categoryTitle,
            categoryB_id: diagB.categoryId,
            categoryB_title: diagB.categoryTitle,
            ...relationship,
          });
        }
      }
    }

    // Save all detected relationships
    for (const rel of relationships) {
      await saveInsightRelationship(
        userId,
        rel.categoryA_id,
        rel.categoryA_title,
        rel.categoryB_id,
        rel.categoryB_title,
        rel.description,
        rel.strength
      );
    }

    return relationships;
  } catch (error) {
    console.error("Error analyzing relationships:", error);
    throw error;
  }
};

/**
 * Get relationship strength between two specific categories
 */
export const getRelationshipStrength = async (
  userId: string,
  categoryA_id: number,
  categoryB_id: number
): Promise<number> => {
  try {
    const rel = await findExistingRelationship(userId, categoryA_id, categoryB_id);
    return rel?.data.correlationStrength || 0;
  } catch (error) {
    console.error("Error getting relationship strength:", error);
    throw error;
  }
};
