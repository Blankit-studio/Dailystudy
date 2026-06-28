import { createClient } from "@/lib/supabase/server";
import { toDateString } from "./srs";
import { computeCurrentStreak, computeLongestStreak } from "./stats";
import type {
  Language,
  Profile,
  Sentence,
  StudyCard,
  StudyLog,
} from "./types";

const NEW_CARDS_PER_SESSION = 10;
const MAX_SESSION_CARDS = 30;

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the current user's profile, creating a default one if needed. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      display_name: user.email?.split("@")[0] ?? null,
    })
    .select("*")
    .maybeSingle();

  return (created as Profile) ?? null;
}

export async function getLanguages(): Promise<Language[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("languages")
    .select("*")
    .order("code");
  return (data as Language[]) ?? [];
}

export function languageLabel(languages: Language[], code: string): string {
  const lang = languages.find((l) => l.code === code);
  if (!lang) return code;
  return `${lang.flag ?? ""} ${lang.name_ko}`.trim();
}

/**
 * Builds the study queue for the user's active language pair: all due
 * cards first, then a capped number of brand-new cards.
 */
export async function getStudyQueue(profile: Profile): Promise<StudyCard[]> {
  const supabase = await createClient();

  const { data: decks } = await supabase
    .from("decks")
    .select("id")
    .eq("source_lang", profile.learning_source_lang)
    .eq("target_lang", profile.learning_target_lang);

  const deckIds = (decks ?? []).map((d) => d.id);
  if (deckIds.length === 0) return [];

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .in("deck_id", deckIds)
    .order("sort_order");

  if (!cards || cards.length === 0) return [];

  const { data: progress } = await supabase
    .from("user_cards")
    .select("*")
    .eq("user_id", profile.id)
    .in(
      "card_id",
      cards.map((c) => c.id),
    );

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.card_id as string, p]),
  );
  const today = toDateString(new Date());

  const due: StudyCard[] = [];
  const fresh: StudyCard[] = [];

  for (const card of cards) {
    const p = progressMap.get(card.id);
    if (!p) {
      fresh.push({ ...card, progress: null });
    } else if ((p.due_date as string) <= today) {
      due.push({
        ...card,
        progress: {
          ease: p.ease,
          interval_days: p.interval_days,
          repetitions: p.repetitions,
          due_date: p.due_date,
          status: p.status,
        },
      });
    }
  }

  return [...due, ...fresh.slice(0, NEW_CARDS_PER_SESSION)].slice(
    0,
    MAX_SESSION_CARDS,
  );
}

/** Counts how many cards are due (or new) for the user's active pair. */
export async function getDueSummary(profile: Profile): Promise<{
  due: number;
  newCards: number;
  totalLearned: number;
}> {
  const supabase = await createClient();

  const { data: decks } = await supabase
    .from("decks")
    .select("id")
    .eq("source_lang", profile.learning_source_lang)
    .eq("target_lang", profile.learning_target_lang);

  const deckIds = (decks ?? []).map((d) => d.id);
  if (deckIds.length === 0) return { due: 0, newCards: 0, totalLearned: 0 };

  const { data: cards } = await supabase
    .from("cards")
    .select("id")
    .in("deck_id", deckIds);

  const cardIds = (cards ?? []).map((c) => c.id);
  if (cardIds.length === 0) return { due: 0, newCards: 0, totalLearned: 0 };

  const { data: progress } = await supabase
    .from("user_cards")
    .select("card_id, due_date, status")
    .eq("user_id", profile.id)
    .in("card_id", cardIds);

  const today = toDateString(new Date());
  const seen = new Set((progress ?? []).map((p) => p.card_id as string));
  const due = (progress ?? []).filter(
    (p) => (p.due_date as string) <= today,
  ).length;
  const newCards = Math.min(
    NEW_CARDS_PER_SESSION,
    cardIds.length - seen.size,
  );
  const totalLearned = seen.size;

  return { due, newCards, totalLearned };
}

export async function getSentences(profile: Profile): Promise<Sentence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sentences")
    .select("*")
    .eq("source_lang", profile.learning_source_lang)
    .eq("target_lang", profile.learning_target_lang)
    .order("day_index", { ascending: true });
  return (data as Sentence[]) ?? [];
}

export async function getStudyLogs(
  userId: string,
  sinceDays = 400,
): Promise<StudyLog[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const { data } = await supabase
    .from("study_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("studied_on", toDateString(since))
    .order("studied_on", { ascending: false });
  return (data as StudyLog[]) ?? [];
}

export type StudyStats = {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalCardsReviewed: number;
  totalSentences: number;
  countsByDate: Map<string, number>;
};

export async function getStudyStats(userId: string): Promise<StudyStats> {
  const logs = await getStudyLogs(userId);
  const dates = logs.map((l) => l.studied_on);
  const countsByDate = new Map<string, number>();
  let totalCardsReviewed = 0;
  let totalSentences = 0;

  for (const log of logs) {
    countsByDate.set(
      log.studied_on,
      log.cards_reviewed + log.sentences_studied,
    );
    totalCardsReviewed += log.cards_reviewed;
    totalSentences += log.sentences_studied;
  }

  return {
    currentStreak: computeCurrentStreak(dates),
    longestStreak: computeLongestStreak(dates),
    totalDays: dates.length,
    totalCardsReviewed,
    totalSentences,
    countsByDate,
  };
}
