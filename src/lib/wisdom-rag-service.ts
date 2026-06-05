/**
 * RAG (Retrieval-Augmented Generation) Service
 * 
 * Matches user answers to wisdom principles from the knowledge base
 * WITHOUT using LLM - just smart keyword matching and scoring
 * 
 * Purpose: Find the most relevant principles BEFORE sending to LLM for presentation
 */

import { wisdomKnowledgeBase, WisdomPrinciple } from "./wisdom-knowledge-base";
import { INSIGHT_CHOICES } from "./insight-question-choices";
import { getWisdomPrinciplesLive } from "@/firebase/insights-kb";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match a domain/catalog keyword against user text without substring false positives
 * (e.g. "late" matching inside "later", or short tokens inside unrelated words).
 * Phrases and long tokens use substring; shorter single words use word boundaries.
 */
export function matchLexemeInText(haystackLower: string, keyword: string): boolean {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;
  if (kw.includes(" ") || kw.length >= 10) {
    return haystackLower.includes(kw);
  }
  try {
    return new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i").test(haystackLower);
  } catch {
    return haystackLower.includes(kw);
  }
}

/**
 * Extract keywords from text (remove common words, get meaningful terms)
 */
export const extractKeywords = (text: string): string[] => {
  const commonWords = new Set([
    "i",
    "me",
    "my",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "get",
    "got",
    "make",
    "made",
    "think",
    "thought",
    "feel",
    "felt",
    "know",
    "knew",
    "see",
    "saw",
    "when",
    "where",
    "what",
    "which",
    "who",
    "why",
    "how",
    "it",
    "its",
    "this",
    "that",
    "these",
    "those",
    "just",
    "only",
    "very",
    "too",
    "so",
    "as",
    "if",
    "then",
    "in",
    "on",
    "at",
    "to",
    "from",
    "for",
    "with",
    "by",
    "about",
    "of",
  ]);

  // Split text into words, lowercase, remove punctuation
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !commonWords.has(word));

  // Remove duplicates
  return [...new Set(words)];
};

/**
 * Semantic Domain Mapping
 * Groups related concepts together for meaning-based matching
 * 
 * Instead of matching "guilt" keyword to "worthiness" principle:
 * - Extract semantic domain: guilt → SHAME_GUILT domain
 * - Check if principle covers SHAME_GUILT domain
 * - Score based on domain match (higher confidence)
 */

export interface SemanticDomain {
  domain: string;
  keywords: string[];
  weight: number; // How important is this domain
}

type Cat4RootCauseId =
  | "energy-sleep-debt"
  | "emotional-avoidance"
  | "stress-overload"
  | "identity-self-talk"
  | "environment-friction"
  | "clarity-priority-gap";

interface RootCauseResult {
  primary: Cat4RootCauseId;
  secondary: Cat4RootCauseId | null;
  scores: Record<Cat4RootCauseId, number>;
}

type Cat1RootCauseId =
  | "anxiety-overactivation"
  | "numbing-shutdown"
  | "anger-reactivity"
  | "emotional-avoidance"
  | "self-judgment-shame"
  | "connection-support-gap";

interface RootCauseResultCat1 {
  primary: Cat1RootCauseId;
  secondary: Cat1RootCauseId | null;
  scores: Record<Cat1RootCauseId, number>;
}

type SupportedRootCause = RootCauseResult | RootCauseResultCat1;

type Cat2RootCauseId =
  | "avoidance-procrastination"
  | "fear-failure-judgment"
  | "fear-success-pressure"
  | "stability-risk-tension"
  | "clarity-decision-friction"
  | "burnout-sustainability";

interface RootCauseResultCat2 {
  primary: Cat2RootCauseId;
  secondary: Cat2RootCauseId | null;
  scores: Record<Cat2RootCauseId, number>;
}

type Cat3RootCauseId =
  | "insecurity-attachment-anxiety"
  | "distance-avoidance-protection"
  | "conflict-defensiveness-jealousy"
  | "vulnerability-fear-rejection"
  | "repair-communication-gap"
  | "identity-boundary-balance";

interface RootCauseResultCat3 {
  primary: Cat3RootCauseId;
  secondary: Cat3RootCauseId | null;
  scores: Record<Cat3RootCauseId, number>;
}

type Cat5RootCauseId =
  | "self-criticism-shame"
  | "comparison-performance-identity"
  | "fixed-story-identity-fusion"
  | "belonging-approval-pattern"
  | "values-alignment-gap"
  | "risk-avoidance-smallness";

interface RootCauseResultCat5 {
  primary: Cat5RootCauseId;
  secondary: Cat5RootCauseId | null;
  scores: Record<Cat5RootCauseId, number>;
}

type Cat6RootCauseId =
  | "scarcity-fear-anxiety"
  | "money-shame-worthiness"
  | "avoidance-clarity-gap"
  | "impulse-reactivity-pattern"
  | "control-rigidity-hoarding"
  | "values-alignment-direction";

interface RootCauseResultCat6 {
  primary: Cat6RootCauseId;
  secondary: Cat6RootCauseId | null;
  scores: Record<Cat6RootCauseId, number>;
}

const CAT4_CAUSE_LABELS: Record<Cat4RootCauseId, string> = {
  "energy-sleep-debt": "Energy and sleep debt",
  "emotional-avoidance": "Emotional avoidance",
  "stress-overload": "Stress overload",
  "identity-self-talk": "Identity and self-talk loop",
  "environment-friction": "Environment friction",
  "clarity-priority-gap": "Clarity and priority gap",
};

const CAT4_CAUSE_KEYWORDS: Record<Cat4RootCauseId, string[]> = {
  "energy-sleep-debt": [
    "sleep",
    "bedtime",
    "late night",
    "exhausted",
    "tired",
    "depleted",
    "energy",
    "rest",
    "recovery",
    "daylight",
  ],
  "emotional-avoidance": [
    "avoid",
    "escape",
    "numbing",
    "scrolling",
    "phone",
    "buffer",
    "lonely",
    "emptiness",
    "anxiety",
    "grief",
    "anger",
    "harsh self-talk",
  ],
  "stress-overload": [
    "overwhelmed",
    "stress",
    "pressure",
    "capacity",
    "slammed",
    "too much",
    "debt",
    "drained",
    "burnout",
    "restless",
  ],
  "identity-self-talk": [
    "identity",
    "who you are",
    "i am",
    "shame",
    "guilt",
    "not good enough",
    "self-respect",
    "kindness",
    "deserve",
    "inner critic",
  ],
  "environment-friction": [
    "environment",
    "friction",
    "default",
    "routine",
    "trigger",
    "cue",
    "phone in bedroom",
    "notifications",
    "prep",
    "system",
  ],
  "clarity-priority-gap": [
    "priority",
    "clarity",
    "one thing",
    "meaningful",
    "focus",
    "direction",
    "what matters",
    "postponing",
    "reset",
    "intention",
  ],
};

const CAT1_CAUSE_LABELS: Record<Cat1RootCauseId, string> = {
  "anxiety-overactivation": "Anxiety and overactivation",
  "numbing-shutdown": "Numbing and shutdown",
  "anger-reactivity": "Anger and reactivity",
  "emotional-avoidance": "Emotional avoidance",
  "self-judgment-shame": "Self-judgment and shame loop",
  "connection-support-gap": "Connection and support gap",
};

