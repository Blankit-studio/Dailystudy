import { createAdminClient } from "@/lib/supabase/admin";

export type ActivePair = {
  sourceLang: string;
  targetLang: string;
  level: string;
};

/** Combos generated even when nobody has registered yet. */
const DEFAULT_PAIRS: ActivePair[] = [
  { sourceLang: "ko", targetLang: "en", level: "beginner" },
  { sourceLang: "ko", targetLang: "ja", level: "beginner" },
];

/**
 * Every distinct (source, target, level) combo users are actually
 * learning, plus the defaults. Shared by the daily cron and the reset
 * endpoint so both generate content for the same set — including the
 * levels users picked, not just beginner.
 */
export async function getActivePairs(): Promise<ActivePair[]> {
  const pairs = new Map<string, ActivePair>();
  const key = (p: ActivePair) => `${p.sourceLang}-${p.targetLang}-${p.level}`;

  for (const p of DEFAULT_PAIRS) pairs.set(key(p), p);

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("learning_source_lang, learning_target_lang, learning_level");

    for (const row of data ?? []) {
      const sourceLang = row.learning_source_lang as string;
      const targetLang = row.learning_target_lang as string;
      const level = (row.learning_level as string) || "beginner";
      if (sourceLang && targetLang && sourceLang !== targetLang) {
        const pair = { sourceLang, targetLang, level };
        pairs.set(key(pair), pair);
      }
    }
  } catch {
    // Fall back to the defaults if the lookup fails.
  }

  return [...pairs.values()];
}
