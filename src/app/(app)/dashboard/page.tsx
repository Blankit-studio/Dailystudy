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
          <p className="text-sm text-slate-500">{greeting}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.display_name ?? "학습자"}님, 오늘도 한 걸음 🌱
          </h1>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          {pairLabel}
          <span className="text-slate-400">변경</span>
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon="🔥"
          label="연속 학습"
          value={`${stats.currentStreak}일`}
          accent="text-orange-600"
        />
        <StatTile
          icon="📌"
          label="오늘 복습"
          value={`${reviewCount}개`}
          accent="text-indigo-600"
        />
        <StatTile
          icon="🧠"
          label="학습한 카드"
          value={`${due.totalLearned}개`}
          accent="text-emerald-600"
        />
        <StatTile
          icon="🗓️"
          label="총 학습일"
          value={`${stats.totalDays}일`}
          accent="text-violet-600"
        />
      </div>

      {/* Main actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/study"
          className="group rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">🃏</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {reviewCount > 0 ? `${reviewCount}개 대기` : "완료"}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold">플래시카드 학습</h2>
          <p className="mt-1 text-sm text-indigo-100">
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
          className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">💬</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {sentences.length}문장
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            매일 문장·회화
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            실제로 쓰는 표현을 읽고 뜻을 확인하며 자연스러운 문장을 익혀요.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-indigo-600 underline-offset-4 group-hover:underline">
            문장 학습하기 →
          </span>
        </Link>
      </div>

      {reviewCount === 0 && due.totalLearned === 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-800">
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
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="text-xl">{icon}</div>
      <div className={`mt-2 text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
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
