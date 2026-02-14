import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

export interface PatternAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  intensity: "low" | "medium" | "high";
  keywords: string[];
  themes: string[];
}

export interface AIInsight {
  heard: string;
  commonSenseReframe: string;
  blindSpot: string;
  pattern: string;
  meaning: string;
  help: string;
}

export interface Breakthrough {
  quote: string;
  timestamp: string;
}

export interface DiagnosticAnswer {
  categoryId: number;
  categoryTitle: string;
  answers: string[];
  patterns?: PatternAnalysis;
  aiInsight?: AIInsight;
  breakthroughs?: Breakthrough[];
  completedAt: Timestamp;
  insights?: string;
}

/**
 * Save diagnostic with full insights (patterns + AI analysis)
 */
export const saveDiagnosticWithInsights = async (
  userId: string,
  categoryId: number,
  categoryTitle: string,
  answers: string[],
  patterns: PatternAnalysis,
  aiInsight: AIInsight
): Promise<string> => {
  try {
    const docRef = await addDoc(
      collection(db, `users/${userId}/diagnostics`),
      {
        categoryId,
        categoryTitle,
        answers,
        patterns,
        aiInsight,
        breakthroughs: [],
        completedAt: Timestamp.now(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnostic with insights:", error);
    throw error;
  }
};

/**
 * Save diagnostic answers to Firestore (legacy)
 */
export const saveDiagnosticAnswers = async (
  userId: string,
  categoryId: number,
  categoryTitle: string,
  answers: string[]
) => {
  try {
    const docRef = await addDoc(
      collection(db, `users/${userId}/diagnostics`),
      {
        categoryId,
        categoryTitle,
        answers,
        completedAt: Timestamp.now(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnostic answers:", error);
    throw error;
  }
};

/**
 * Get all diagnostics for a category (latest first)
 */
export const getCategoryDiagnostics = async (
  userId: string,
  categoryId: number
): Promise<(DocumentData & { id: string })[]> => {
  try {
    const q = query(
      collection(db, `users/${userId}/diagnostics`),
      where("categoryId", "==", categoryId),
      orderBy("completedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching category diagnostics:", error);
    throw error;
  }
};

/**
 * Get latest diagnostic for a category
 */
export const getLatestDiagnostic = async (
  userId: string,
  categoryId: number
) => {
  try {
    const q = query(
      collection(db, `users/${userId}/diagnostics`),
      where("categoryId", "==", categoryId),
      orderBy("completedAt", "desc")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error fetching diagnostic:", error);
    throw error;
  }
};

/**
 * Get all diagnostics for user (all categories)
 */
export const getAllDiagnostics = async (userId: string) => {
  try {
    const q = query(
      collection(db, `users/${userId}/diagnostics`),
      orderBy("completedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching all diagnostics:", error);
    throw error;
  }
};

/**
 * Get diagnostics summary (for growth tracking and comparison)
 */
export const getDiagnosticsSummary = async (userId: string) => {
  try {
    const allDiagnostics = await getAllDiagnostics(userId);

    // Group by category
    const byCategory: {
      [key: number]: { count: number; latest: any; all: any[] };
    } = {};

    allDiagnostics.forEach((diag: any) => {
      const categoryId = diag.categoryId || 0;
      if (!byCategory[categoryId]) {
        byCategory[categoryId] = {
          count: 0,
          latest: null,
          all: [],
        };
      }
      byCategory[categoryId].count++;
      if (!byCategory[categoryId].latest) {
        byCategory[categoryId].latest = diag;
      }
      byCategory[categoryId].all.push(diag);
    });

    return byCategory;
  } catch (error) {
    console.error("Error fetching diagnostics summary:", error);
    throw error;
  }
};
