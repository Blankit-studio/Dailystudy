import {
  getLanguages,
  getProfile,
  getStudyStats,
  languageLabel,
} from "@/lib/data";
import StreakHeatmap from "@/components/StreakHeatmap";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [languages, stats] = await Promise.all([
    getLanguages(),
    getStudyStats(profile.id),
  ]);

  const pairLabel = `${languageLabel(languages, profile.learning_source_lang)} → ${languageLabel(
    languages,
    profile.learning_target_lang,
  )}`;

  const tiles = [
    { icon: "🔥", label: "현재 연속 학습", value: `${stats.currentStreak}일`, accent: "text-orange-600" },
    { icon: "🏆", label: "최장 연속 학습", value: `${stats.longestStreak}일`, accent: "text-amber-600" },
    { icon: "🃏", label: "총 카드 복습", value: `${stats.totalCardsReviewed}회`, accent: "text-indigo-600" },
    { icon: "💬", label: "총 문장 학습", value: `${stats.totalSentences}개`, accent: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">학습 통계</h1>
        <p className="mt-1 text-sm text-slate-500">
          현재 학습 언어: <span className="font-medium">{pairLabel}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="text-xl">{t.icon}</div>
            <div className={`mt-2 text-2xl font-bold ${t.accent}`}>
              {t.value}
            </div>
            <div className="text-xs text-slate-500">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">최근 13주 학습 활동</h2>
          <span className="text-sm text-slate-500">
            총 {stats.totalDays}일 학습
          </span>
        </div>
        <StreakHeatmap counts={stats.countsByDate} />
      </div>

      {stats.totalDays === 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center text-sm text-indigo-800">
          아직 학습 기록이 없어요. 첫 카드를 복습하고 스트릭을 시작해보세요! 🔥
        </div>
      )}
    </div>
  );
}