const CAT1_CAUSE_KEYWORDS: Record<Cat1RootCauseId, string[]> = {
  "anxiety-overactivation": [
    "anxious",
    "wired",
    "on edge",
    "panic",
    "overwhelmed",
    "stress",
    "uncertainty",
    "pressure",
  ],
  "numbing-shutdown": [
    "low",
    "empty",
    "numb",
    "flat",
    "shut down",
    "checked out",
    "withdraw",
    "depleted",
  ],
  "anger-reactivity": [
    "angry",
    "irritable",
    "resentful",
    "snap",
    "argue",
    "vent",
    "lose control",
    "regret",
  ],
  "emotional-avoidance": [
    "distract",
    "scrolling",
    "phone",
    "food",
    "work",
    "escape",
    "avoid",
    "run",
  ],
  "self-judgment-shame": [
    "guilt",
    "shame",
    "judgment",
    "rejection",
    "too much",
    "harsh self-talk",
    "self-criticism",
  ],
  "connection-support-gap": [
    "withdraw from people",
    "cancel",
    "alone",
    "connection",
    "support",
    "honest conversation",
    "talk to someone",
  ],
};

const CAT2_CAUSE_LABELS: Record<Cat2RootCauseId, string> = {
  "avoidance-procrastination": "Avoidance and procrastination loop",
  "fear-failure-judgment": "Fear of failure and judgment",
  "fear-success-pressure": "Fear of success and pressure",
  "stability-risk-tension": "Stability vs risk tension",
  "clarity-decision-friction": "Clarity and decision friction",
  "burnout-sustainability": "Burnout and sustainability strain",
};

const CAT2_CAUSE_KEYWORDS: Record<Cat2RootCauseId, string[]> = {
  "avoidance-procrastination": [
    "busywork",
    "start tomorrow",
    "safer tasks",
    "endless prep",
    "talking without concrete next steps",
    "procrastinate",
    "avoid",
    "frozen",
  ],
  "fear-failure-judgment": [
    "public failure",
    "looking foolish",
    "not enough",
    "fell short",
    "judgment",
    "imperfect",
    "ship",
  ],
  "fear-success-pressure": [
    "success",
    "raises the bar",
    "can't sustain expectations",
    "pressure",
    "expectations",
    "performance",
  ],
  "stability-risk-tension": [
    "losing stability",
    "rock the boat",
    "money pressure",
    "caregiving",
    "security",
    "steady base",
    "revolution",
  ],
  "clarity-decision-friction": [
    "can't trust my judgment",
    "what's worth chasing",
    "naming what i want",
    "clarity",
    "next step",
    "deciding",
    "pivot",
  ],
  "burnout-sustainability": [
    "drains me",
    "fighting fires",
    "sustainable pace",
    "heroics",
    "energy",
    "alignment",
    "burnout",
  ],
};

const CAT3_CAUSE_LABELS: Record<Cat3RootCauseId, string> = {
  "insecurity-attachment-anxiety": "Insecurity and attachment anxiety",
  "distance-avoidance-protection": "Distance and avoidance protection",
  "conflict-defensiveness-jealousy": "Conflict, defensiveness, and jealousy",
  "vulnerability-fear-rejection": "Vulnerability fear and rejection sensitivity",
  "repair-communication-gap": "Repair and communication gap",
  "identity-boundary-balance": "Identity, boundaries, and closeness balance",
};

const CAT3_CAUSE_KEYWORDS: Record<Cat3RootCauseId, string[]> = {
  "insecurity-attachment-anxiety": [
    "insecure",
    "needy",
    "reassurance",
    "chasing",
    "pursuit",
    "fear they'd judge",
    "abandon",
    "anxious attachment",
  ],
  "distance-avoidance-protection": [
    "distance",
    "go cold",
    "busy",
    "hide",
    "stays hidden",
    "pull back",
    "withdraw",
    "performing fine",
  ],
  "conflict-defensiveness-jealousy": [
    "anger",
    "jealousy",
    "resentment",
    "defensive",
    "friction",
    "blow things up",
    "arguments",
    "conflict",
  ],
  "vulnerability-fear-rejection": [
    "rejection",
    "too much",
    "saw all of me",
    "messy truths",
    "vulnerability",
    "fear",
    "shame",
  ],
  "repair-communication-gap": [
    "mixed signals",
    "glide past",
    "nothing shifts",
    "repair",
    "honesty",
    "naming what's true",
    "say real things",
  ],
  "identity-boundary-balance": [
    "losing myself",
    "boundaries",
    "balance",
    "protecting myself",
    "image",
    "depth",
    "closeness",
    "sustain",
  ],
};

const CAT5_CAUSE_LABELS: Record<Cat5RootCauseId, string> = {
  "self-criticism-shame": "Self-criticism and shame spiral",
  "comparison-performance-identity": "Comparison and performance-based identity",
  "fixed-story-identity-fusion": "Fixed story and identity fusion",
  "belonging-approval-pattern": "Belonging and approval pattern",
  "values-alignment-gap": "Values and alignment gap",
  "risk-avoidance-smallness": "Risk avoidance and staying small",
};

const CAT5_CAUSE_KEYWORDS: Record<Cat5RootCauseId, string[]> = {
  "self-criticism-shame": [
    "lazy",
    "weak",
    "faults",
    "cruel absolutes",
    "shame",
    "not enough",
    "self-respect",
    "harsh",
  ],
  "comparison-performance-identity": [
    "behind",
    "ordinary",
    "compare",
    "useful",
    "impressive",
    "perform",
    "image",
    "judgment",
  ],
  "fixed-story-identity-fusion": [
    "that's who i am",
    "just how i am",
    "story",
    "label",
    "final verdict",
    "identity",
    "fixed",
  ],
  "belonging-approval-pattern": [
    "only liked",
    "belonging",
    "performing",
    "peers",
    "exclusion",
    "approval",
    "fit in",
  ],
  "values-alignment-gap": [
    "values",
    "coherence",
    "fit over image",
    "actions that match",
    "self-respect",
    "ordinary days",
  ],
  "risk-avoidance-smallness": [
    "stay small",
    "underdog comfort",
    "excuse not to try",
    "risk",
    "shrink",
    "trying things",
  ],
};

const CAT6_CAUSE_LABELS: Record<Cat6RootCauseId, string> = {
  "scarcity-fear-anxiety": "Scarcity fear and financial anxiety",
  "money-shame-worthiness": "Money shame and worthiness conflict",
  "avoidance-clarity-gap": "Avoidance and clarity gap",
  "impulse-reactivity-pattern": "Impulse and stress-reactive spending",
  "control-rigidity-hoarding": "Control, rigidity, and hoarding pattern",
  "values-alignment-direction": "Values and financial direction alignment",
};

const CAT6_CAUSE_KEYWORDS: Record<Cat6RootCauseId, string[]> = {
  "scarcity-fear-anxiety": [
    "never enough",
    "afraid",
    "fear",
    "bad will catch me",
    "costs rise",
    "uncertainty",
    "panic",
    "surprises",
    "safety first",
  ],
  "money-shame-worthiness": [
    "greedy",
    "deserves wealth",
    "shame",
    "irresponsible",
    "behind",
    "guilt",
    "prove i'm good",
    "harsh comparisons",
  ],
  "avoidance-clarity-gap": [
    "postpone opening apps",
    "bills",
    "avoid",
    "need bandwidth",
    "naming it is hard",
    "clarity",
    "know what i earn spend and owe",
  ],
  "impulse-reactivity-pattern": [
    "impulse-spend",
    "treat myself",
    "drained",
    "stressed",
    "compare myself",
    "lifts me for a moment",
  ],
  "control-rigidity-hoarding": [
    "tighten up",
    "hoard",
    "check accounts a lot",
    "freeze spending",
    "control",
    "risk",
  ],
  "values-alignment-direction": [
    "tradeoffs",
    "what matters",
    "values",
    "alignment",
    "simpler slower life",
    "enough by design",
    "build savings",
    "growth",
  ],
};

