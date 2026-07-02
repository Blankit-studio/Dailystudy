import {
  getLanguages,
  getProfile,
  getReports,
  getStudyStats,
  languageLabel,
} from "@/lib/data";
import StreakHeatmap from "@/components/StreakHeatmap";
import type { Report } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "통계" };

export default async function StatsPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [languages, stats, reports] = await Promise.all([
    getLanguages(),
    getStudyStats(profile.id),
    getReports(),
  ]);

  const pairLabel = `${languageLabel(languages, profile.learning_source_lang)} → ${languageLabel(
    languages,
    profile.learning_target_lang,
  )}`;

  const tiles = [
    { icon: "🔥", label: "현재 연속 학습", value: `${stats.currentStreak}일`, accent: "text-brand" },
    { icon: "🏆", label: "최장 연속 학습", value: `${stats.longestStreak}일`, accent: "text-brand" },
    { icon: "🃏", label: "총 카드 복습", value: `${stats.totalCardsReviewed}회`, accent: "text-fg" },
    { icon: "💬", label: "총 문장 학습", value: `${stats.totalSentences}개`, accent: "text-muted" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">학습 통계</h1>
        <p className="mt-1 text-sm text-muted">
          현재 학습 언어: <span className="font-medium text-fg">{pairLabel}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <div className="text-xl">{t.icon}</div>
            <div className={`mt-2 text-2xl font-bold ${t.accent}`}>
              {t.value}
            </div>
            <div className="text-xs text-subtle">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-fg">최근 13주 학습 활동</h2>
          <span className="text-sm text-muted">총 {stats.totalDays}일 학습</span>
        </div>
        <StreakHeatmap counts={stats.countsByDate} />
      </div>

      {/* AI reports */}
      <div className="space-y-3">
        <h2 className="font-bold text-fg">AI 리포트</h2>
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
            아직 리포트가 없어요. 매주 일요일에 한 주 학습 분석 리포트가 자동으로
            생성되고, 학습 콘텐츠를 초기화하면 직전 데이터 요약 리포트가 남습니다.
          </div>
        ) : (
          reports.map((r) => <ReportCard key={r.id} report={r} />)
        )}
      </div>

      {stats.totalDays === 0 && (
        <div className="rounded-2xl border border-brand/20 bg-brand/10 p-5 text-center text-sm text-brand">
          아직 학습 기록이 없어요. 첫 카드를 복습하고 스트릭을 시작해보세요! 🔥
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const isWeekly = report.kind === "weekly";
  const badge = isWeekly ? "주간 리포트" : "초기화 요약";
  const dateLabel =
    isWeekly && report.period_start && report.period_end
      ? `${report.period_start} ~ ${report.period_end}`
      : report.created_at.slice(0, 10);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isWeekly
              ? "bg-brand/15 text-brand"
              : "bg-muted-bg text-muted"
          }`}
        >
          {badge}
        </span>
        <span className="text-xs text-subtle">{dateLabel}</span>
      </div>
      <h3 className="font-bold text-fg">{report.title}</h3>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted">
        {report.body}
      </p>
    </div>
  );
}
