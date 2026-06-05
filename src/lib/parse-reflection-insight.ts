/**
 * Parses LLM reflection output that follows the structured markdown contract
 * (## What we're seeing, ## Ideas that fit, ### cards with Fit + Try this week).
 */

export interface ParsedReflectionCard {
  title: string;
  fitLabel: "strong" | "helpful angle";
  whyThisMatters: string;
  /** Connection / nuance paragraphs between Fit and Try */
  connection: string;
  tryThisWeek: string;
}

export interface ParsedReflection {
  thread: string;
  cards: ParsedReflectionCard[];
  /** True if markdown sections were missing and we fell back */
  usedFallback: boolean;
}

function normalizeFit(s: string): "strong" | "helpful angle" {
  const x = s.toLowerCase().trim();
  if (x.includes("helpful")) return "helpful angle";
  return "strong";
}

/**
 * Extract thread from ## What we're seeing … until ## Ideas that fit (or end).
 */
function extractThread(normalized: string): string {
  const m = normalized.match(
    /##\s*What[^\n]*seeing\s*\n([\s\S]*?)(?=\n##\s*Ideas\s*that\s*fit\b|$)/i
  );
  if (m) return m[1].trim();

  /** Legacy: **THE THREAD:** block */
  const legacy = normalized.match(
    /\*\*THE THREAD:\*\*\s*\n?([\s\S]*?)(?=\n---|\n##\s*|\n\*\*[A-Z][^*]+:\*\*|$)/i
  );
  if (legacy) return legacy[1].trim();

  return "";
}

/**
 * Split Ideas section into ### chunks.
 */
function extractCards(ideasSection: string): ParsedReflectionCard[] {
  const cards: ParsedReflectionCard[] = [];
  const trimmed = ideasSection.trim();
  if (!trimmed) return cards;

  const chunks = trimmed.split(/\n(?=###\s+)/);
  for (const chunk of chunks) {
    const m = chunk.match(/^###\s+(.+?)\n([\s\S]*)$/);
    if (!m) continue;
    const title = m[1].trim();
    let block = m[2].trim();

    const fitM = block.match(/\*\*Fit:\*\*\s*\*?\*?(strong|helpful\s*angle)\*?\*?/i);
    const fitLabel = fitM ? normalizeFit(fitM[1]) : "helpful angle";

    let tryThisWeek = "";
    const tryM = block.match(/\*\*Try\s*this\s*week:\*\*\s*([\s\S]*)$/i);
    if (tryM) {
      tryThisWeek = tryM[1].trim();
      block = block.slice(0, tryM.index).trim();
    }

    let whyThisMatters = "";
    const whyM = block.match(/\*\*Why\s*this\s*matters:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i);
    if (whyM) {
      whyThisMatters = whyM[1].trim();
      block = block.replace(/\*\*Why\s*this\s*matters:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i, "").trim();
    }

    block = block.replace(/\*\*Fit:\*\*\s*\*?\*?(?:strong|helpful\s*angle)\*?\*?\s*/i, "").trim();

    const connection = block.trim();

    cards.push({ title, fitLabel, whyThisMatters, connection, tryThisWeek });
  }
  return cards;
}

export function parseReflectionInsight(raw: string): ParsedReflection {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return { thread: "", cards: [], usedFallback: true };
  }

  let thread = extractThread(normalized);

  let ideasSection = "";
  const ideasMatch = normalized.match(/##\s*Ideas\s*that\s*fit\s*\n([\s\S]*)$/i);
  if (ideasMatch) ideasSection = ideasMatch[1];

  let cards = extractCards(ideasSection);

  /** Legacy: principle sections titled with **PRINCIPLE 1:** or principle name only */
  if (cards.length === 0 && normalized.length > 0) {
    const legacyIdeas = normalized.split(/\n(?=\*\*PRINCIPLE\s*\d+)/i);
    if (legacyIdeas.length > 1) {
      for (let i = 1; i < legacyIdeas.length; i++) {
        const piece = legacyIdeas[i];
        const titleM = piece.match(/^\*\*PRINCIPLE\s*\d+:\s*["']?([^"'\n]+)["']?\*\*/i);
        const fitM = piece.match(/\*\*Fit:\*\*\s*(strong|helpful\s*angle)/i);
        const tryM = piece.match(/\*\*Try\s*this\s*week:\*\*\s*([\s\S]*?)(?=\n\*\*PRINCIPLE|\n##|$)/i);
        let body = piece;
        if (titleM) {
          const title = titleM[1].trim();
          body = piece.replace(/^\*\*PRINCIPLE\s*\d+:\s*[^*]+\*\*\s*/i, "");
          const fitLabel = fitM ? normalizeFit(fitM[1]) : "helpful angle";
          let tryThisWeek = tryM ? tryM[1].trim() : "";
          body = body.replace(/\*\*Fit:\*\*\s*(?:strong|helpful\s*angle)\s*/i, "");
          body = body.replace(/\*\*Try\s*this\s*week:\*\*\s*[\s\S]*$/i, "").trim();
          cards.push({
            title,
            fitLabel,
            whyThisMatters: "",
            connection: body,
            tryThisWeek,
          });
        }
      }
    }
  }

  const usedFallback =
    normalized.length > 0 && thread.trim().length === 0 && cards.length === 0;

  return { thread, cards, usedFallback };
}

/** First sentence of the thread for a skimmable hero line. */
export function insightHeroLine(thread: string): string {
  const t = thread.trim();
  if (!t) return "";
  const match = t.match(/^[\s\S]*?[.!?](?:\s|$)/);
  return (match ? match[0] : t.split(/\n/)[0] ?? t).trim();
}

/** Prefer the first strong-fit card's micro-action; otherwise the first try line. */
export function pickStartHereTry(cards: ParsedReflectionCard[]): string {
  const strong = cards.find((c) => c.fitLabel === "strong" && c.tryThisWeek.trim());
  if (strong) return strong.tryThisWeek.trim();
  const any = cards.find((c) => c.tryThisWeek.trim());
  return any?.tryThisWeek.trim() ?? "";
}
