import Link from "next/link";
import type { StreakStatus } from "@/lib/stats";

/**
 * In-app reminder that nudges the user back before their streak dies.
 * Renders nothing when there is nothing worth saying.
 */
export default function StreakReminder({
  status,
  streak,
  hoursLeft,
  hasContent,
}: {
  status: StreakStatus;
  streak: number;
  hoursLeft: number;
  hasContent: boolean;
}) {
  // Nothing to nudge about before the first study session.
  if (status === "none") return null;

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand/10 px-5 py-4 text-sm">
        <span className="text-xl">✅</span>
        <p className="text-brand">
          오늘 학습을 마쳤어요!{" "}
          {streak > 1 && <strong>{streak}일 연속 진행 중이에요 🔥</strong>}
        </p>
      </div>
    );
  }

  if (status === "at-risk") {
    const urgent = hoursLeft <= 6;
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${
          urgent
            ? "border-rose-500/30 bg-rose-500/10"
            : "border-amber-500/30 bg-amber-500/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{urgent ? "⏰" : "🔥"}</span>
          <div className="text-sm">
            <p
              className={`font-semibold ${
                urgent
                  ? "text-rose-700 dark:text-rose-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {streak}일 연속 학습 중 — 오늘 학습하면 {streak + 1}일째예요
            </p>
            <p
              className={
                urgent
                  ? "text-rose-700/80 dark:text-rose-300/80"
                  : "text-amber-700/80 dark:text-amber-300/80"
              }
            >
              {hoursLeft > 0
                ? `자정까지 약 ${hoursLeft}시간 남았어요. 지금 5분만 투자해보세요.`
                : "오늘이 곧 끝나요. 한 장이라도 복습하면 기록이 이어집니다."}
            </p>
          </div>
        </div>
        {hasContent && (
          <Link
            href="/study"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            지금 학습하기
          </Link>
        )}
      </div>
    );
  }

  // status === "broken"
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🌱</span>
        <div className="text-sm">
          <p className="font-semibold text-fg">다시 시작해볼까요?</p>
          <p className="text-muted">
            연속 기록이 끊겼어요. 오늘 학습하면 새 스트릭이 1일째로 시작됩니다.
          </p>
        </div>
      </div>
      {hasContent && (
        <Link
          href="/study"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          학습 시작하기
        </Link>
      )}
    </div>
  );
}
