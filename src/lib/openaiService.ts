/**
 * OpenAI Service - Generates insights using GPT-4o Mini
 * Cost: ~$0.002 per insight
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InsightGenerationRequest {
  categoryId: number;
  categoryTitle: string;
  questions: string[];
  answers: string[];
  keywords: string[];
  themes: string[];
  sentiment: string;
  intensity: string;
}

export const generateInsightWithOpenAI = async (
  request: InsightGenerationRequest
): Promise<{
  heard: string;
  commonSenseReframe: string;
  blindSpot: string;
  pattern: string;
  meaning: string;
  help: string;
} | null> => {
  try {
    // Build the messages for OpenAI
    const questionAnswerPairs = request.questions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${request.answers[i] || "(skipped)"}`)
      .join("\n\n");

    const systemPrompt = `You are a deeply empathetic psychological insights generator. Your job is NOT to diagnose, prescribe, or fix—it's to help people see themselves more clearly.

Your insights should create "aha moments" where people recognize patterns they weren't consciously aware of. You generate genuine psychological depth, not summaries of what they already told you.`;

    const userPrompt = `Analyze these answers about "${request.categoryTitle}" and generate insights that reveal what the person doesn't already know about themselves.

ANSWERS:
${questionAnswerPairs}

DETECTED PATTERNS:
- Keywords: ${request.keywords.join(", ")}
- Themes: ${request.themes.join(", ")}
- Overall Sentiment: ${request.sentiment}
- Intensity: ${request.intensity}

GENERATE INSIGHTS using this EXACT format (6 sections):

🔍 WHAT I HEARD
[2-3 sentences] Reflect back what they said, validating their surface-level concern. Use their own language.

🧠 COMMON SENSE REFRAME
[2-3 sentences] Translate their surface problem to the underlying mechanism. Example: "You think you're addicted to reels, but you're actually addicted to the dopamine hit. The real question is: what need does that dopamine fulfill?"

⚠️ THE BLIND SPOT
[2-3 sentences] Identify what they're NOT seeing about themselves. Look for:
- Contradictions between what they say they want and what they actually do
- Unexamined assumptions they're making
- Patterns they're blind to
- What they're avoiding acknowledging

🔄 THE PATTERN
[2-3 sentences] Name the psychological patterns you notice:
- Recurring themes (avoidance, shame cycles, perfectionism, etc.)
- How different answers connect
- What these patterns might reveal about their values or fears

💡 WHAT THIS MEANS
[3-4 sentences] Deeper interpretation using psychological frameworks:
- Explain the psychology BEHIND the pattern
- Reframe their struggle as a sign of something they care about (turn weakness into revealed strength)
- What this pattern might be protecting them from, or what it's trying to achieve
- Use frameworks like: guilt cycles, avoidance loops, shame-driven behavior, perfectionism as protection, etc.

🎯 WHAT MIGHT HELP
[3-4 exploratory questions] Instead of tips, ask deepening questions:
- "What would happen if...?"
- "What does this behavior give you that you might not want to lose?"
- "What would self-compassion look like here?"
- Questions that lead to discovery, not prescriptions

CRITICAL GUIDELINES:
- Never just summarize their answers back
- Create genuine psychological insight they didn't have before
- Use "might," "could," "seems" (avoid certainty)
- Be warm, specific, and humble—like a good friend who truly listens
- Find the deeper need or fear beneath their stated problem
- Reveal strengths hidden in their struggles
- Make them think, "Oh! I never saw it that way before"`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ] as OpenAIMessage[],
        max_tokens: 800,
        temperature: 0.7, // Balanced creativity
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // Parse the response using the updated parser
    const { parseClaudeResponse } = await import("./insightAnalysis");
    const parsed = parseClaudeResponse(aiResponse);

    return {
      heard: parsed.whatHeard,
      commonSenseReframe: parsed.commonSenseReframe,
      blindSpot: parsed.theBlindSpot,
      pattern: parsed.thePattern,
      meaning: parsed.whatItMeans,
      help: parsed.whatMightHelp,
    };
  } catch (error) {
    console.error("Error generating insight with OpenAI:", error);
    return null;
  }
};

/**
 * Generate insight with fallback to local analysis if API fails
 */
export const generateInsightWithFallback = async (
  request: InsightGenerationRequest
): Promise<{
  heard: string;
  commonSenseReframe: string;
  blindSpot: string;
  pattern: string;
  meaning: string;
  help: string;
  isAI: boolean;
}> => {
  // Try OpenAI first
  const aiInsight = await generateInsightWithOpenAI(request);

  if (aiInsight) {
    return {
      ...aiInsight,
      isAI: true,
    };
  }

  // Fallback to local generation
  console.warn("OpenAI API failed, using local fallback");
  return {
    heard:
      "You shared reflections about " +
      (request.themes.length > 0 ? request.themes.join(", ") : "this area") +
      ". The themes that came through were focused on personal growth and understanding.",
    commonSenseReframe:
      "Your answers reveal that beneath the surface, you're navigating something deeper than what first meets the eye.",
    blindSpot:
      "One thing to consider: how might your perspective on this situation be shaped by beliefs you haven't fully examined?",
    pattern:
      "A consistent thread in your answers is " +
      (request.sentiment === "positive"
        ? "a positive, constructive approach"
        : request.sentiment === "negative"
          ? "some challenges or concerns"
          : "a balanced perspective") +
      " paired with " +
      (request.intensity === "high"
        ? "deep reflection"
        : "thoughtful consideration") +
      " on these topics.",
    meaning:
      "This pattern suggests you're actively engaged in self-awareness. The way you think about " +
      request.categoryTitle.toLowerCase() +
      " reveals what matters to you and where growth might unfold.",
    help:
      "What would change if you approached this with curiosity instead of judgment? What does this struggle reveal about what you care deeply about? What small shift could you explore this week?",
    isAI: false,
  };
};
