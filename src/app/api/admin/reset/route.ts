import { NextResponse } from "next/server";
import { getActivePairs } from "@/lib/activePairs";
import { isCronAuthorized } from "@/lib/cronAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyContent, type PairResult } from "@/lib/generateContent";
import { generateResetReport } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time reset: wipes all learning content (cards/decks → user SRS
 * progress cascades away) and sentences, then generates a fresh, larger
 * batch via AI. Destructive — requires the secret AND `confirm=1`.
 *
 *   GET /api/admin/reset?secret=<CRON_SECRET>&confirm=1
 *
 * Optional: &cards=12 &sentences=8 &logs=1 (also clear streak/stats).
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== "1") {
    return NextResponse.json(
      {
        error: "destructive operation",
        message:
          "모든 단어/문장을 삭제하고 새로 생성합니다. 실행하려면 confirm=1 을 추가하세요.",
        example: "/api/admin/reset?secret=YOUR_SECRET&confirm=1",
      },
      { status: 400 },
    );
  }

  const cardCount = Math.min(Number(url.searchParams.get("cards")) || 12, 30);
  const sentenceCount = Math.min(
    Number(url.searchParams.get("sentences")) || 8,
    20,
  );
  const clearLogs = url.searchParams.get("logs") === "1";

  const admin = createAdminClient();

  // 0) Snapshot the pre-reset data into an AI report (before anything is wiped).
  let report: { ok: boolean; title?: string; error?: string };
  try {
    report = await generateResetReport();
  } catch (e) {
    report = { ok: false, error: e instanceof Error ? e.message : "report failed" };
  }

  // 1) Wipe content. Deleting cards cascades to user_cards (SRS progress);
  //    deleting decks removes the now-empty decks.
  const { count: deletedCards } = await admin
    .from("cards")
    .delete({ count: "exact" })
    .not("id", "is", null);
  await admin.from("decks").delete().not("id", "is", null);
  const { count: deletedSentences } = await admin
    .from("sentences")
    .delete({ count: "exact" })
    .not("id", "is", null);

  let clearedLogs = 0;
  if (clearLogs) {
    const { count } = await admin
      .from("study_logs")
      .delete({ count: "exact" })
      .not("id", "is", null);
    clearedLogs = count ?? 0;
  }

  // 2) Generate a fresh batch for the active/default pairs.
  const pairs = await getActivePairs();
  const generated: (PairResult | { pair: string; error: string })[] = [];
  for (const pair of pairs) {
    try {
      generated.push(
        await generateDailyContent({
          ...pair,
          cardCount,
          sentenceCount,
          force: true,
        }),
      );
    } catch (e) {
      generated.push({
        pair: `${pair.sourceLang}->${pair.targetLang}`,
        error: e instanceof Error ? e.message : "unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    report,
    reset: {
      deletedCards: deletedCards ?? 0,
      deletedSentences: deletedSentences ?? 0,
      clearedStudyLogs: clearedLogs,
    },
    generated,
  });
}
