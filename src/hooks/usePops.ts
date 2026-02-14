/**
 * usePops Hook
 * Provides easy access to POP system functionality
 */

import { useState, useCallback, useEffect } from "react";
import { POP, POPCategory } from "@/types/pop";
import {
  getRandomPOPByCategory,
  getRandomPOP,
  getPOPsByCategory,
  getRandomPOPsFromCategories,
  getPOPById,
  getAllPOPCategories,
  getPOPCount,
  getPOPCountByCategory,
  subscribeToRandomPOP,
} from "@/firebase/pops";

interface UsePopsState {
  currentPOP: POP | null;
  loading: boolean;
  error: string | null;
  categories: POPCategory[];
}

export const usePops = () => {
  const [state, setState] = useState<UsePopsState>({
    currentPOP: null,
    loading: false,
    error: null,
    categories: [],
  });

  // Load available categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllPOPCategories();
        setState(prev => ({ ...prev, categories: cats }));
      } catch (error) {
        console.error("Error loading POP categories:", error);
      }
    };

    loadCategories();
  }, []);

  /**
   * Get a random POP from any category
   */
  const getRandomPOP_ = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pop = await getRandomPOP();
      if (pop) {
        setState(prev => ({ ...prev, currentPOP: pop, loading: false }));
      } else {
        setState(prev => ({
          ...prev,
          error: "No POPs available",
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, []);

  /**
   * Get a random POP from a specific category
   */
  const getRandomFromCategory = useCallback(async (category: POPCategory) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pop = await getRandomPOPByCategory(category);
      if (pop) {
        setState(prev => ({ ...prev, currentPOP: pop, loading: false }));
      } else {
        setState(prev => ({
          ...prev,
          error: `No POPs available in ${category} category`,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, []);

  /**
   * Get multiple random POPs from specified categories
   */
  const getRandomFromCategories = useCallback(
    async (categories: POPCategory[], count: number = 1): Promise<POP[]> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const pops = await getRandomPOPsFromCategories(categories, count);
        setState(prev => ({ ...prev, loading: false }));
        return pops;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          loading: false,
        }));
        return [];
      }
    },
    []
  );

  /**
   * Get all POPs in a category
   */
  const getAllByCategory = useCallback(async (category: POPCategory): Promise<POP[]> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pops = await getPOPsByCategory(category);
      setState(prev => ({ ...prev, loading: false }));
      return pops;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
      return [];
    }
  }, []);

  /**
   * Get a specific POP by ID
   */
  const getByID = useCallback(async (popId: string): Promise<POP | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pop = await getPOPById(popId);
      setState(prev => ({ ...prev, loading: false }));
      return pop;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
      return null;
    }
  }, []);

  /**
   * Subscribe to real-time POP updates (for a category)
   */
  const subscribeToCategory = useCallback((category: POPCategory) => {
    const unsubscribe = subscribeToRandomPOP(
      category,
      (pop) => {
        setState(prev => ({ ...prev, currentPOP: pop }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
        }));
      }
    );
    return unsubscribe;
  }, []);

  /**
   * Get stats about POPs
   */
  const getStats = useCallback(async () => {
    try {
      const totalCount = await getPOPCount();
      const categoryStats: Record<POPCategory, number> = {} as Record<POPCategory, number>;

      for (const category of state.categories) {
        categoryStats[category] = await getPOPCountByCategory(category);
      }

      return { totalCount, categoryStats };
    } catch (error) {
      console.error("Error getting POP stats:", error);
      return { totalCount: 0, categoryStats: {} };
    }
  }, [state.categories]);

  return {
    // State
    currentPOP: state.currentPOP,
    loading: state.loading,
    error: state.error,
    categories: state.categories,

    // Methods
    getRandomPOP: getRandomPOP_,
    getRandomFromCategory,
    getRandomFromCategories,
    getAllByCategory,
    getByID,
    subscribeToCategory,
    getStats,
  };
};
