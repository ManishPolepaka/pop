/**
 * Local pattern extraction from diagnostic answers
 */
export const extractPatterns = (
  categoryId: number,
  answers: string[]
): {
  keywords: string[];
  themes: string[];
  sentiment: "positive" | "neutral" | "negative";
  intensity: "low" | "medium" | "high";
} => {
  const allText = answers.join(" ").toLowerCase();

  // Emotional keywords for each category
  const emotionalKeywords: Record<number, string[]> = {
    1: ["anxious", "overwhelmed", "stressed", "calm", "peace", "numb", "disconnected"],
    2: ["doubt", "worthy", "valued", "confident", "ashamed", "proud", "enough"],
    3: ["stuck", "direction", "forward", "uncertain", "clarity", "purpose"],
    4: ["overthink", "decisive", "confident", "second-guess", "clear", "confused"],
    5: ["tired", "energy", "sleep", "routine", "habit", "structured", "chaotic"],
    6: ["alone", "supported", "connected", "safe", "vulnerable", "isolated"],
    7: ["meaning", "purpose", "value", "fulfilled", "empty", "authentic"],
  };

  // Extract keywords
  const relevantKeywords = emotionalKeywords[categoryId] || [];
  const foundKeywords = relevantKeywords.filter((keyword) =>
    allText.includes(keyword)
  );

  // Sentiment analysis (simple)
  const positiveWords = [
    "good",
    "great",
    "happy",
    "well",
    "supported",
    "calm",
    "clear",
    "confident",
    "proud",
  ];
  const negativeWords = [
    "bad",
    "anxious",
    "sad",
    "overwhelmed",
    "stuck",
    "lost",
    "alone",
    "empty",
    "struggling",
  ];

  const positiveCount = positiveWords.filter((w) => allText.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => allText.includes(w)).length;

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";

  // Intensity (based on word count and emotional language)
  const hasIntenseWords =
    allText.includes("very") ||
    allText.includes("always") ||
    allText.includes("never") ||
    allText.includes("extremely");
  const wordCount = allText.split(" ").length;
  let intensity: "low" | "medium" | "high" = "medium";
  if (wordCount < 50 || !hasIntenseWords) intensity = "low";
  if (wordCount > 100 && hasIntenseWords) intensity = "high";

  // Theme extraction
  const themes = deriveThemes(categoryId, foundKeywords);

  return {
    keywords: foundKeywords,
    themes,
    sentiment,
    intensity,
  };
};

/**
 * Derive high-level themes based on category and keywords
 */
const deriveThemes = (categoryId: number, keywords: string[]): string[] => {
  const themeMap: Record<number, Record<string, string[]>> = {
    1: {
      "Emotional Reactivity": ["anxious", "stressed", "overwhelmed"],
      "Emotional Awareness": ["understand", "confused", "recognize"],
      "Emotional Regulation": ["calm", "numb", "peace"],
    },
    2: {
      "Self-Doubt": ["doubt", "question", "uncertain"],
      "Self-Worth": ["worthy", "valued", "enough", "proud"],
      "Inner Critic": ["harsh", "hard on", "shame"],
    },
    3: {
      "Clarity on Direction": ["clear", "clarity", "direction", "purpose"],
      "Stuck or Uncertain": ["stuck", "confused", "lost", "uncertain"],
      "Alignment": ["aligned", "authenticity", "ownership"],
    },
    4: {
      "Overthinking": ["overthink", "second-guess", "analyze"],
      "Indecision": ["stuck", "confused", "unsure"],
      "Decisive": ["clear", "confident", "quick"],
    },
    5: {
      "Low Energy": ["tired", "exhausted", "drained"],
      "Healthy Habits": ["structured", "routine", "consistent"],
      "Sleep Issues": ["poor sleep", "insomnia", "restless"],
    },
    6: {
      "Isolation": ["alone", "isolated", "disconnected"],
      "Strong Support": ["supported", "safe", "connected"],
      "Vulnerability": ["vulnerable", "open", "safe"],
    },
    7: {
      "Seeking Meaning": ["meaning", "purpose", "why"],
      "Value Alignment": ["aligned", "authentic", "values"],
      "Fulfillment": ["fulfilled", "empty", "complete"],
    },
  };

  const categoryThemes = themeMap[categoryId] || {};
  const detectedThemes: string[] = [];

  for (const [theme, themeKeywords] of Object.entries(categoryThemes)) {
    const matchCount = themeKeywords.filter((k) => keywords.includes(k)).length;
    if (matchCount > 0) {
      detectedThemes.push(theme);
    }
  }

  return detectedThemes.slice(0, 3);
};

