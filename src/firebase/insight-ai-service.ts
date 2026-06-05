/**
 * Insight AI Generation Service
 * 
 * Calls OpenAI with category-specific prompts
 * Extracts patterns + generates clarifying questions from user answers
 * Zero hallucination by design (extraction-only prompts)
 */

import { getInsightPrompt, buildUserMessage } from "@/lib/insight-generation-prompts";

async function safeReadOpenAIJson(response: Response): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  const text = await response.text();
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, message: text.trim().slice(0, 280) || "Invalid JSON from API" };
  }
}

export interface InsightGenerationResult {
  categoryId: string;
  corePatterns: string[];
  deeperLook: string[];
  rawResponse: string;
  error?: string;
}

/**
 * Generate AI insights from user answers
 * 
 * @param categoryId - The insight category (e.g., "mental-health")
 * @param answers - User's answers to the 5 questions
 * @returns Insight generation result with patterns and questions
 */
export const generateInsight = async (
  categoryId: string,
  answers: Record<string, string>
): Promise<InsightGenerationResult> => {
  try {
    const prompt = getInsightPrompt(categoryId);
    if (!prompt) {
      return {
        categoryId,
        corePatterns: [],
        deeperLook: [],
        rawResponse: "",
        error: `Category not found: ${categoryId}`,
      };
    }

    const userMessage = buildUserMessage(categoryId, answers);
    if (!userMessage) {
      return {
        categoryId,
        corePatterns: [],
        deeperLook: [],
        rawResponse: "",
        error: "Failed to build user message",
      };
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return {
        categoryId,
        corePatterns: [],
        deeperLook: [],
        rawResponse: "",
        error: "OpenAI API key not configured",
      };
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0, // No creativity - pure extraction
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: prompt.systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const parsed = await safeReadOpenAIJson(response);
      const errMsg =
        parsed.ok === false
          ? parsed.message
          : (parsed.data as { error?: { message?: string } })?.error?.message || "OpenAI API error";
      return {
        categoryId,
        corePatterns: [],
        deeperLook: [],
        rawResponse: "",
        error: errMsg,
      };
    }

    const parsedOk = await safeReadOpenAIJson(response);
    if (!parsedOk.ok) {
      return {
        categoryId,
        corePatterns: [],
        deeperLook: [],
        rawResponse: "",
        error: parsedOk.message,
      };
    }
    const data = parsedOk.data as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content || "";

    // Parse response into patterns and questions
    const { patterns, questions } = parseInsightResponse(content);

    return {
      categoryId,
      corePatterns: patterns,
      deeperLook: questions,
      rawResponse: content,
    };
  } catch (err) {
    return {
      categoryId,
      corePatterns: [],
      deeperLook: [],
      rawResponse: "",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

/**
 * Parse AI response into structured patterns and questions
 */
const parseInsightResponse = (
  response: string
): { patterns: string[]; questions: string[] } => {
  const patterns: string[] = [];
  const questions: string[] = [];

  // Split by section
  const lines = response.split("\n").filter((line) => line.trim());

  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect sections
    if (trimmed.includes("CORE PATTERNS")) {
      currentSection = "patterns";
      continue;
    }
    if (trimmed.includes("DEEPER LOOK")) {
      currentSection = "questions";
      continue;
    }

    // Skip headers and empty lines
    if (!trimmed || trimmed.startsWith("---") || trimmed.includes("=")) {
      continue;
    }

    // Parse items (numbered or bulleted)
    if (currentSection === "patterns") {
      // Match numbered items: "1. Pattern - "quote""
      const match = trimmed.match(/^\d+\.\s+(.+)$/);
      if (match) {
        patterns.push(match[1].trim());
      }
    } else if (currentSection === "questions") {
      // Match bulleted items: "- Question"
      if (trimmed.startsWith("-")) {
        questions.push(trimmed.substring(1).trim());
      }
    }
  }

  return { patterns, questions };
};

/**
 * Check if OpenAI API key is configured
 */
export const isOpenAIConfigured = (): boolean => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};

// ============================================================
// RAG + LLM PRESENTATION FLOW (New approach)
// ============================================================

export interface RAGPresentationResult {
  categoryId: string;
  userAnswers: Record<string, string>;
  matchedPrinciples: Array<{
    id: string;
    bookTitle: string;
    author: string;
    principleTitle: string;
    description: string;
    whyContext: string;
    userAnchors: string[];
    coreQuote?: string;
    simpleExplanation: string;
    microAction: string;
    timeToImplement: string;
  }>;
  formattedInsight: string;
  error?: string;
}

/**
 * Generate insight using RAG (knowledge base matching) + LLM (presentation formatting)
 *
 * Flow:
 * 1. RAG: Match user answers to principles from wisdom knowledge base
 * 2. LLM: Format matched principles beautifully (presentation only, no interpretation)
 *
 * @param categoryId - The insight category
 * @param answers - User's answers to the 5 questions
 * @returns Insight with matched principles + LLM formatted presentation
 */
export const generateRAGInsight = async (
  categoryId: string,
  answers: Record<string, string>
): Promise<RAGPresentationResult> => {
  try {
    // Import RAG service dynamically to avoid circular dependencies
    const { getRagContextAsync, buildLLMUserMessage } = await import("@/lib/wisdom-rag-service");
    const { RAG_SYSTEM_PROMPT, buildRAGPresentationMessage } = await import(
      "@/lib/insight-generation-prompts"
    );

    // Step 1: Use RAG to match principles (no LLM call needed)
    const ragContext = await getRagContextAsync(categoryId, answers);

    if (!ragContext || ragContext.totalPrinciples === 0) {
      return {
        categoryId,
        userAnswers: answers,
        matchedPrinciples: [],
        formattedInsight: "",
        error: "No matching principles found for this category",
      };
    }

    // Step 2: Check if LLM is configured
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      // Return RAG results without LLM formatting
      return {
        categoryId,
        userAnswers: answers,
        matchedPrinciples: ragContext.matchedPrinciples,
        formattedInsight: buildRAGPresentationMessage(
          categoryId,
          answers,
          ragContext.rootCauseSummary,
          ragContext.matchedPrinciples
        ),
        error: "LLM not configured, displaying raw principles",
      };
    }

    // Step 3: Use LLM ONLY to format the principles beautifully
    const userMessage = buildRAGPresentationMessage(
      categoryId,
      answers,
      ragContext.rootCauseSummary,
      ragContext.matchedPrinciples
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.42,
        max_tokens: 1500,
        messages: [
          {
            role: "system",
            content: RAG_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const parsed = await safeReadOpenAIJson(response);
      const errMsg =
        parsed.ok === false
          ? parsed.message
          : (parsed.data as { error?: { message?: string } })?.error?.message || "OpenAI API error";
      return {
        categoryId,
        userAnswers: answers,
        matchedPrinciples: ragContext.matchedPrinciples,
        formattedInsight: buildRAGPresentationMessage(
          categoryId,
          answers,
          ragContext.rootCauseSummary,
          ragContext.matchedPrinciples
        ),
        error: `LLM error (using raw format): ${errMsg}`,
      };
    }

    const parsedBody = await safeReadOpenAIJson(response);
    if (!parsedBody.ok) {
      return {
        categoryId,
        userAnswers: answers,
        matchedPrinciples: ragContext.matchedPrinciples,
        formattedInsight: buildRAGPresentationMessage(
          categoryId,
          answers,
          ragContext.rootCauseSummary,
          ragContext.matchedPrinciples
        ),
        error: `Invalid response from language model: ${parsedBody.message}`,
      };
    }
    const data = parsedBody.data as { choices?: Array<{ message?: { content?: string } }> };
    const formattedInsight = data.choices?.[0]?.message?.content || "";

    return {
      categoryId,
      userAnswers: answers,
      matchedPrinciples: ragContext.matchedPrinciples,
      formattedInsight,
    };
  } catch (err) {
    return {
      categoryId,
      userAnswers: answers,
      matchedPrinciples: [],
      formattedInsight: "",
      error: err instanceof Error ? err.message : "Unknown error generating RAG insight",
    };
  }
};