const CAT1_ANGER_TRIGGER_KEYWORDS = [
  "snap",
  "argue",
  "vent",
  "guilty",
  "regret",
  "lose control",
];

const CAT1_ANGER_PRIORITY_KEYWORDS = [
  "anger",
  "irritable",
  "resentful",
  "react",
  "response",
  "regulate",
  "nervous system",
  "de-escalate",
  "pause",
  "self-kindness",
  "self-compassion",
  "shame",
  "guilt",
  "repair",
];

const CAT1_EXISTENTIAL_DRIFT_KEYWORDS = [
  "death",
  "tragic triad",
  "existential",
  "meaning of life",
  "mortality",
  "finitude",
];

const SEMANTIC_DOMAINS: SemanticDomain[] = [
  // GUILT & SHAME domains
  {
    domain: "GUILT_SHAME",
    keywords: [
      "guilt",
      "guilty",
      "shame",
      "shameful",
      "unworthy",
      "bad",
      "selfish",
      "greedy",
      "evil",
      "wrong",
      "regret",
      "regrets",
      "regretting",
    ],
    weight: 1.0,
  },
  {
    domain: "INHERITED_PATTERNS",
    keywords: ["parents", "family", "learned", "taught", "generational", "pattern", "inherited", "mother", "father"],
    weight: 0.9,
  },
  {
    domain: "SCARCITY_FEAR",
    keywords: [
      "never enough",
      "terrified",
      "afraid",
      "scared",
      "fear",
      "worried",
      "worrying",
      "anxiety",
      "scarcity",
      "not enough",
    ],
    weight: 0.95,
  },
  {
    domain: "ABUNDANCE_WORTHINESS",
    keywords: ["deserve", "worthy", "deserving", "abundance", "wealth", "deserving", "secure", "safe"],
    weight: 0.9,
  },
  {
    domain: "CONTROL_RIGIDITY",
    keywords: ["control", "obsess", "rigid", "perfectionism", "perfect", "precise", "exact", "strict", "discipline"],
    weight: 0.8,
  },
  {
    domain: "IMPULSIVITY",
    keywords: ["impulsive", "spend", "reckless", "act without thinking", "reactive", "automatic"],
    weight: 0.75,
  },
  {
    domain: "MEANING_PURPOSE",
    keywords: [
      "meaning",
      "meaningless",
      "purpose",
      "why",
      "fulfillment",
      "fulfilling",
      "unfulfilled",
      "calling",
      "passion",
      "reason",
    ],
    weight: 0.95,
  },
  {
    domain: "GROWTH_MINDSET",
    keywords: [
      "growth",
      "learn",
      "learning",
      "improve",
      "change",
      "develop",
      "effort",
      "practice",
      "skill",
    ],
    weight: 0.85,
  },
  {
    domain: "SELF_CRITICISM",
    keywords: ["harsh", "beat myself", "critical", "judge", "judge myself", "perfectionist", "not good enough"],
    weight: 0.9,
  },
  {
    domain: "RELATIONSHIPS_CONNECTION",
    keywords: [
      "relationships",
      "relationship",
      "connection",
      "disconnected",
      "intimate",
      "close",
      "partner",
      "spouse",
      "people",
      "dating",
      "marriage",
      "divorce",
      "breakup",
      "lonely",
      "loneliness",
      "conflict",
    ],
    weight: 0.8,
  },
  {
    domain: "AVOIDANCE",
    keywords: [
      "avoid",
      "avoidance",
      "procrastinate",
      "procrastinating",
      "put off",
      "escape",
      "escaping",
      "distract",
      "distracting",
      "run from",
      "scroll",
      "scrolling",
      "phone",
      "overwhelmed",
      "overwhelm",
    ],
    weight: 0.85,
  },
  {
    domain: "ANGER_REACTIVITY",
    keywords: [
      "angry",
      "anger",
      "irate",
      "irritable",
      "rage",
      "furious",
      "lash",
      "snapped",
      "snap",
      "lash out",
      "resent",
      "resentful",
      "irritated",
      "reactive",
      "temper",
    ],
    weight: 0.92,
  },
  {
    domain: "ATTACHMENT_RELATIONSHIP_DYNAMICS",
    keywords: [
      "attachment",
      "anxious attachment",
      "avoidant",
      "secure attachment",
      "intimacy",
      "vulnerability",
      "vulnerable",
      "pursuer",
      "withdraw",
      "withdrawing",
      "withdrawal",
      "reassurance",
      "clingy",
      "smothered",
      "mind-reading",
      "resentment",
      "criticize",
      "betrayal",
      "trust",
      "boundary",
      "boundaries",
    ],
    weight: 0.94,
  },
  {
    domain: "WORK_STRESS_ROLE",
    keywords: [
      "burnout",
      "burned out",
      "deadline",
      "deadlines",
      "boss",
      "coworker",
      "colleague",
      "promotion",
      "career",
      "job",
      "workload",
      "overwork",
      "overworked",
      "delegate",
      "delegation",
      "priorities",
      "prioritize",
      "productivity",
      "productive",
      "meetings",
      "stretched thin",
      "essential",
      "trade-off",
      "trade off",
      "startup",
      "freelance",
      "employee",
    ],
    weight: 0.9,
  },
  {
    domain: "IDENTITY_VALUES_SELFWORTH",
    keywords: [
      "authentic",
      "authenticity",
      "identity",
      "values",
      "alignment",
      "aligned",
      "belonging",
      "belong",
      "imposter",
      "impostor",
      "self-worth",
      "who am i",
    ],
    weight: 0.88,
  },
  {
    domain: "BODY_ENERGY_ROUTINES",
    keywords: [
      "sleep",
      "sleeping",
      "insomnia",
      "exhaustion",
      "tired",
      "rest",
      "routine",
      "routines",
      "habit",
      "habits",
      "workout",
      "exercise",
      "gym",
      "walking",
      "alcohol",
      "drinking",
      "smoking",
      "caffeine",
      "diet",
      "eating",
      "nutrition",
      "morning routine",
      "evening routine",
    ],
    weight: 0.86,
  },
  {
    domain: "MONEY_FINANCE_PRACTICAL",
    keywords: [
      "money",
      "debt",
      "debts",
      "savings",
      "budget",
      "budgeting",
      "invest",
      "investing",
      "investment",
      "salary",
      "income",
      "expenses",
      "expense",
      "bills",
      "financial",
      "finance",
      "bank",
      "overspending",
      "spending",
      "profit",
      "revenue",
      "tax",
      "taxes",
      "business income",
      "bankrupt",
      "loan",
      "loans",
      "clarity",
      "owe",
      "balances",
      "checking",
    ],
    weight: 0.93,
  },
  {
    domain: "EVENING_QUIET_STRESS",
    keywords: [
      "night",
      "quiet",
      "evening",
      "late",
      "wired",
      "exhausted",
      "sleep",
      "bed",
      "alone",
      "restless",
      "tossing",
    ],
    weight: 0.88,
  },
  {
    domain: "ANXIETY_DISTRESS",
    keywords: [
      "anxious",
      "anxiety",
      "panic",
      "worry",
      "worried",
      "on edge",
      "low mood",
      "empty",
      "stress",
      "stressed",
      "numb",
      "depleted",
    ],
    weight: 0.9,
  },
  {
    domain: "SYSTEMS_STRUCTURE",
    keywords: ["system", "structure", "organize", "organize", "plan", "framework", "process"],
    weight: 0.7,
  },
];

/**
 * Map keyword to semantic domains it belongs to
 */