/**
 * Build Claude prompt for insight generation
 */
export const buildClaudePrompt = (
  categoryId: number,
  categoryTitle: string,
  questions: string[],
  answers: string[],
  patterns: ReturnType<typeof extractPatterns>
): string => {
  const questionAnswerPairs = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(skipped)"}`)
    .join("\n\n");

  return `You are a compassionate psychological insights generator. Your role is to help people understand themselves better, NOT to diagnose or prescribe.

CATEGORY: ${categoryTitle}

USER'S ANSWERS:
${questionAnswerPairs}

DETECTED PATTERNS:
- Keywords: ${patterns.keywords.join(", ")}
- Themes: ${patterns.themes.join(", ")}
- Overall Sentiment: ${patterns.sentiment}
- Intensity: ${patterns.intensity}

GENERATE INSIGHTS:
Please provide a personal, compassionate response with exactly these 4 sections:

🔍 WHAT I HEARD (Validating what they said, showing you listened)
- 2-3 sentences reflecting back the key things they shared
- Use their own words where possible
- Validate their experience

⚠️ THE PATTERN (What you notice repeating)
- 2-3 sentences about patterns across their answers
- Name the cycle or trend
- Be specific, not vague

💡 WHAT THIS MEANS (Deeper insight)
- 2-3 sentences about what this pattern suggests
- Frame positively (e.g., "it means you care" not "you're broken")
- Avoid clinical language

🎯 WHAT MIGHT HELP (Actionable next steps)
- 3 specific, practical suggestions they could explore
- Format as bullet points
- Focus on small, doable things, not big life changes

TONE: Warm, specific, humble, non-judgmental. Like a good friend who understands.
LENGTH: Keep it concise and readable (not overwhelming).
IMPORTANT: Never diagnose or prescribe. Never claim certainty. Use "might," "could," "seems," "notice."`;
};

/**
 * Parse Claude response into structured format
 */
export const parseClaudeResponse = (
  response: string
): {
  whatHeard: string;
  commonSenseReframe: string;
  theBlindSpot: string;
  thePattern: string;
  whatItMeans: string;
  whatMightHelp: string;
} => {
  const sections = {
    whatHeard: "",
    commonSenseReframe: "",
    theBlindSpot: "",
    thePattern: "",
    whatItMeans: "",
    whatMightHelp: "",
  };

  // Extract sections using regex with emoji markers
  const whatHeardMatch = response.match(
    /🔍\s*WHAT I HEARD[^\n]*\n([\s\S]*?)(?=🧠|$)/
  );
  if (whatHeardMatch) sections.whatHeard = whatHeardMatch[1].trim();

  const commonSenseMatch = response.match(
    /🧠\s*COMMON SENSE REFRAME[^\n]*\n([\s\S]*?)(?=⚠️|$)/
  );
  if (commonSenseMatch) sections.commonSenseReframe = commonSenseMatch[1].trim();

  const blindSpotMatch = response.match(
    /⚠️\s*THE BLIND SPOT[^\n]*\n([\s\S]*?)(?=🔄|$)/
  );
  if (blindSpotMatch) sections.theBlindSpot = blindSpotMatch[1].trim();

  const patternMatch = response.match(
    /🔄\s*THE PATTERN[^\n]*\n([\s\S]*?)(?=💡|$)/
  );
  if (patternMatch) sections.thePattern = patternMatch[1].trim();

  const meaningMatch = response.match(
    /💡\s*WHAT THIS MEANS[^\n]*\n([\s\S]*?)(?=🎯|$)/
  );
  if (meaningMatch) sections.whatItMeans = meaningMatch[1].trim();

  const helpMatch = response.match(/🎯\s*WHAT MIGHT HELP[^\n]*\n([\s\S]*?)$/);
  if (helpMatch) sections.whatMightHelp = helpMatch[1].trim();

  return sections;
};
/**
 * Convert parsed sections into AIInsight format
 */
export const formatAsAIInsight = (sections: {
  whatHeard: string;
  commonSenseReframe: string;
  theBlindSpot: string;
  thePattern: string;
  whatItMeans: string;
  whatMightHelp: string;
}) => {
  return {
    heard: sections.whatHeard,
    commonSenseReframe: sections.commonSenseReframe,
    blindSpot: sections.theBlindSpot,
    pattern: sections.thePattern,
    meaning: sections.whatItMeans,
    help: sections.whatMightHelp,
  };
};