import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  getInsightCategories as getLocalInsightCategories,
  getCategoryQuestions as getLocalCategoryQuestions,
  type InsightCategory,
  type InsightChoice,
  type InsightQuestion,
} from "@/lib/mirror-insight-questions";
import { wisdomKnowledgeBase, type WisdomPrinciple } from "@/lib/wisdom-knowledge-base";

const KB_CATEGORY = "insights KB";
const CACHE_TTL_MS = 5 * 60 * 1000;

type InsightKbCache = {
  loadedAt: number;
  principles: WisdomPrinciple[];
  questionsByCategory: Record<string, InsightQuestion[]>;
  categoryIds: Set<string>;
};

let cache: InsightKbCache | null = null;
let inflight: Promise<InsightKbCache> | null = null;

const buildLocalFallback = (): InsightKbCache => {
  const categories = getLocalInsightCategories();
  const questionsByCategory: Record<string, InsightQuestion[]> = {};
  categories.forEach((category) => {
    questionsByCategory[category.id] = getLocalCategoryQuestions(category.id);
  });
  return {
    loadedAt: Date.now(),
    principles: wisdomKnowledgeBase,
    questionsByCategory,
    categoryIds: new Set(categories.map((c) => c.id)),
  };
};

const toChoice = (raw: unknown): InsightChoice | null => {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.choiceId !== "string" || typeof value.label !== "string") return null;
  return { id: value.choiceId, label: value.label };
};

const toQuestion = (raw: unknown): Omit<InsightQuestion, "choices"> | null => {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (
    typeof value.questionId !== "string" ||
    typeof value.question !== "string" ||
    typeof value.order !== "number"
  ) {
    return null;
  }
  return {
    id: value.questionId,
    question: value.question,
    order: value.order,
    placeholder: typeof value.placeholder === "string" ? value.placeholder : undefined,
    minLength: typeof value.minLength === "number" ? value.minLength : undefined,
  };
};

const loadFromFirebase = async (): Promise<InsightKbCache> => {
  const [principlesSnap, questionsSnap, choicesSnap] = await Promise.all([
    getDocs(query(collection(db, "insight_kb_principles"), where("kbCategory", "==", KB_CATEGORY))),
    getDocs(query(collection(db, "insight_kb_questions"), where("kbCategory", "==", KB_CATEGORY))),
    getDocs(query(collection(db, "insight_kb_choices"), where("kbCategory", "==", KB_CATEGORY))),
  ]);

  if (principlesSnap.empty || questionsSnap.empty) {
    return buildLocalFallback();
  }

  const principles = principlesSnap.docs
    .map((d) => d.data() as WisdomPrinciple)
    .filter((p) => typeof p?.id === "string" && typeof p?.category === "string");

  const choicesByKey = new Map<string, InsightChoice[]>();
  choicesSnap.docs.forEach((docSnap) => {
    const choice = toChoice(docSnap.data());
    const data = docSnap.data() as Record<string, unknown>;
    if (!choice || typeof data.categoryId !== "string" || typeof data.questionId !== "string") return;
    const key = `${data.categoryId}::${data.questionId}`;
    const list = choicesByKey.get(key) ?? [];
    list.push(choice);
    choicesByKey.set(key, list);
  });

  const questionsByCategory: Record<string, InsightQuestion[]> = {};
  const categoryIds = new Set<string>();

  questionsSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const questionBase = toQuestion(data);
    const categoryId = (data as Record<string, unknown>).categoryId;
    if (!questionBase || typeof categoryId !== "string") return;
    categoryIds.add(categoryId);
    const key = `${categoryId}::${questionBase.id}`;
    const question: InsightQuestion = {
      ...questionBase,
      choices: choicesByKey.get(key),
    };
    if (!questionsByCategory[categoryId]) questionsByCategory[categoryId] = [];
    questionsByCategory[categoryId].push(question);
  });

  Object.keys(questionsByCategory).forEach((categoryId) => {
    questionsByCategory[categoryId].sort((a, b) => a.order - b.order);
  });

  return {
    loadedAt: Date.now(),
    principles: principles.length > 0 ? principles : wisdomKnowledgeBase,
    questionsByCategory,
    categoryIds,
  };
};

const getCache = async (): Promise<InsightKbCache> => {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache;
  }

  if (!inflight) {
    inflight = loadFromFirebase()
      .catch(() => buildLocalFallback())
      .finally(() => {
        inflight = null;
      });
  }

  cache = await inflight;
  return cache;
};

export const getInsightCategoriesLive = async (): Promise<InsightCategory[]> => {
  const local = getLocalInsightCategories();
  const live = await getCache();
  if (live.categoryIds.size === 0) return local;
  return local.filter((c) => live.categoryIds.has(c.id));
};

export const getCategoryQuestionsLive = async (categoryId: string): Promise<InsightQuestion[]> => {
  const live = await getCache();
  return live.questionsByCategory[categoryId] ?? getLocalCategoryQuestions(categoryId);
};

export const getWisdomPrinciplesLive = async (): Promise<WisdomPrinciple[]> => {
  const live = await getCache();
  return live.principles.length > 0 ? live.principles : wisdomKnowledgeBase;
};
