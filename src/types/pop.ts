/**
 * POP System Types
 * Defines the structure of POP messages and categories
 */

export type POPCategory = 
  | "motivation" 
  | "funny" 
  | "wellness" 
  | "thought" 
  | "fact" 
  | "gratitude";

export interface POP {
  id: string;
  content: string;
  category: POPCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;  // 1 = easy/light, 5 = complex/deep
  tags: string[];
  authorId?: string;  // For user-generated POPs later
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPOPPreferences {
  userId: string;
  preferredCategories: POPCategory[];
  maxPOPsPerDay: number;
  preferredTimes: number[];  // Hours (0-23) when user wants POPs
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  behaviorLearningEnabled: boolean;
  createdAt: Date;
}

export interface POPDeliveryHistory {
  id: string;
  userId: string;
  popId: string;
  deliveredAt: Date;
  openedAt?: Date;
  readDuration: number;  // in seconds
  userAction?: "favorite" | "ignore" | "reply" | "share" | "none";
  timeOfDay: number;  // 0-23
  dayOfWeek: number;  // 0-6
}

export const POP_CATEGORIES: Record<POPCategory, string> = {
  motivation: "🚀 Motivation",
  funny: "😄 Funny",
  wellness: "🧘 Wellness",
  thought: "💭 Thought-provoking",
  fact: "🧠 Interesting Facts",
  gratitude: "🙏 Gratitude",
};
