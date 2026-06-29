import Link from "next/link";
import {
  getLanguages,
  getProfile,
  getStudyQueue,
  languageLabel,
  pairHasContent,
} from "@/lib/data";
import StudySession from "@/components/StudySession";
import GenerateContentButton from "@/components/GenerateContentButton";

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
    const has = await pairHasContent(profile);

    // No content for this language pair yet → offer to generate it now.
    if (!has.cards) {
      return (
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-10 text-center">
          <div className="text-5xl">🌍</div>
          <h1 className="mt-4 text-xl font-bold text-fg">
            {targetLabel} 콘텐츠가 아직 없어요
          </h1>
          <p className="mt-2 text-sm text-muted">
            이 언어 조합의 학습 카드를 AI로 바로 만들 수 있어요. 매일 자동으로도
            새 콘텐츠가 추가됩니다.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <GenerateContentButton />
            <Link
              href="/settings"
              className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            >
              다른 언어 선택하기
            </Link>
          </div>
        </div>
      );
    }

    // Has content, but nothing due right now → done for today.
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-xl font-bold text-fg">
          오늘 복습할 카드가 없어요!
        </h1>
        <p className="mt-2 text-sm text-muted">
          모든 카드를 복습했어요. 내일 다시 복습 카드가 준비됩니다.
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
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-fg transition hover:bg-muted-bg"
          >
            문장 학습하기
          </Link>
        </div>
      </div>
    );
  }

  return <StudySession cards={queue} targetLabel={targetLabel} />;
}