export const mapKeywordToDomains = (keyword: string): SemanticDomain[] => {
  return SEMANTIC_DOMAINS.filter((domain) =>
    domain.keywords.some((kw) => kw.includes(keyword) || keyword.includes(kw))
  );
};

/**
 * Extract semantic domains from text (instead of just keywords)
 */
export const extractSemanticDomains = (text: string): string[] => {
  const lower = text.toLowerCase();
  const domains = new Set<string>();

  for (const d of SEMANTIC_DOMAINS) {
    for (const kw of d.keywords) {
      if (kw.length < 2) continue;
      if (matchLexemeInText(lower, kw)) {
        domains.add(d.domain);
        break;
      }
    }
  }

  return Array.from(domains);
};

/**
 * Score a principle based on SEMANTIC DOMAIN matching (not just keyword matching)
 * 
 * Example:
 * User says "guilt when I make money" → extracts GUILT_SHAME + ABUNDANCE_WORTHINESS domains
 * Principle "Worthiness: You Must Believe You Deserve Money" addresses these domains
 * → Higher score because it directly addresses the semantic meaning
 */
const scorePrinciple = (principle: WisdomPrinciple, userDomains: string[]): number => {
  let score = 0;

  const applicableWhenText = (principle.applicableWhen || []).join(" ").toLowerCase();
  const applicableScenarioText = (principle.applicableScenarios || []).join(" ").toLowerCase();

  // Compile all principle text for domain matching
  const principleText = `
    ${principle.principleTitle}
    ${principle.description}
    ${principle.coreConcept}
    ${principle.simpleExplanation}
    ${principle.applicableWhen?.join(" ") || ""}
    ${principle.applicableScenarios?.join(" ") || ""}
    ${principle.microAction}
    ${principle.whyItMatters}
  `.toLowerCase();

  // Check for domain keywords in principle text
  userDomains.forEach((userDomain) => {
    const domain = SEMANTIC_DOMAINS.find((d) => d.domain === userDomain);
    if (!domain) return;

    const domainKeywords = domain.keywords;

    const keywordMatches = domainKeywords.filter((kw) => principleText.includes(kw)).length;

    if (keywordMatches === 0) {
      const softHits = domain.keywords.filter(
        (k) => k.length > 3 && (applicableScenarioText.includes(k) || applicableWhenText.includes(k))
      ).length;
      if (softHits > 0) {
        score += domain.weight * (0.12 + Math.min(softHits, 4) * 0.06);
      }
    } else {
      const matchRatio = keywordMatches / domainKeywords.length;
      score += domain.weight * (0.4 + matchRatio * 0.6);
    }

    if (
      principle.applicableScenarios?.some((s) => {
        const scenario = s.toLowerCase();
        return domainKeywords.some((kw) => scenario.includes(kw));
      })
    ) {
      score += domain.weight * 0.25;
    }
  });

  return score;
};

/** Common tokens that appear in many principles and user answers—weak overlap signal on their own. */
const AMBIGUOUS_OVERLAP_KEYWORDS = new Set([
  "work",
  "time",
  "feel",
  "life",
  "people",
  "person",
  "thing",
  "things",
  "day",
  "hard",
  "love",
  "need",
]);

/** Max principles sent to the presentation LLM (first insight V1). */
export const INSIGHT_RAG_TOP_N = 3;

/** Drop weak matches relative to the best score (keeps cards specific). */
const PRINCIPLE_MIN_RELATIVE_SCORE = 0.38;
const PRINCIPLE_MIN_ABSOLUTE_SCORE = 0.22;

const isPresetInsightAnswer = (
  categoryId: string,
  questionId: string,
  answer: string
): boolean => {
  const trimmed = answer.trim();
  if (!trimmed) return false;
  const presets = INSIGHT_CHOICES[categoryId]?.[questionId];
  if (!presets?.length) return false;
  return presets.some((c) => c.label === trimmed);
};

/** User-typed answers (not a tap option) carry the most specific signal. */
const customAnswerTexts = (
  categoryId: string,
  answers: Record<string, string>
): string[] => {
  const lines: string[] = [];
  for (const [qId, raw] of Object.entries(answers)) {
    const text = raw?.trim();
    if (!text) continue;
    if (!isPresetInsightAnswer(categoryId, qId, text)) {
      lines.push(text);
    }
  }
  return lines;
};

/** Q4–Q6 plus custom lines; custom duplicated lightly for keyword extraction. */
const emphasisTextLower = (categoryId: string, answers: Record<string, string>): string => {
  const custom = customAnswerTexts(categoryId, answers).join(" ");
  return `${answers.q4 ?? ""} ${answers.q5 ?? ""} ${answers.q6 ?? ""} ${custom} ${custom}`.toLowerCase();
};

/** Extra retrieval signal: user vocabulary appears in scenario/when strings (whole-word on principle blob). */
const scoreAnswerOverlap = (
  principle: WisdomPrinciple,
  combinedLower: string,
  userKeywords: string[],
  emphasisLower: string
): number => {
  const blob = `${principle.applicableWhen?.join(" ") || ""} ${principle.applicableScenarios?.join(" ") || ""}`.toLowerCase();
  let bonus = 0;
  for (const uk of userKeywords) {
    if (uk.length < 4) continue;
    if (!combinedLower.includes(uk)) continue;
    if (!matchLexemeInText(blob, uk)) continue;
    let increment = 0.62;
    if (AMBIGUOUS_OVERLAP_KEYWORDS.has(uk)) {
      increment *= 0.34;
    }
    if (emphasisLower.length > 0 && matchLexemeInText(emphasisLower, uk)) {
      increment += 0.24;
    }
    bonus += increment;
  }
  return Math.min(bonus, 3.2);
};

