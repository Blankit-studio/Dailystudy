import Link from "next/link";
import {
  getDifficultCards,
  getLanguages,
  getProfile,
  languageLabel,
} from "@/lib/data";
import DifficultCardList from "@/components/DifficultCardList";
import StudySession from "@/components/StudySession";

export const dynamic = "force-dynamic";

export const metadata = { title: "오답 노트" };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) return null;

  const [languages, cards, params] = await Promise.all([
    getLanguages(),
    getDifficultCards(profile),
    searchParams,
  ]);

  const targetLabel = languageLabel(languages, profile.learning_target_lang);

  // Focus mode reuses the normal study session, limited to these cards.
  if (params.focus === "1" && cards.length > 0) {
    return (
      <StudySession
        cards={cards.slice(0, 20)}
        targetLabel={targetLabel}
        targetLang={profile.learning_target_lang}
      />
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-10 text-center">
        <div className="text-5xl">🌟</div>
        <h1 className="mt-4 text-xl font-bold text-fg">
          아직 어려운 카드가 없어요
        </h1>
        <p className="mt-2 text-sm text-muted">
          학습 중 <strong className="text-fg">다시</strong> 또는{" "}
          <strong className="text-fg">어려움</strong>으로 평가한 카드가 여기에
          모입니다. 헷갈리는 단어만 골라 집중 복습할 수 있어요.
        </p>
        <Link
          href="/study"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          학습하러 가기
        </Link>
      </div>
    );
  }

  return (
    <DifficultCardList
      cards={cards}
      targetLabel={targetLabel}
      targetLang={profile.learning_target_lang}
    />
  );
}
