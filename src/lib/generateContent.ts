import { createAdminClient } from "@/lib/supabase/admin";
import { geminiGenerateJSON } from "@/lib/gemini";
import { toDateString } from "@/lib/srs";

type GenCard = {
  term: string;
  reading: string | null;
  meaning: string;
  example: string;
  example_meaning: string;
};
type GenSentence = {
  text_target: string;
  reading: string | null;
  text_source: string;
};
type GenResult = { cards: GenCard[]; sentences: GenSentence[] };

export type PairResult = {
  pair: string;
  skipped: boolean;
  cards: number;
  sentences: number;
};

const DAILY_DECK_TITLE = "매일 새 단어";

const LEVEL_KO: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};
const LEVEL_DESC: Record<string, string> = {
  beginner: "아주 기초적이고 자주 쓰는 쉬운 단어와 짧은 문장",
  intermediate: "일상 회화 수준의 어휘와 조금 더 긴 문장",
  advanced: "관용구·뉘앙스·복잡한 구조가 포함된 고급 표현",
};
const levelKo = (l: string) => LEVEL_KO[l] ?? "초급";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          reading: { type: "string", nullable: true },
          meaning: { type: "string" },
          example: { type: "string" },
          example_meaning: { type: "string" },
        },
        required: ["term", "meaning", "example", "example_meaning"],
      },
    },
    sentences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text_target: { type: "string" },
          reading: { type: "string", nullable: true },
          text_source: { type: "string" },
        },
        required: ["text_target", "text_source"],
      },
    },
  },
  required: ["cards", "sentences"],
};

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Generates and stores a fresh batch of cards + sentences for one
 * language pair. Skips pairs that already have content for today
 * (unless `force` is set).
 */
