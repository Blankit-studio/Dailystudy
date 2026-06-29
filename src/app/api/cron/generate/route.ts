import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyContent, type PairResult } from "@/lib/generateContent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Pairs that always get fresh content, even with no registered users yet.
const DEFAULT_PAIRS = [
  { sourceLang: "ko", targetLang: "en", level: "beginner" },
  { sourceLang: "ko", targetLang: "ja", level: "beginner" },
];

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured, allow (useful in local dev).
  if (!secret) return true;
  if (request.headers.get("authorization") === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

/** Distinct (pair + level) combos that users are learning, plus defaults. */
async function getActivePairs() {
  const pairs = new Map<
    string,
    { sourceLang: string; targetLang: string; level: string }
  >();
  for (const p of DEFAULT_PAIRS) {
    pairs.set(`${p.sourceLang}-${p.targetLang}-${p.level}`, p);
  }
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("learning_source_lang, learning_target_lang, learning_level");
    for (const row of data ?? []) {
      const s = row.learning_source_lang as string;
      const t = row.learning_target_lang as string;
      const level = (row.learning_level as string) || "beginner";
      if (s && t && s !== t) {
        pairs.set(`${s}-${t}-${level}`, { sourceLang: s, targetLang: t, level });
      }
    }
  } catch {
    // fall back to defaults
  }
  return [...pairs.values()];
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  const pairs = await getActivePairs();
  const results: (PairResult | { pair: string; error: string })[] = [];

  for (const pair of pairs) {
    try {
      results.push(await generateDailyContent({ ...pair, force }));
    } catch (e) {
      results.push({
        pair: `${pair.sourceLang}->${pair.targetLang}`,
        error: e instanceof Error ? e.message : "unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    date: new Date().toISOString().slice(0, 10),
    results,
  });
}
