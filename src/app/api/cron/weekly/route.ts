import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateWeeklyReport } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  if (request.headers.get("authorization") === `Bearer ${secret}`) return true;
  return new URL(request.url).searchParams.get("secret") === secret;
}

/**
 * Weekly report generator. Vercel Cron calls this once a week; it builds
 * an AI analysis of the last 7 days for every user. `?force=1` regenerates
 * even if this week's report already exists (handy for manual testing).
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  const admin = createAdminClient();
  const { data: users } = await admin.from("profiles").select("id");

  const results = [];
  for (const u of (users ?? []).slice(0, 200)) {
    try {
      results.push(await generateWeeklyReport(u.id as string, { force }));
    } catch (e) {
      results.push({
        userId: u.id as string,
        created: false,
        error: e instanceof Error ? e.message : "unknown error",
      });
    }
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}