export async function generateDailyContent(opts: {
  sourceLang: string;
  targetLang: string;
  level?: string;
  cardCount?: number;
  sentenceCount?: number;
  force?: boolean;
}): Promise<PairResult> {
  const {
    sourceLang,
    targetLang,
    level = "beginner",
    cardCount = 4,
    sentenceCount = 3,
    force = false,
  } = opts;
  const pair = `${sourceLang}->${targetLang}`;
  const admin = createAdminClient();
  const today = toDateString(new Date());

  if (!force) {
    const { count } = await admin
      .from("sentences")
      .select("id", { count: "exact", head: true })
      .eq("source_lang", sourceLang)
      .eq("target_lang", targetLang)
      .eq("level", level)
      .eq("for_date", today);
    if ((count ?? 0) > 0) {
      return { pair, skipped: true, cards: 0, sentences: 0 };
    }
  }

  // Existing items to avoid duplicates.
  const { data: decks } = await admin
    .from("decks")
    .select("id")
    .eq("source_lang", sourceLang)
    .eq("target_lang", targetLang);
  const deckIds = (decks ?? []).map((d) => d.id);

  let existingTerms: string[] = [];
  if (deckIds.length) {
    const { data: ec } = await admin
      .from("cards")
      .select("term")
      .in("deck_id", deckIds)
      .order("created_at", { ascending: false })
      .limit(150);
    existingTerms = (ec ?? []).map((c) => c.term as string);
  }
  const { data: es } = await admin
    .from("sentences")
    .select("text_target")
    .eq("source_lang", sourceLang)
    .eq("target_lang", targetLang)
    .order("created_at", { ascending: false })
    .limit(150);
  const existingSentences = (es ?? []).map((s) => s.text_target as string);

  // Resolve language display names from the DB so any language in the
  // `languages` table works without code changes.
  const { data: langRows } = await admin
    .from("languages")
    .select("code, name_native");
  const nameOf = (code: string) =>
    (langRows ?? []).find((l) => l.code === code)?.name_native ?? code;
  const targetName = nameOf(targetLang);
  const sourceName = nameOf(sourceLang);
  const avoid = [...existingTerms, ...existingSentences].slice(0, 80).join(" | ");

  const prompt = `You create daily language-learning content.
Learner's native language: ${sourceName} (${sourceLang}).
Target language being learned: ${targetName} (${targetLang}).
난이도(difficulty): ${levelKo(level)} 수준 — ${LEVEL_DESC[level] ?? LEVEL_DESC.beginner}.

Generate exactly ${cardCount} vocabulary cards and ${sentenceCount} short, practical everyday example sentences at this difficulty level.

Card fields:
- "term": a common, useful word or expression written in ${targetName}.
- "reading": pronunciation guide (romaji for Japanese, pinyin for Chinese, etc.); use null when unnecessary (e.g. English).
- "meaning": the meaning written in ${sourceName}.
- "example": a natural example sentence in ${targetName}.
- "example_meaning": that sentence translated into ${sourceName}.

Sentence fields:
- "text_target": a useful everyday sentence in ${targetName}.
- "reading": pronunciation guide or null.
- "text_source": the translation in ${sourceName}.

Keep everything at the difficulty level above, natural, and varied across topics.
Do NOT repeat any of these already-used items: ${avoid || "(none yet)"}`;

  const result = await geminiGenerateJSON<GenResult>(prompt, RESPONSE_SCHEMA);

  const termSet = new Set(existingTerms.map(norm));
  const sentSet = new Set(existingSentences.map(norm));
  const newCards = (result.cards ?? []).filter(
    (c) => c.term && !termSet.has(norm(c.term)),
  );
  const newSentences = (result.sentences ?? []).filter(
    (s) => s.text_target && !sentSet.has(norm(s.text_target)),
  );

  // Find or create the per-pair, per-level "daily" deck.
  const deckTitle = `${DAILY_DECK_TITLE} (${levelKo(level)})`;
  let deckId: string | null = null;
  const { data: existingDeck } = await admin
    .from("decks")
    .select("id")
    .eq("title", deckTitle)
    .eq("source_lang", sourceLang)
    .eq("target_lang", targetLang)
    .eq("level", level)
    .maybeSingle();
  if (existingDeck) {
    deckId = existingDeck.id as string;
  } else {
    const { data: created } = await admin
      .from("decks")
      .insert({
        title: deckTitle,
        description: "매일 AI가 추가하는 새 단어",
        source_lang: sourceLang,
        target_lang: targetLang,
        level,
        sort_order: 99,
      })
      .select("id")
      .maybeSingle();
    deckId = created?.id ?? null;
  }

  let insertedCards = 0;
  let insertedSentences = 0;

  if (deckId && newCards.length) {
    const rows = newCards.map((c, i) => ({
      deck_id: deckId,
      term: c.term,
      reading: c.reading ?? null,
      meaning: c.meaning,
      example: c.example ?? null,
      example_meaning: c.example_meaning ?? null,
      sort_order: 1000 + i,
      origin: "ai",
    }));
    const { error } = await admin.from("cards").insert(rows);
    if (!error) insertedCards = rows.length;
  }

  if (newSentences.length) {
    const { data: maxRow } = await admin
      .from("sentences")
      .select("day_index")
      .eq("source_lang", sourceLang)
      .eq("target_lang", targetLang)
      .order("day_index", { ascending: false })
      .limit(1)
      .maybeSingle();
    let nextIdx = (maxRow?.day_index ?? 0) + 1;
    const rows = newSentences.map((s) => ({
      source_lang: sourceLang,
      target_lang: targetLang,
      level,
      text_target: s.text_target,
      reading: s.reading ?? null,
      text_source: s.text_source,
      day_index: nextIdx++,
      for_date: today,
      origin: "ai",
    }));
    const { error } = await admin.from("sentences").insert(rows);
    if (!error) insertedSentences = rows.length;
  }

  return {
    pair,
    skipped: false,
    cards: insertedCards,
    sentences: insertedSentences,
  };
}
