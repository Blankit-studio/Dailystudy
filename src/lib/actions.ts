"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { schedule, toDateString, type SrsResult } from "./srs";
import type { Rating } from "./types";

async function bumpStudyLog(
  supabase: SupabaseClient,
  userId: string,
  { cards = 0, sentences = 0 }: { cards?: number; sentences?: number },
) {
  const today = toDateString(new Date());
  const { data: row } = await supabase
    .from("study_logs")
    .select("cards_reviewed, sentences_studied")
    .eq("user_id", userId)
    .eq("studied_on", today)
    .maybeSingle();

  await supabase.from("study_logs").upsert(
    {
      user_id: userId,
      studied_on: today,
      cards_reviewed: (row?.cards_reviewed ?? 0) + cards,
      sentences_studied: (row?.sentences_studied ?? 0) + sentences,
    },
    { onConflict: "user_id,studied_on" },
  );
}

/** Reviews a single flashcard, updating its SRS schedule. */
export async function reviewCard(
  cardId: string,
  rating: Rating,
): Promise<SrsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: existing } = await supabase
    .from("user_cards")
    .select("ease, interval_days, repetitions, status")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  const next = schedule(
    existing
      ? {
          ease: existing.ease,
          interval_days: existing.interval_days,
          repetitions: existing.repetitions,
          status: existing.status,
        }
      : null,
    rating,
  );

  await supabase.from("user_cards").upsert(
    {
      user_id: user.id,
      card_id: cardId,
      ease: next.ease,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      due_date: next.due_date,
      status: next.status,
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,card_id" },
  );

  await bumpStudyLog(supabase, user.id, { cards: 1 });

  revalidatePath("/dashboard");
  revalidatePath("/stats");
  return next;
}

/** Logs that the user finished studying a set of daily sentences. */
export async function logSentenceStudy(count: number): Promise<void> {
  if (count <= 0) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  await bumpStudyLog(supabase, user.id, { sentences: count });
  revalidatePath("/dashboard");
  revalidatePath("/stats");
}

/** Updates the user's profile and active learning language pair. */
export async function updateSettings(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const displayName = String(formData.get("display_name") ?? "").trim();
  const sourceLang = String(formData.get("source_lang") ?? "ko");
  const targetLang = String(formData.get("target_lang") ?? "en");
  const levelInput = String(formData.get("learning_level") ?? "beginner");
  const learningLevel = ["beginner", "intermediate", "advanced"].includes(
    levelInput,
  )
    ? levelInput
    : "beginner";

  await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      learning_source_lang: sourceLang,
      learning_target_lang: targetLang,
      learning_level: learningLevel,
    })
    .eq("id", user.id);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/study");
  revalidatePath("/sentences");
}
