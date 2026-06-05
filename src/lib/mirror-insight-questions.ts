/**
 * Mirror-Method Insight Questions
 *
 * Six-step journey per category (where applicable): present → pattern → stakes → origins → next chapter.
 * User answers → RAG + reflection → User discovers pattern
 */

import { INSIGHT_CHOICES } from "@/lib/insight-question-choices";

export interface InsightCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  questions: InsightQuestion[];
}

export interface InsightChoice {
  id: string;
  label: string;
}

export interface InsightQuestion {
  id: string;
  order: number;
  question: string;
  placeholder?: string;
  minLength?: number;
  /** Preset sentence options; answer text is the selected `label` (or custom text). */
  choices?: InsightChoice[];
}

export interface InsightAnswerData {
  categoryId: string;
  categoryTitle: string;
  answers: Record<string, string>;
}

const categories: InsightCategory[] = [
  {
    id: "mental-health",
    title: "Mental & Emotional Health",
    icon: "Brain",
    description: "Explore anxiety, mood, stress, and emotional patterns",
    color: "bg-blue-100 border-blue-400",
    questions: [
      {
        id: "q1",
        order: 1,
        question:
          "Lately, how have you been feeling inside? (Quiet or loud, okay or rough—whatever fits.)",
        placeholder: "Anxious, sad, numb, angry, overwhelmed, fine...",
        minLength: 10,
      },
      {
        id: "q2",
        order: 2,
        question: "When you get stressed or upset, what do you usually do?",
        placeholder: "Scroll, work, eat, shut down, talk it out...",
        minLength: 10,
      },
      {
        id: "q3",
        order: 3,
        question: "Right after that, what happens—to the feeling, or to you?",
        placeholder: "Better for a bit, numb, worse later, same loop...",
        minLength: 10,
      },
      {
        id: "q4",
        order: 4,
        question: "What’s the hardest part—or the scary part—of this for you?",
        placeholder: "Judgment, losing control, facing the past, asking for help...",
        minLength: 10,
      },
      {
        id: "q5",
        order: 5,
        question:
          "Where did you learn how to handle feelings? (Who or what showed you?)",
        placeholder: "Family, school, friends, culture, hard times...",
        minLength: 10,
      },
      {
        id: "q6",
        order: 6,
        question: "Looking ahead, what do you most want for your inner life right now?",
        placeholder: "Calm, kindness, honesty, support, small steps...",
        minLength: 10,
      },
    ],
  },
  {
    id: "relationships",
    title: "Relationships & Connection",
    icon: "Users",
    description: "Understand patterns in romantic, friendship, and family",
    color: "bg-pink-100 border-pink-400",
    questions: [
      {
        id: "q1",
        order: 1,
        question:
          "With people you’re close to (friends, family, or partner), what feels true for you right now?",
        placeholder: "What you hide, what works, what you’re working on...",
        minLength: 10,
      },
      {
        id: "q2",
        order: 2,
        question:
          "When someone gets close to something sensitive in you, what do you usually do?",
        placeholder: "Pull away, joke, go quiet, push for closeness...",
        minLength: 10,
      },
      {
        id: "q3",
        order: 3,
        question: "What usually happens between you after that?",
        placeholder: "Closer, farther, same fight, mixed...",
        minLength: 10,
      },
      {
        id: "q4",
        order: 4,
        question:
          "What are you trying to protect—yourself, them, peace, or how you look?",
        placeholder: "Say what fits; more than one is okay.",
        minLength: 10,
      },
      {
        id: "q5",
        order: 5,
        question:
          "Growing up, what did you learn about love, arguing, and getting close to people?",
        placeholder: "Family, friends, culture, early relationships...",
        minLength: 10,
      },
      {
        id: "q6",
        order: 6,
        question: "For your relationships going forward, what matters most to you right now?",
        placeholder: "Safety, honesty, fixing things, patience, fun...",
        minLength: 10,
      },
    ],
  },
  {
    id: "work-purpose",
    title: "Work & Purpose",
    icon: "Briefcase",
    description: "Examine career patterns, productivity blocks, and fulfillment",
    color: "bg-orange-100 border-orange-400",
    questions: [
      {
        id: "q1",
        order: 1,
        question: "How does work—or your bigger goals—feel to you these days?",
        placeholder: "Stuck, okay, tired, excited, mixed...",
        minLength: 10,
      },
      {
        id: "q2",
        order: 2,
        question:
          "When you want to move forward on something, what do you usually do instead?",
        placeholder: "Busywork, delay, overthink, smaller tasks...",
        minLength: 10,
      },
      {
        id: "q3",
        order: 3,
        question: "Under that, what really worries you—or what question won’t leave you alone?",
        placeholder: "Fear of failing, succeeding, money, being seen...",
        minLength: 10,
      },
      {
        id: "q4",
        order: 4,
        question:
          "If you tried your best and it didn’t turn out how you hoped, what would you think that said about you?",
        placeholder: "Your honest thought—no wrong answer.",
        minLength: 10,
      },
      {
        id: "q5",
        order: 5,
        question:
          "Who or what taught you about success, risk, money, and failing?",
        placeholder: "Parents, jobs, school, mentors...",
        minLength: 10,
      },
      {
        id: "q6",
        order: 6,
        question: "For your work life ahead, what matters most to you right now?",
        placeholder: "Money, meaning, rest, courage, stability...",
        minLength: 10,
      },
    ],
  },
  {
    id: "self-identity",
    title: "Self & Identity",
    icon: "User",
    description: "Explore beliefs about yourself, values, and personal growth",
    color: "bg-purple-100 border-purple-400",
    questions: [
      {
        id: "q1",
        order: 1,
        question: "What do you tell yourself about who you are these days?",
        placeholder: "Even if you don’t like the story—your words.",
        minLength: 10,
      },
      {
        id: "q2",
        order: 2,
        question: "How do you prove that story right—or test it—day to day?",
        placeholder: "What you notice, compare, ignore...",
        minLength: 10,
      },
      {
        id: "q3",
        order: 3,
        question: "If that story loosened a little, what might you do—or allow?",
        placeholder: "Rest, speak up, try something new...",
        minLength: 10,
      },
      {
        id: "q4",
        order: 4,
        question:
          "If the old story wasn’t the full truth, what would be hard to give up?",
        placeholder: "Comfort, blame, an excuse, fitting in...",
        minLength: 10,
      },
      {
        id: "q5",
        order: 5,
        question: "Where did that idea of who you are come from?",
        placeholder: "Family, school, friends, partners, media...",
        minLength: 10,
      },
      {
        id: "q6",
        order: 6,
        question: "From here, what matters most to you about yourself right now?",
        placeholder: "Respect, honesty, belonging, trying new things...",
        minLength: 10,
      },
    ],
  },
  {
    id: "habits-lifestyle",
    title: "Habits & Lifestyle",
    icon: "Dumbbell",
    description: "Examine daily routines, energy patterns, and behavioral cycles",
    color: "bg-green-100 border-green-400",
    questions: [
      {
        id: "q1",
        order: 1,
        question:
          "What habit or daily pattern is on your mind—one you want to keep or change?",
        placeholder: "Sleep, food, screens, drinking, saying yes...",
        minLength: 10,
      },
      {
        id: "q2",
        order: 2,
        question: "When you think about changing it, what do you tell yourself?",
        placeholder: "Tomorrow, I deserve it, I can’t, not that bad...",
        minLength: 10,
      },
      {
        id: "q3",
        order: 3,
        question: "How true is that reason, really?",
        placeholder: "Partly true, partly comfortable...",
        minLength: 10,
      },
      {
        id: "q4",
        order: 4,
        question: "What does this habit give you? What might you face without it?",
        placeholder: "Stress relief, numbness, energy crash...",
        minLength: 10,
      },
      {
        id: "q5",
        order: 5,
        question: "What’s one small thing you could try for a few days—even gently?",
        placeholder: "Shorter session, swap, tell one person...",
        minLength: 10,
      },
      {
        id: "q6",
        order: 6,
        question: "For daily life ahead, what matters most to you right now?",
        placeholder: "Sleep, energy, kindness to your body, routine...",
        minLength: 10,
      },
    ],
  },
  {
    id: "money-finance",
    title: "Money & Finance",
    icon: "DollarSign",
    description: "Beliefs, patterns, and emotions around money",
    color: "bg-yellow-100 border-yellow-400",
    questions: [
      {
        id: "q1",
        order: 1,
        question:
          "Deep down, how do you feel about money—even stuff you might not say out loud?",
        placeholder: "Enough, scared, ashamed, calm, confused...",
        minLength: 10,
      },
      {
        id: "q2",
        order: 2,
        question:
          "When you're stressed or emotional, how does money show up for you?",
        placeholder: "Spend, save, avoid looking, work more, compare...",
        minLength: 10,
      },
      {
        id: "q3",
        order: 3,
        question:
          "What’s hardest about money for you right now—or what question won’t leave you alone?",
        placeholder: "Debt, income, shame, family, future...",
        minLength: 10,
      },
      {
        id: "q4",
        order: 4,
        question:
          "If money weren’t a worry, what would you do—or who would you let yourself be?",
        placeholder: "Rest, help family, quit, save, breathe...",
        minLength: 10,
      },
      {
        id: "q5",
        order: 5,
        question: "Where did your early beliefs about money come from?",
        placeholder: "Parents, culture, a crisis, friends, ads...",
        minLength: 10,
      },
      {
        id: "q6",
        order: 6,
        question: "For your money life ahead, what matters most to you right now?",
        placeholder: "Safety, clarity, peace, growth, giving...",
        minLength: 10,
      },
    ],
  },
];

/**
 * Get all categories
 */
export const getInsightCategories = (): InsightCategory[] => {
  return categories;
};

/**
 * Get specific category by ID
 */
export const getInsightCategory = (categoryId: string): InsightCategory | null => {
  return categories.find((cat) => cat.id === categoryId) || null;
};

/**
 * Get questions for a category (includes sentence choices when defined).
 */
export const getCategoryQuestions = (categoryId: string): InsightQuestion[] => {
  const category = getInsightCategory(categoryId);
  if (!category) return [];

  const byCat = INSIGHT_CHOICES[categoryId];
  return category.questions.map((q) => ({
    ...q,
    choices: byCat?.[q.id] ?? q.choices,
  }));
};
