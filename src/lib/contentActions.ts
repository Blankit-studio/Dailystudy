"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateDailyContent } from "@/lib/generateContent";

export type GenerateResult = {
  ok: boolean;
  cards?: number;
  sentences?: number;
  already?: boolean;
  error?: string;
};

/**
 * Generates a starter batch of content for the signed-in user's current
 * language pair — used to populate a freshly selected language without
 * waiting for the daily cron. No-ops if the pair already has content.
 */
export async function generateMyPairContent(): Promise<GenerateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  if (!process.env.GEMINI_API_KEY) {
    return { ok: false, error: "AI 생성이 설정되지 않았어요 (GEMINI_API_KEY 없음)." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("learning_source_lang, learning_target_lang, learning_level")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "프로필을 찾을 수 없습니다." };

  const source = profile.learning_source_lang as string;
  const target = profile.learning_target_lang as string;
  const level = (profile.learning_level as string) ?? "beginner";
  if (source === target) {
    return { ok: false, error: "출발어와 목표어가 같습니다." };
  }

  // Only generate when this pair+level is genuinely empty (prevents spam).
  const { data: decks } = await supabase
    .from("decks")
    .select("id")
    .eq("source_lang", source)
    .eq("target_lang", target)
    .eq("level", level);
  const deckIds = (decks ?? []).map((d) => d.id);
  let cardCount = 0;
  if (deckIds.length) {
    const { count } = await supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .in("deck_id", deckIds);
    cardCount = count ?? 0;
  }
  const { count: sentenceCount } = await supabase
    .from("sentences")
    .select("id", { count: "exact", head: true })
    .eq("source_lang", source)
    .eq("target_lang", target)
    .eq("level", level);

  if (cardCount > 0 || (sentenceCount ?? 0) > 0) {
    return { ok: true, already: true };
  }

  try {
    const res = await generateDailyContent({
      sourceLang: source,
      targetLang: target,
      level,
      cardCount: 8,
      sentenceCount: 5,
      force: true,
    });
    revalidatePath("/study");
    revalidatePath("/sentences");
    revalidatePath("/dashboard");
    return { ok: true, cards: res.cards, sentences: res.sentences };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "생성에 실패했어요." };
  }
}
