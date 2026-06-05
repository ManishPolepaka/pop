/**
 * POP System Types
 * Defines the structure of POP messages and categories
 */

export type POPCategory = 
  | "Scroll Interruption"
  | "Emotional Avoidance"
  | "Intention Reset"
  | "Tiny Action Redirect"
  | "Identity Mirror"
  | "Stay Productive";

export interface POP {
  id: string;
  content: string;
  category: POPCategory;
  subcategory?: string;
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
  "Scroll Interruption": "📵 Scroll Interruption",
  "Emotional Avoidance": "🫥 Emotional Avoidance",
  "Intention Reset": "🎯 Intention Reset",
  "Tiny Action Redirect": "⚡ Tiny Action Redirect",
  "Identity Mirror": "🪞 Identity Mirror",
  "Stay Productive": "🚀 Stay Productive",
};
