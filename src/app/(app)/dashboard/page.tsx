import Link from "next/link";
import {
  getDueSummary,
  getLanguages,
  getProfile,
  getSentences,
  getStudyStats,
  languageLabel,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [languages, due, stats, sentences] = await Promise.all([
    getLanguages(),
    getDueSummary(profile),
    getStudyStats(profile.id),
    getSentences(profile),
  ]);

  const pairLabel = `${languageLabel(languages, profile.learning_source_lang)} → ${languageLabel(
    languages,
    profile.learning_target_lang,
  )}`;
  const reviewCount = due.due + due.newCards;
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{greeting}</p>
          <h1 className="text-2xl font-bold text-white">
            {profile.display_name ?? "학습자"}님, 오늘도 한 걸음 🌱
          </h1>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
        >
          {pairLabel}
          <span className="text-zinc-500">변경</span>
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon="🔥" label="연속 학습" value={`${stats.currentStreak}일`} accent="text-brand" />
        <StatTile icon="📌" label="오늘 복습" value={`${reviewCount}개`} accent="text-brand-light" />
        <StatTile icon="🧠" label="학습한 카드" value={`${due.totalLearned}개`} accent="text-white" />
        <StatTile icon="🗓️" label="총 학습일" value={`${stats.totalDays}일`} accent="text-zinc-300" />
      </div>

      {/* Main actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/study"
          className="group rounded-2xl border border-brand/30 bg-gradient-to-br from-brand to-blue-700 p-6 text-white transition hover:shadow-lg hover:shadow-brand/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">🃏</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {reviewCount > 0 ? `${reviewCount}개 대기` : "완료"}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold">플래시카드 학습</h2>
          <p className="mt-1 text-sm text-blue-100">
            {reviewCount > 0
              ? "오늘 복습할 카드가 기다리고 있어요. 지금 시작해보세요."
              : "오늘 복습을 모두 끝냈어요! 새 카드를 더 학습할 수도 있어요."}
          </p>
          <span className="mt-4 inline-block text-sm font-semibold underline-offset-4 group-hover:underline">
            학습 시작하기 →
          </span>
        </Link>

        <Link
          href="/sentences"
          className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">💬</span>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm font-semibold text-zinc-300">
              {sentences.length}문장
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">매일 문장·회화</h2>
          <p className="mt-1 text-sm text-zinc-400">
            실제로 쓰는 표현을 읽고 뜻을 확인하며 자연스러운 문장을 익혀요.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand underline-offset-4 group-hover:underline">
            문장 학습하기 →
          </span>
        </Link>
      </div>

      {reviewCount === 0 && due.totalLearned === 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-300">
          선택한 언어({pairLabel})에 학습할 콘텐츠가 아직 없어요.{" "}
          <Link href="/settings" className="font-semibold underline">
            설정
          </Link>
          에서 다른 언어를 선택하거나, Supabase에 카드를 추가해보세요.
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-xl">{icon}</div>
      <div className={`mt-2 text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "늦은 밤이에요";
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "좋은 오후예요";
  return "좋은 저녁이에요";
}
