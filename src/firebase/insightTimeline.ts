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
import { PatternAnalysis } from "./diagnostics";

export interface TimelineEntry {
  categoryId: number;
  categoryTitle: string;
  sentiment: "positive" | "neutral" | "negative";
  intensity: "low" | "medium" | "high";
  diagnosticRef: string; // Path to the full diagnostic
  displayLabel: string; // e.g., "Jan 15, 2026"
  displayStage: string; // e.g., "Starting", "Building", "Flourishing"
  completedAt: Timestamp;
}

/**
 * Calculate display stage based on sentiment and intensity
 */
export const calculateDisplayStage = (patterns: PatternAnalysis): string => {
  const { sentiment, intensity } = patterns;

  if (sentiment === "positive" && intensity === "high") {
    return "Flourishing";
  }
  if (sentiment === "positive" && intensity === "medium") {
    return "Growing";
  }
  if (sentiment === "positive" && intensity === "low") {
    return "Stable";
  }
  if (sentiment === "neutral" && intensity === "high") {
    return "Building Momentum";
  }
  if (sentiment === "neutral" && intensity === "medium") {
    return "Reflecting";
  }
  if (sentiment === "neutral" && intensity === "low") {
    return "Considering";
  }
  if (sentiment === "negative" && intensity === "high") {
    return "Struggling";
  }
  if (sentiment === "negative" && intensity === "medium") {
    return "Challenged";
  }
  return "Starting Point";
};

/**
 * Add entry to insight timeline
 */
export const addToTimeline = async (
  userId: string,
  categoryId: number,
  categoryTitle: string,
  patterns: PatternAnalysis,
  diagnosticDocId: string
): Promise<string> => {
  try {
    const displayStage = calculateDisplayStage(patterns);
    const now = new Date();
    const displayLabel = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const docRef = await addDoc(
      collection(db, `users/${userId}/insightTimeline`),
      {
        categoryId,
        categoryTitle,
        sentiment: patterns.sentiment,
        intensity: patterns.intensity,
        diagnosticRef: `/users/${userId}/diagnostics/${diagnosticDocId}`,
        displayLabel,
        displayStage,
        completedAt: Timestamp.now(),
      } as TimelineEntry
    );

    return docRef.id;
  } catch (error) {
    console.error("Error adding to timeline:", error);
    throw error;
  }
};

/**
 * Get timeline entries for a category (sorted by date)
 */
export const getCategoryTimeline = async (
  userId: string,
  categoryId: number
): Promise<(DocumentData & { id: string })[]> => {
  try {
    const q = query(
      collection(db, `users/${userId}/insightTimeline`),
      where("categoryId", "==", categoryId),
      orderBy("completedAt", "asc") // Oldest first for timeline
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching category timeline:", error);
    throw error;
  }
};

/**
 * Get full timeline (all categories, sorted by date)
 */
export const getFullTimeline = async (
  userId: string
): Promise<(DocumentData & { id: string })[]> => {
  try {
    const q = query(
      collection(db, `users/${userId}/insightTimeline`),
      orderBy("completedAt", "desc") // Most recent first
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching full timeline:", error);
    throw error;
  }
};

/**
 * Get timeline grouped by category (for dashboard view)
 */
export const getTimelineByCategory = async (userId: string) => {
  try {
    const timeline = await getFullTimeline(userId);

    const grouped: {
      [key: number]: { title: string; entries: any[] };
    } = {};

    timeline.forEach((entry) => {
      if (!grouped[entry.categoryId]) {
        grouped[entry.categoryId] = {
          title: entry.categoryTitle,
          entries: [],
        };
      }
      grouped[entry.categoryId].entries.push(entry);
    });

    return grouped;
  } catch (error) {
    console.error("Error grouping timeline by category:", error);
    throw error;
  }
};

/**
 * Get progress stats (total diagnostics, categories completed, streak info)
 */
export const getProgressStats = async (userId: string) => {
  try {
    const timeline = await getFullTimeline(userId);

    const stats = {
      totalDiagnostics: timeline.length,
      categoriesCompleted: new Set(timeline.map((e) => e.categoryId)).size,
      lastCompletedDate: timeline[0]?.completedAt,
      sentimentBreakdown: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      intensityBreakdown: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    timeline.forEach((entry) => {
      stats.sentimentBreakdown[entry.sentiment]++;
      stats.intensityBreakdown[entry.intensity]++;
    });

    return stats;
  } catch (error) {
    console.error("Error calculating progress stats:", error);
    throw error;
  }
};
