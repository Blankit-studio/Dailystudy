import { createAdminClient } from "@/lib/supabase/admin";
import { geminiGenerateJSON } from "@/lib/gemini";
import { toDateString } from "@/lib/srs";
import { computeCurrentStreak } from "@/lib/stats";

type AIReport = { title: string; body: string };

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    body: { type: "string" },
  },
  required: ["title", "body"],
};

/**
 * Generates a short AI report summarizing all learning data right BEFORE
 * a full content reset, and stores it as a global report. Must be called
 * before the content is wiped.
 */
export async function generateResetReport(): Promise<{
  ok: boolean;
  title?: string;
  error?: string;
}> {
  const admin = createAdminClient();

  const [{ count: cardCount }, { count: sentenceCount }] = await Promise.all([
    admin.from("cards").select("id", { count: "exact", head: true }),
    admin.from("sentences").select("id", { count: "exact", head: true }),
  ]);

  const { data: logs } = await admin
    .from("study_logs")
    .select("studied_on, cards_reviewed, sentences_studied");

  let reviewed = 0;
  let sentencesStudied = 0;
  const days = new Set<string>();
  let from = "";
  let to = "";
  for (const l of logs ?? []) {
    reviewed += (l.cards_reviewed as number) ?? 0;
    sentencesStudied += (l.sentences_studied as number) ?? 0;
    const d = l.studied_on as string;
    days.add(d);
    if (!from || d < from) from = d;
    if (!to || d > to) to = d;
  }

  const snapshot = {
    cards: cardCount ?? 0,
    sentences: sentenceCount ?? 0,
    totalCardsReviewed: reviewed,
    totalSentencesStudied: sentencesStudied,
    studyDays: days.size,
    from: from || null,
    to: to || null,
  };

  let ai: AIReport;
  try {
    const prompt = `너는 언어 학습 앱의 학습 코치야. 아래는 학습 콘텐츠를 전체 초기화하기 "직전"의 누적 데이터야. 이 데이터를 바탕으로 한국어 리포트를 작성해줘.
규칙:
- "title": 12자 내외의 제목 (예: "초기화 전 학습 요약").
- "body": 3~5문장. 그동안의 학습량을 따뜻하게 정리하고 새 출발을 격려하는 톤. 숫자를 자연스럽게 녹여줘. 이모지는 0~1개만.
데이터(JSON): ${JSON.stringify(snapshot)}`;
    ai = await geminiGenerateJSON<AIReport>(prompt, REPORT_SCHEMA);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ai error" };
  }

  await admin.from("reports").insert({
    user_id: null,
    kind: "reset",
    period_start: snapshot.from,
    period_end: snapshot.to,
    title: ai.title,
    body: ai.body,
    stats: snapshot,
  });

  return { ok: true, title: ai.title };
}

/**
 * Generates a weekly analysis report for one user (last 7 days) and
 * stores it. Skips if a report for this week already exists.
 */
export async function generateWeeklyReport(
  userId: string,
  opts?: { force?: boolean },
): Promise<{
  userId: string;
  created: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const admin = createAdminClient();
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  const endStr = toDateString(end);
  const startStr = toDateString(start);

  if (!opts?.force) {
    const { count } = await admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "weekly")
      .eq("period_end", endStr);
    if ((count ?? 0) > 0) return { userId, created: false, skipped: true };
  }

  const { data: logs } = await admin
    .from("study_logs")
    .select("studied_on, cards_reviewed, sentences_studied")
    .eq("user_id", userId)
    .gte("studied_on", startStr)
    .lte("studied_on", endStr)
    .order("studied_on");

  let reviewed = 0;
  let sentencesStudied = 0;
  const dates: string[] = [];
  for (const l of logs ?? []) {
    reviewed += (l.cards_reviewed as number) ?? 0;
    sentencesStudied += (l.sentences_studied as number) ?? 0;
    dates.push(l.studied_on as string);
  }
  const activeDays = new Set(dates).size;
  const streak = computeCurrentStreak(dates, end);

  const stats = {
    periodStart: startStr,
    periodEnd: endStr,
    activeDays,
    totalCardsReviewed: reviewed,
    totalSentencesStudied: sentencesStudied,
    currentStreak: streak,
  };

  let ai: AIReport;
  try {
    const prompt = `너는 언어 학습 앱의 학습 코치야. 아래는 한 사용자의 지난 7일(${startStr}~${endStr}) 학습 기록이야. 한국어 주간 분석 리포트를 작성해줘.
규칙:
- "title": 15자 내외 제목 (예: "이번 주 학습 분석").
- "body": 4~6문장으로 (1) 한 주 요약(학습한 일수, 복습/문장 수, 연속일), (2) 잘한 점이나 패턴, (3) 다음 주 개선 제안 1가지를 담아줘. 따뜻하고 구체적으로. 데이터가 적으면 솔직하게 인정하되 다시 시작하도록 격려.
일별 기록(JSON): ${JSON.stringify(logs ?? [])}
요약(JSON): ${JSON.stringify(stats)}`;
    ai = await geminiGenerateJSON<AIReport>(prompt, REPORT_SCHEMA);
  } catch (e) {
    return { userId, created: false, error: e instanceof Error ? e.message : "ai error" };
  }

  await admin.from("reports").insert({
    user_id: userId,
    kind: "weekly",
    period_start: startStr,
    period_end: endStr,
    title: ai.title,
    body: ai.body,
    stats,
  });

  return { userId, created: true };
}
