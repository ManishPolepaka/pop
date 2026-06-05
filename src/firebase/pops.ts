/**
 * POP Firebase Service
 * Handles all POP-related database operations
 */

import { db } from "@/firebase/config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  onSnapshot,
  Query,
  QueryConstraint
} from "firebase/firestore";
import { POP, POPCategory } from "@/types/pop";
export type PopIntentType = "break-distraction" | "stay-productive";

const RECENT_POP_IDS_KEY = "selfPopRecentIds";
const RECENT_POP_CATEGORY_KEY = "selfPopRecentCategory";
const RECENT_POP_MAX = 8;
const RECENT_POP_EXCLUDE_COUNT = 3;
const BREAK_DISTRACTION_CATEGORIES: POPCategory[] = [
  "Scroll Interruption",
  "Emotional Avoidance",
  "Intention Reset",
  "Tiny Action Redirect",
  "Identity Mirror",
];

const readRecentPopIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_POP_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
};

const writeRecentPopSelection = (id: string, category?: string) => {
  if (typeof window === "undefined") return;
  const existing = readRecentPopIds().filter((item) => item !== id);
  const next = [id, ...existing].slice(0, RECENT_POP_MAX);
  window.localStorage.setItem(RECENT_POP_IDS_KEY, JSON.stringify(next));
  if (category) {
    window.localStorage.setItem(RECENT_POP_CATEGORY_KEY, category);
  }
};

const pickWithAntiRepetition = (
  docs: Array<{ id: string; data: () => Record<string, unknown> }>
) => {
  if (docs.length === 0) return null;

  const recent = readRecentPopIds();
  const excluded = new Set(recent.slice(0, RECENT_POP_EXCLUDE_COUNT));
  const lastCategory =
    typeof window !== "undefined"
      ? window.localStorage.getItem(RECENT_POP_CATEGORY_KEY)
      : null;

  const withoutRecent = docs.filter((doc) => !excluded.has(doc.id));
  const withoutRecentAndCategory =
    lastCategory && withoutRecent.length > 1
      ? withoutRecent.filter((doc) => (doc.data().category as string | undefined) !== lastCategory)
      : withoutRecent;

  const pool =
    withoutRecentAndCategory.length > 0
      ? withoutRecentAndCategory
      : withoutRecent.length > 0
        ? withoutRecent
        : docs;

  return pool[Math.floor(Math.random() * pool.length)] ?? null;
};

/**
 * Get a random POP from the entire library
 */
export const getRandomPOP = async (): Promise<POP | null> => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(popsRef, where("isActive", "==", true));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn("No active POPs found in database");
      return null;
    }

    const randomPOP = pickWithAntiRepetition(snapshot.docs);
    if (!randomPOP) {
      return null;
    }
    const data = randomPOP.data();
    writeRecentPopSelection(randomPOP.id, data.category as string | undefined);
    
    return {
      id: randomPOP.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as POP;
  } catch (error) {
    console.error("Error getting random POP:", error);
    return null;
  }
};

/**
 * Get a random POP from a specific category
 */
export const getRandomPOPByCategory = async (category: POPCategory): Promise<POP | null> => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(
      popsRef, 
      where("isActive", "==", true),
      where("category", "==", category)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn(`No active POPs found in category: ${category}`);
      return null;
    }

    const randomPOP = pickWithAntiRepetition(snapshot.docs);
    if (!randomPOP) {
      return null;
    }
    const data = randomPOP.data();
    writeRecentPopSelection(randomPOP.id, data.category as string | undefined);
    
    return {
      id: randomPOP.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as POP;
  } catch (error) {
    console.error(`Error getting random POP by category ${category}:`, error);
    return null;
  }
};

/**
 * Get a random POP by reminder intent
 */
