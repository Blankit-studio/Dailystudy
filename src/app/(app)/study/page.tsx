import Link from "next/link";
import { getLanguages, getProfile, getStudyQueue, languageLabel } from "@/lib/data";
import StudySession from "@/components/StudySession";

export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [languages, queue] = await Promise.all([
    getLanguages(),
    getStudyQueue(profile),
  ]);

  const targetLabel = languageLabel(languages, profile.learning_target_lang);

  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-xl font-bold text-white">
          오늘 복습할 카드가 없어요!
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          모든 카드를 복습했거나, 선택한 언어({targetLabel})에 학습할 카드가
          아직 없어요. 내일 다시 복습 카드가 준비됩니다.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            대시보드로
          </Link>
          <Link
            href="/sentences"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            문장 학습하기
          </Link>
        </div>
      </div>
    );
  }

  return <StudySession cards={queue} targetLabel={targetLabel} />;
}