const classifyCat4RootCause = (combinedLower: string): RootCauseResult => {
  const scores: Record<Cat4RootCauseId, number> = {
    "energy-sleep-debt": 0,
    "emotional-avoidance": 0,
    "stress-overload": 0,
    "identity-self-talk": 0,
    "environment-friction": 0,
    "clarity-priority-gap": 0,
  };

  (Object.keys(CAT4_CAUSE_KEYWORDS) as Cat4RootCauseId[]).forEach((causeId) => {
    CAT4_CAUSE_KEYWORDS[causeId].forEach((kw) => {
      if (matchLexemeInText(combinedLower, kw)) scores[causeId] += 1;
    });
  });

  // Light heuristics tuned for current Category 4 option language.
  if (matchLexemeInText(combinedLower, "revenge bedtime")) scores["energy-sleep-debt"] += 2;
  if (matchLexemeInText(combinedLower, "i deserve this escape")) scores["emotional-avoidance"] += 2;
  if (matchLexemeInText(combinedLower, "don't have capacity")) scores["stress-overload"] += 2;
  if (matchLexemeInText(combinedLower, "harsh self-talk")) scores["identity-self-talk"] += 2;
  if (matchLexemeInText(combinedLower, "defaults")) scores["environment-friction"] += 2;
  if (matchLexemeInText(combinedLower, "one thing")) scores["clarity-priority-gap"] += 2;

  const ordered = (Object.entries(scores) as Array<[Cat4RootCauseId, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const primary = ordered[0][1] > 0 ? ordered[0][0] : "environment-friction";
  const secondary = ordered[1][1] > 0 ? ordered[1][0] : null;

  return { primary, secondary, scores };
};

const scorePrincipleForCat4Cause = (
  principle: WisdomPrinciple,
  cause: Cat4RootCauseId
): number => {
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const hits = CAT4_CAUSE_KEYWORDS[cause].filter((kw) => matchLexemeInText(principleText, kw)).length;
  if (hits === 0) return 0;
  return Math.min(hits * 0.55, 2.2);
};

const classifyCat1RootCause = (combinedLower: string): RootCauseResultCat1 => {
  const scores: Record<Cat1RootCauseId, number> = {
    "anxiety-overactivation": 0,
    "numbing-shutdown": 0,
    "anger-reactivity": 0,
    "emotional-avoidance": 0,
    "self-judgment-shame": 0,
    "connection-support-gap": 0,
  };

  (Object.keys(CAT1_CAUSE_KEYWORDS) as Cat1RootCauseId[]).forEach((causeId) => {
    CAT1_CAUSE_KEYWORDS[causeId].forEach((kw) => {
      if (matchLexemeInText(combinedLower, kw)) scores[causeId] += 1;
    });
  });

  // Heuristics tuned to current mental-health option language.
  if (matchLexemeInText(combinedLower, "on edge")) scores["anxiety-overactivation"] += 2;
  if (matchLexemeInText(combinedLower, "checked out")) scores["numbing-shutdown"] += 2;
  if (matchLexemeInText(combinedLower, "snap, argue, or vent")) scores["anger-reactivity"] += 2;
  if (matchLexemeInText(combinedLower, "don't have to sit in it")) scores["emotional-avoidance"] += 2;
  if (matchLexemeInText(combinedLower, "being \"too much\"")) scores["self-judgment-shame"] += 2;
  if (matchLexemeInText(combinedLower, "one honest conversation")) scores["connection-support-gap"] += 2;

  const ordered = (Object.entries(scores) as Array<[Cat1RootCauseId, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const primary = ordered[0][1] > 0 ? ordered[0][0] : "emotional-avoidance";
  const secondary = ordered[1][1] > 0 ? ordered[1][0] : null;

  return { primary, secondary, scores };
};

const scorePrincipleForCat1Cause = (
  principle: WisdomPrinciple,
  cause: Cat1RootCauseId
): number => {
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const hits = CAT1_CAUSE_KEYWORDS[cause].filter((kw) => matchLexemeInText(principleText, kw)).length;
  if (hits === 0) return 0;
  return Math.min(hits * 0.52, 2.0);
};

const scoreMentalHealthAngerPriority = (
  principle: WisdomPrinciple,
  combinedLower: string
): number => {
  const isTriggerPresent = CAT1_ANGER_TRIGGER_KEYWORDS.some((kw) =>
    matchLexemeInText(combinedLower, kw)
  );
  if (!isTriggerPresent) return 0;

  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const priorityHits = CAT1_ANGER_PRIORITY_KEYWORDS.filter((kw) =>
    matchLexemeInText(principleText, kw)
  ).length;
  const existentialHits = CAT1_EXISTENTIAL_DRIFT_KEYWORDS.filter((kw) =>
    matchLexemeInText(principleText, kw)
  ).length;

  // Strongly prefer regulation/shame-repair principles when explicit reactivity signal is present.
  let delta = Math.min(priorityHits * 0.65, 2.6);
  if (existentialHits > 0 && priorityHits < 2) {
    delta -= Math.min(existentialHits * 1.1, 2.2);
  }
  return delta;
};

const classifyCat2RootCause = (combinedLower: string): RootCauseResultCat2 => {
  const scores: Record<Cat2RootCauseId, number> = {
    "avoidance-procrastination": 0,
    "fear-failure-judgment": 0,
    "fear-success-pressure": 0,
    "stability-risk-tension": 0,
    "clarity-decision-friction": 0,
    "burnout-sustainability": 0,
  };

  (Object.keys(CAT2_CAUSE_KEYWORDS) as Cat2RootCauseId[]).forEach((causeId) => {
    CAT2_CAUSE_KEYWORDS[causeId].forEach((kw) => {
      if (matchLexemeInText(combinedLower, kw)) scores[causeId] += 1;
    });
  });

  // Heuristics aligned with current work-purpose option language.
  if (matchLexemeInText(combinedLower, "busywork") || matchLexemeInText(combinedLower, "start tomorrow")) {
    scores["avoidance-procrastination"] += 2;
  }
  if (matchLexemeInText(combinedLower, "public failure") || matchLexemeInText(combinedLower, "looking foolish")) {
    scores["fear-failure-judgment"] += 2;
  }
  if (matchLexemeInText(combinedLower, "raises the bar")) scores["fear-success-pressure"] += 2;
  if (matchLexemeInText(combinedLower, "losing stability") || matchLexemeInText(combinedLower, "rock the boat")) {
    scores["stability-risk-tension"] += 2;
  }
  if (matchLexemeInText(combinedLower, "can't trust my judgment") || matchLexemeInText(combinedLower, "clarity")) {
    scores["clarity-decision-friction"] += 2;
  }
  if (matchLexemeInText(combinedLower, "fighting fires") || matchLexemeInText(combinedLower, "sustainable pace")) {
    scores["burnout-sustainability"] += 2;
  }

  const ordered = (Object.entries(scores) as Array<[Cat2RootCauseId, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const primary = ordered[0][1] > 0 ? ordered[0][0] : "avoidance-procrastination";
  const secondary = ordered[1][1] > 0 ? ordered[1][0] : null;

  return { primary, secondary, scores };
};

const scorePrincipleForCat2Cause = (
  principle: WisdomPrinciple,
  cause: Cat2RootCauseId
): number => {
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const hits = CAT2_CAUSE_KEYWORDS[cause].filter((kw) => matchLexemeInText(principleText, kw)).length;
  if (hits === 0) return 0;
  return Math.min(hits * 0.56, 2.2);
};

const classifyCat3RootCause = (combinedLower: string): RootCauseResultCat3 => {
  const scores: Record<Cat3RootCauseId, number> = {
    "insecurity-attachment-anxiety": 0,
    "distance-avoidance-protection": 0,
    "conflict-defensiveness-jealousy": 0,
    "vulnerability-fear-rejection": 0,
    "repair-communication-gap": 0,
    "identity-boundary-balance": 0,
  };

  (Object.keys(CAT3_CAUSE_KEYWORDS) as Cat3RootCauseId[]).forEach((causeId) => {
    CAT3_CAUSE_KEYWORDS[causeId].forEach((kw) => {
      if (matchLexemeInText(combinedLower, kw)) scores[causeId] += 1;
    });
  });

  // Heuristics aligned with relationship option language.
  if (matchLexemeInText(combinedLower, "reassurance")) scores["insecurity-attachment-anxiety"] += 2;
  if (matchLexemeInText(combinedLower, "go cold") || matchLexemeInText(combinedLower, "stays hidden")) {
    scores["distance-avoidance-protection"] += 2;
  }
  if (matchLexemeInText(combinedLower, "jealousy") || matchLexemeInText(combinedLower, "resentment")) {
    scores["conflict-defensiveness-jealousy"] += 2;
  }
  if (matchLexemeInText(combinedLower, "rejection") || matchLexemeInText(combinedLower, "too much")) {
    scores["vulnerability-fear-rejection"] += 2;
  }
  if (matchLexemeInText(combinedLower, "nothing shifts") || matchLexemeInText(combinedLower, "repair")) {
    scores["repair-communication-gap"] += 2;
  }
  if (matchLexemeInText(combinedLower, "without losing myself") || matchLexemeInText(combinedLower, "boundaries")) {
    scores["identity-boundary-balance"] += 2;
  }

  const ordered = (Object.entries(scores) as Array<[Cat3RootCauseId, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const primary = ordered[0][1] > 0 ? ordered[0][0] : "repair-communication-gap";
  const secondary = ordered[1][1] > 0 ? ordered[1][0] : null;

  return { primary, secondary, scores };
};

const scorePrincipleForCat3Cause = (
  principle: WisdomPrinciple,
  cause: Cat3RootCauseId
): number => {
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const hits = CAT3_CAUSE_KEYWORDS[cause].filter((kw) => matchLexemeInText(principleText, kw)).length;
  if (hits === 0) return 0;
  return Math.min(hits * 0.56, 2.25);
};

const classifyCat5RootCause = (combinedLower: string): RootCauseResultCat5 => {
  const scores: Record<Cat5RootCauseId, number> = {
    "self-criticism-shame": 0,
    "comparison-performance-identity": 0,
    "fixed-story-identity-fusion": 0,
    "belonging-approval-pattern": 0,
    "values-alignment-gap": 0,
    "risk-avoidance-smallness": 0,
  };

  (Object.keys(CAT5_CAUSE_KEYWORDS) as Cat5RootCauseId[]).forEach((causeId) => {
    CAT5_CAUSE_KEYWORDS[causeId].forEach((kw) => {
      if (matchLexemeInText(combinedLower, kw)) scores[causeId] += 1;
    });
  });

  // Heuristics tuned to self-identity option language.
  if (matchLexemeInText(combinedLower, "that's who i am") || matchLexemeInText(combinedLower, "just how i am")) {
    scores["fixed-story-identity-fusion"] += 2;
  }
  if (matchLexemeInText(combinedLower, "only liked if")) scores["belonging-approval-pattern"] += 2;
  if (matchLexemeInText(combinedLower, "behind") || matchLexemeInText(combinedLower, "compare")) {
    scores["comparison-performance-identity"] += 2;
  }
  if (matchLexemeInText(combinedLower, "stay small") || matchLexemeInText(combinedLower, "excuse not to try")) {
    scores["risk-avoidance-smallness"] += 2;
  }
  if (matchLexemeInText(combinedLower, "coherence") || matchLexemeInText(combinedLower, "actions that match")) {
    scores["values-alignment-gap"] += 2;
  }
  if (matchLexemeInText(combinedLower, "replay faults") || matchLexemeInText(combinedLower, "cruel absolutes")) {
    scores["self-criticism-shame"] += 2;
  }

  const ordered = (Object.entries(scores) as Array<[Cat5RootCauseId, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const primary = ordered[0][1] > 0 ? ordered[0][0] : "fixed-story-identity-fusion";
  const secondary = ordered[1][1] > 0 ? ordered[1][0] : null;

  return { primary, secondary, scores };
};

const scorePrincipleForCat5Cause = (
  principle: WisdomPrinciple,
  cause: Cat5RootCauseId
): number => {
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const hits = CAT5_CAUSE_KEYWORDS[cause].filter((kw) => matchLexemeInText(principleText, kw)).length;
  if (hits === 0) return 0;
  return Math.min(hits * 0.56, 2.25);
};

const classifyCat6RootCause = (combinedLower: string): RootCauseResultCat6 => {
  const scores: Record<Cat6RootCauseId, number> = {
    "scarcity-fear-anxiety": 0,
    "money-shame-worthiness": 0,
    "avoidance-clarity-gap": 0,
    "impulse-reactivity-pattern": 0,
    "control-rigidity-hoarding": 0,
    "values-alignment-direction": 0,
  };

  (Object.keys(CAT6_CAUSE_KEYWORDS) as Cat6RootCauseId[]).forEach((causeId) => {
    CAT6_CAUSE_KEYWORDS[causeId].forEach((kw) => {
      if (matchLexemeInText(combinedLower, kw)) scores[causeId] += 1;
    });
  });

  // Heuristics tuned to current money-finance option language.
  if (matchLexemeInText(combinedLower, "never enough")) scores["scarcity-fear-anxiety"] += 2;
  if (matchLexemeInText(combinedLower, "greedy") || matchLexemeInText(combinedLower, "deserves wealth")) {
    scores["money-shame-worthiness"] += 2;
  }
  if (matchLexemeInText(combinedLower, "postpone opening apps") || matchLexemeInText(combinedLower, "without avoiding the picture")) {
    scores["avoidance-clarity-gap"] += 2;
  }
  if (matchLexemeInText(combinedLower, "impulse-spend") || matchLexemeInText(combinedLower, "treat myself")) {
    scores["impulse-reactivity-pattern"] += 2;
  }
  if (matchLexemeInText(combinedLower, "hoard") || matchLexemeInText(combinedLower, "freeze spending")) {
    scores["control-rigidity-hoarding"] += 2;
  }
  if (matchLexemeInText(combinedLower, "alignment") || matchLexemeInText(combinedLower, "enough by design")) {
    scores["values-alignment-direction"] += 2;
  }

  const ordered = (Object.entries(scores) as Array<[Cat6RootCauseId, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const primary = ordered[0][1] > 0 ? ordered[0][0] : "avoidance-clarity-gap";
  const secondary = ordered[1][1] > 0 ? ordered[1][0] : null;

  return { primary, secondary, scores };
};

const scorePrincipleForCat6Cause = (
  principle: WisdomPrinciple,
  cause: Cat6RootCauseId
): number => {
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } ${principle.microAction} `.toLowerCase();

  const hits = CAT6_CAUSE_KEYWORDS[cause].filter((kw) => matchLexemeInText(principleText, kw)).length;
  if (hits === 0) return 0;
  return Math.min(hits * 0.56, 2.25);
};

/**
 * Match user answers to principles using SEMANTIC matching
 * Returns top N principles with their scores
 * 
 * Flow:
 * 1. Extract semantic domains from user answers (guilt, scarcity, inherited patterns, etc)
 * 2. Find principles that address those domains
 * 3. Score by domain coverage + relationship strength
 * 4. Return top N
 */
export const matchPrinciples = (
  categoryId: string,
  answers: Record<string, string>,
  topN: number = 3,
  principlesSource: WisdomPrinciple[] = wisdomKnowledgeBase
): WisdomPrinciple[] => {
  const customLines = customAnswerTexts(categoryId, answers);
  const combinedAnswers =
    Object.values(answers).join(" ") +
    (customLines.length ? ` ${customLines.join(" ")}` : "");
  const combinedLower = combinedAnswers.toLowerCase();
  const emphasisLower = emphasisTextLower(categoryId, answers);
  const userKeywords = extractKeywords(combinedAnswers);

  const userDomains = extractSemanticDomains(combinedAnswers);
  const rootCause =
    categoryId === "habits-lifestyle"
      ? classifyCat4RootCause(combinedLower)
      : categoryId === "mental-health"
        ? classifyCat1RootCause(combinedLower)
        : categoryId === "work-purpose"
          ? classifyCat2RootCause(combinedLower)
          : categoryId === "relationships"
            ? classifyCat3RootCause(combinedLower)
            : categoryId === "self-identity"
              ? classifyCat5RootCause(combinedLower)
              : categoryId === "money-finance"
                ? classifyCat6RootCause(combinedLower)
        : null;

  const categoryPrinciples = principlesSource.filter((p) => p.category === categoryId);

  const scoredPrinciples = categoryPrinciples
    .map((principle) => {
      const overlap = scoreAnswerOverlap(principle, combinedLower, userKeywords, emphasisLower);
      const domainPart =
        userDomains.length > 0 ? scorePrinciple(principle, userDomains) : 0;

      /** Scenario overlap matters more than broad domain hits—reduces generic fits. */
      let score = overlap * 1.28 + domainPart * 0.52;

      if (principle.ragAnchorPhrases?.length) {
        const anchorHit = principle.ragAnchorPhrases.some((phrase) =>
          matchLexemeInText(combinedLower, phrase)
        );
        if (!anchorHit) {
          score *= 0.26;
        }
      }

      if (principle.ragRequiresStrongOverlap && overlap < 0.65) {
        score *= 0.48;
      }

      if (rootCause) {
        const primaryBoost =
          categoryId === "habits-lifestyle"
            ? scorePrincipleForCat4Cause(principle, rootCause.primary as Cat4RootCauseId)
            : categoryId === "mental-health"
              ? scorePrincipleForCat1Cause(principle, rootCause.primary as Cat1RootCauseId)
              : categoryId === "work-purpose"
                ? scorePrincipleForCat2Cause(principle, rootCause.primary as Cat2RootCauseId)
                : categoryId === "relationships"
                  ? scorePrincipleForCat3Cause(principle, rootCause.primary as Cat3RootCauseId)
                  : categoryId === "self-identity"
                    ? scorePrincipleForCat5Cause(principle, rootCause.primary as Cat5RootCauseId)
                    : scorePrincipleForCat6Cause(principle, rootCause.primary as Cat6RootCauseId);
        const secondaryBoost = rootCause.secondary
          ? categoryId === "habits-lifestyle"
            ? scorePrincipleForCat4Cause(principle, rootCause.secondary as Cat4RootCauseId) * 0.55
            : categoryId === "mental-health"
              ? scorePrincipleForCat1Cause(principle, rootCause.secondary as Cat1RootCauseId) * 0.55
              : categoryId === "work-purpose"
                ? scorePrincipleForCat2Cause(principle, rootCause.secondary as Cat2RootCauseId) * 0.55
                : categoryId === "relationships"
                  ? scorePrincipleForCat3Cause(principle, rootCause.secondary as Cat3RootCauseId) * 0.55
                  : categoryId === "self-identity"
                    ? scorePrincipleForCat5Cause(principle, rootCause.secondary as Cat5RootCauseId) * 0.55
                    : scorePrincipleForCat6Cause(principle, rootCause.secondary as Cat6RootCauseId) * 0.55
          : 0;
        score += primaryBoost + secondaryBoost;
      }

      if (categoryId === "mental-health") {
        score += scoreMentalHealthAngerPriority(principle, combinedLower);
      }

      return { principle, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const applyScoreFloor = (items: typeof scoredPrinciples) => {
    if (!items.length) return items;
    const top = items[0].score;
    const floor = Math.max(top * PRINCIPLE_MIN_RELATIVE_SCORE, PRINCIPLE_MIN_ABSOLUTE_SCORE);
    const kept = items.filter((item) => item.score >= floor);
    return kept.length ? kept : items.slice(0, 1);
  };

  const ranked = applyScoreFloor(scoredPrinciples);

  if (ranked.length > 0) {
    if (!rootCause) {
      return ranked.slice(0, topN).map((item) => item.principle);
    }

    // Root-cause-first selection: prefer primary, then secondary, then strongest remainder.
    const selected: WisdomPrinciple[] = [];
    const seen = new Set<string>();

    const takeByCause = (cause: string, maxCount: number) => {
      for (const item of ranked) {
        if (selected.length >= topN || maxCount <= 0) break;
        if (seen.has(item.principle.id)) continue;
        const causeScore =
          categoryId === "habits-lifestyle"
            ? scorePrincipleForCat4Cause(item.principle, cause as Cat4RootCauseId)
            : categoryId === "mental-health"
              ? scorePrincipleForCat1Cause(item.principle, cause as Cat1RootCauseId)
              : categoryId === "work-purpose"
                ? scorePrincipleForCat2Cause(item.principle, cause as Cat2RootCauseId)
                : categoryId === "relationships"
                  ? scorePrincipleForCat3Cause(item.principle, cause as Cat3RootCauseId)
                  : categoryId === "self-identity"
                    ? scorePrincipleForCat5Cause(item.principle, cause as Cat5RootCauseId)
                    : scorePrincipleForCat6Cause(item.principle, cause as Cat6RootCauseId);
        if (causeScore <= 0) continue;
        selected.push(item.principle);
        seen.add(item.principle.id);
        maxCount -= 1;
      }
    };

    takeByCause(rootCause.primary, Math.min(3, topN));
    if (rootCause.secondary) takeByCause(rootCause.secondary, Math.min(2, topN - selected.length));

    for (const item of ranked) {
      if (selected.length >= topN) break;
      if (seen.has(item.principle.id)) continue;
      selected.push(item.principle);
      seen.add(item.principle.id);
    }

    return selected.slice(0, topN);
  }

  return matchPrinciplesFallback(categoryId, combinedAnswers, topN, principlesSource);
};

/**
 * Fallback: keyword-based matching if semantic extraction fails
 */
const matchPrinciplesFallback = (
  categoryId: string,
  text: string,
  topN: number = 3,
  principlesSource: WisdomPrinciple[] = wisdomKnowledgeBase
): WisdomPrinciple[] => {
  const keywords = extractKeywords(text);
  if (keywords.length === 0) return [];

  const categoryPrinciples = principlesSource.filter((p) => p.category === categoryId);
  const principleText = (principle: WisdomPrinciple) =>
    `${principle.principleTitle} ${principle.description} ${principle.simpleExplanation} ${principle.applicableWhen?.join(
      " "
    )} ${principle.applicableScenarios?.join(" ")}`.toLowerCase();

  const scoredPrinciples = categoryPrinciples
    .map((principle) => {
      let score = 0;
      keywords.forEach((kw) => {
        if (principle.applicableScenarios?.some((s) => s.toLowerCase().includes(kw))) score += 1.0;
        if (principle.applicableWhen?.some((w) => w.toLowerCase().includes(kw))) score += 0.8;
        if (principleText(principle).includes(kw)) score += 0.4;
      });
      return { principle, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scoredPrinciples.map((item) => item.principle);
};

/**
 * Format principles for display/LLM
 */
export interface FormattedPrinciple {
  id: string;
  bookTitle: string;
  author: string;
  principleTitle: string;
  description: string;
  coreQuote?: string;
  whyContext: string;
  userAnchors: string[];
  simpleExplanation: string;
  microAction: string;
  timeToImplement: string;
}

const buildUserAnchors = (
  principle: WisdomPrinciple,
  answers: Record<string, string>
): string[] => {
  const combinedLower = Object.values(answers).join(" ").toLowerCase();
  const principleText = ` ${principle.principleTitle} ${principle.description} ${
    principle.simpleExplanation
  } ${principle.whyItMatters} ${principle.applicableWhen?.join(" ") || ""} ${
    principle.applicableScenarios?.join(" ") || ""
  } `.toLowerCase();

  const userKeywords = extractKeywords(combinedLower).filter((kw) => kw.length >= 4);
  const anchors = userKeywords.filter((kw) => matchLexemeInText(principleText, kw));
  return anchors.slice(0, 4);
};

const buildWhyContext = (principle: WisdomPrinciple): string => {
  const parts = [
    principle.whyItMatters?.trim(),
    principle.coreConcept?.trim(),
    principle.applicableScenarios?.[0]?.trim(),
  ].filter((value): value is string => Boolean(value));

  const combined = parts.join(" ");
  return combined.length > 380 ? `${combined.slice(0, 377)}...` : combined;
};

export const formatPrinciples = (
  principles: WisdomPrinciple[],
  answers: Record<string, string>
): FormattedPrinciple[] => {
  return principles.map((p) => ({
    id: p.id,
    bookTitle: p.bookTitle,
    author: p.author,
    principleTitle: p.principleTitle,
    description: p.description,
    coreQuote: p.coreQuote,
    whyContext: buildWhyContext(p),
    userAnchors: buildUserAnchors(p, answers),
    simpleExplanation: p.simpleExplanation,
    microAction: p.microAction,
    timeToImplement: p.timeToImplement,
  }));
};

/**
 * Get RAG context for LLM presentation
 */
export interface RAGContext {
  categoryId: string;
  userAnswers: Record<string, string>;
  matchedPrinciples: FormattedPrinciple[];
  totalPrinciples: number;
  rootCauseSummary?: {
    primary: string;
    secondary?: string;
  };
}

export const getRagContext = (
  categoryId: string,
  answers: Record<string, string>,
  requestedTopN?: number
): RAGContext => {
  const targetTopN = requestedTopN ?? INSIGHT_RAG_TOP_N;
  const matched = matchPrinciples(categoryId, answers, targetTopN);
  const formatted = formatPrinciples(matched, answers);
  const combinedLower = Object.values(answers).join(" ").toLowerCase();
  const rootCause =
    categoryId === "habits-lifestyle"
      ? classifyCat4RootCause(combinedLower)
      : categoryId === "mental-health"
        ? classifyCat1RootCause(combinedLower)
        : categoryId === "work-purpose"
          ? classifyCat2RootCause(combinedLower)
          : categoryId === "relationships"
            ? classifyCat3RootCause(combinedLower)
            : categoryId === "self-identity"
              ? classifyCat5RootCause(combinedLower)
              : categoryId === "money-finance"
                ? classifyCat6RootCause(combinedLower)
        : null;

  return {
    categoryId,
    userAnswers: answers,
    matchedPrinciples: formatted,
    totalPrinciples: formatted.length,
    rootCauseSummary:
      categoryId === "habits-lifestyle" && rootCause
        ? {
            primary: CAT4_CAUSE_LABELS[rootCause.primary as Cat4RootCauseId],
            secondary: rootCause.secondary
              ? CAT4_CAUSE_LABELS[rootCause.secondary as Cat4RootCauseId]
              : undefined,
          }
        : categoryId === "mental-health" && rootCause
          ? {
              primary: CAT1_CAUSE_LABELS[rootCause.primary as Cat1RootCauseId],
              secondary: rootCause.secondary
                ? CAT1_CAUSE_LABELS[rootCause.secondary as Cat1RootCauseId]
                : undefined,
            }
          : categoryId === "work-purpose" && rootCause
            ? {
                primary: CAT2_CAUSE_LABELS[rootCause.primary as Cat2RootCauseId],
                secondary: rootCause.secondary
                  ? CAT2_CAUSE_LABELS[rootCause.secondary as Cat2RootCauseId]
                  : undefined,
              }
            : categoryId === "relationships" && rootCause
              ? {
                  primary: CAT3_CAUSE_LABELS[rootCause.primary as Cat3RootCauseId],
                  secondary: rootCause.secondary
                    ? CAT3_CAUSE_LABELS[rootCause.secondary as Cat3RootCauseId]
                    : undefined,
                }
            : categoryId === "self-identity" && rootCause
              ? {
                  primary: CAT5_CAUSE_LABELS[rootCause.primary as Cat5RootCauseId],
                  secondary: rootCause.secondary
                    ? CAT5_CAUSE_LABELS[rootCause.secondary as Cat5RootCauseId]
                    : undefined,
                }
            : categoryId === "money-finance" && rootCause
              ? {
                  primary: CAT6_CAUSE_LABELS[rootCause.primary as Cat6RootCauseId],
                  secondary: rootCause.secondary
                    ? CAT6_CAUSE_LABELS[rootCause.secondary as Cat6RootCauseId]
                    : undefined,
                }
          : undefined,
  };
};

export const getRagContextAsync = async (
  categoryId: string,
  answers: Record<string, string>,
  requestedTopN?: number
): Promise<RAGContext> => {
  const targetTopN = requestedTopN ?? INSIGHT_RAG_TOP_N;
  const principlesSource = await getWisdomPrinciplesLive();
  const matched = matchPrinciples(categoryId, answers, targetTopN, principlesSource);
  const formatted = formatPrinciples(matched, answers);
  const combinedLower = Object.values(answers).join(" ").toLowerCase();
  const rootCause =
    categoryId === "habits-lifestyle"
      ? classifyCat4RootCause(combinedLower)
      : categoryId === "mental-health"
        ? classifyCat1RootCause(combinedLower)
        : categoryId === "work-purpose"
          ? classifyCat2RootCause(combinedLower)
          : categoryId === "relationships"
            ? classifyCat3RootCause(combinedLower)
            : categoryId === "self-identity"
              ? classifyCat5RootCause(combinedLower)
              : categoryId === "money-finance"
                ? classifyCat6RootCause(combinedLower)
                : null;

  return {
    categoryId,
    userAnswers: answers,
    matchedPrinciples: formatted,
    totalPrinciples: formatted.length,
    rootCauseSummary:
      categoryId === "habits-lifestyle" && rootCause
        ? {
            primary: CAT4_CAUSE_LABELS[rootCause.primary as Cat4RootCauseId],
            secondary: rootCause.secondary
              ? CAT4_CAUSE_LABELS[rootCause.secondary as Cat4RootCauseId]
              : undefined,
          }
        : categoryId === "mental-health" && rootCause
          ? {
              primary: CAT1_CAUSE_LABELS[rootCause.primary as Cat1RootCauseId],
              secondary: rootCause.secondary
                ? CAT1_CAUSE_LABELS[rootCause.secondary as Cat1RootCauseId]
                : undefined,
            }
          : categoryId === "work-purpose" && rootCause
            ? {
                primary: CAT2_CAUSE_LABELS[rootCause.primary as Cat2RootCauseId],
                secondary: rootCause.secondary
                  ? CAT2_CAUSE_LABELS[rootCause.secondary as Cat2RootCauseId]
                  : undefined,
              }
            : categoryId === "relationships" && rootCause
              ? {
                  primary: CAT3_CAUSE_LABELS[rootCause.primary as Cat3RootCauseId],
                  secondary: rootCause.secondary
                    ? CAT3_CAUSE_LABELS[rootCause.secondary as Cat3RootCauseId]
                    : undefined,
                }
              : categoryId === "self-identity" && rootCause
                ? {
                    primary: CAT5_CAUSE_LABELS[rootCause.primary as Cat5RootCauseId],
                    secondary: rootCause.secondary
                      ? CAT5_CAUSE_LABELS[rootCause.secondary as Cat5RootCauseId]
                      : undefined,
                  }
                : categoryId === "money-finance" && rootCause
                  ? {
                      primary: CAT6_CAUSE_LABELS[rootCause.primary as Cat6RootCauseId],
                      secondary: rootCause.secondary
                        ? CAT6_CAUSE_LABELS[rootCause.secondary as Cat6RootCauseId]
                        : undefined,
                    }
                  : undefined,
  };
};

/**
 * Build user message for LLM with RAG context
 * (LLM will only present this beautifully, not interpret)
 */
export const buildLLMUserMessage = (ragContext: RAGContext): string => {
  const answersText = Object.entries(ragContext.userAnswers)
    .map(([key, value], index) => `Q${index + 1}: ${value}`)
    .join("\n\n");

  const principlesText = ragContext.matchedPrinciples
    .map(
      (p, i) => `
IDEA ${i + 1}: "${p.principleTitle}"

${p.description}

Why this matters:
${p.whyContext}

Plain language:
${p.simpleExplanation}

Try:
${p.microAction} (${p.timeToImplement})
`
    )
    .join("\n---\n");

  return `User's answers:
${answersText}

Ideas that may fit (titles only—do not cite sources):
${principlesText}

Present using their words. Do not name books or authors.`;
};