export const getRandomPOPByIntent = async (
  intentType: PopIntentType
): Promise<POP | null> => {
  try {
    const popsRef = collection(db, "pops");
    const categories: POPCategory[] =
      intentType === "stay-productive" ? ["Stay Productive"] : BREAK_DISTRACTION_CATEGORIES;

    const q = query(
      popsRef,
      where("isActive", "==", true),
      where("category", "in", categories)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getRandomPOP();
    }

    const randomPOP = pickWithAntiRepetition(snapshot.docs);
    if (!randomPOP) {
      return getRandomPOP();
    }

    const data = randomPOP.data();
    writeRecentPopSelection(randomPOP.id, data.category as string | undefined);

    return {
      id: randomPOP.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as POP;
  } catch (error) {
    console.error(`Error getting random POP by intent ${intentType}:`, error);
    return getRandomPOP();
  }
};

/**
 * Get all POPs in a specific category
 */
export const getPOPsByCategory = async (category: POPCategory): Promise<POP[]> => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(
      popsRef, 
      where("isActive", "==", true),
      where("category", "==", category)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as POP[];
  } catch (error) {
    console.error(`Error getting POPs by category ${category}:`, error);
    return [];
  }
};

/**
 * Get a specific POP by ID
 */
export const getPOPById = async (popId: string): Promise<POP | null> => {
  try {
    const popRef = doc(db, "pops", popId);
    const popSnapshot = await getDoc(popRef);
    
    if (!popSnapshot.exists()) {
      console.warn(`POP not found: ${popId}`);
      return null;
    }

    return {
      id: popSnapshot.id,
      ...popSnapshot.data(),
      createdAt: popSnapshot.data().createdAt?.toDate() || new Date(),
      updatedAt: popSnapshot.data().updatedAt?.toDate() || new Date(),
    } as POP;
  } catch (error) {
    console.error(`Error getting POP ${popId}:`, error);
    return null;
  }
};

/**
 * Get random POPs from multiple categories (for variety)
 */
export const getRandomPOPsFromCategories = async (
  categories: POPCategory[],
  count: number = 1
): Promise<POP[]> => {
  const pops: POP[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const pop = await getRandomPOPByCategory(randomCategory);
    
    if (pop && !pops.some(p => p.id === pop.id)) {
      pops.push(pop);
    }
  }
  
  return pops;
};

/**
 * Get all available categories
 */
export const getAllPOPCategories = async (): Promise<POPCategory[]> => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(popsRef, where("isActive", "==", true));
    
    const snapshot = await getDocs(q);
    const categories = new Set<POPCategory>();
    
    snapshot.docs.forEach(doc => {
      const category = doc.data().category as POPCategory;
      if (category) {
        categories.add(category);
      }
    });
    
    return Array.from(categories);
  } catch (error) {
    console.error("Error getting POP categories:", error);
    return [];
  }
};

/**
 * Subscribe to random POP from category (real-time)
 */
export const subscribeToRandomPOP = (
  category: POPCategory,
  onPOP: (pop: POP) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(
      popsRef,
      where("isActive", "==", true),
      where("category", "==", category)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const randomDoc = snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)];
          const pop = {
            id: randomDoc.id,
            ...randomDoc.data(),
            createdAt: randomDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: randomDoc.data().updatedAt?.toDate() || new Date(),
          } as POP;
          onPOP(pop);
        }
      },
      (error) => {
        console.error("Error subscribing to POP:", error);
        if (onError) onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up POP subscription:", error);
    return () => {};
  }
};

/**
 * Get total count of POPs
 */
export const getPOPCount = async (): Promise<number> => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(popsRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting POP count:", error);
    return 0;
  }
};

/**
 * Get count by category
 */
export const getPOPCountByCategory = async (category: POPCategory): Promise<number> => {
  try {
    const popsRef = collection(db, "pops");
    const q = query(
      popsRef,
      where("isActive", "==", true),
      where("category", "==", category)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error(`Error getting POP count for category ${category}:`, error);
    return 0;
  }
};
