import { NextResponse } from "next/server";
import { getActivePairs } from "@/lib/activePairs";
import { isCronAuthorized } from "@/lib/cronAuth";
import { generateDailyContent, type PairResult } from "@/lib/generateContent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
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
