import Link from "next/link";
import { getLanguages, getProfile, getSentences, languageLabel } from "@/lib/data";
import SentenceViewer from "@/components/SentenceViewer";
import GenerateContentButton from "@/components/GenerateContentButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "문장" };

export default async function SentencesPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [languages, sentences] = await Promise.all([
    getLanguages(),
    getSentences(profile),
  ]);

  const targetLabel = languageLabel(languages, profile.learning_target_lang);

  if (sentences.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-10 text-center">
        <div className="text-5xl">🌍</div>
        <h1 className="mt-4 text-xl font-bold text-fg">
          {targetLabel} 문장이 아직 없어요
        </h1>
        <p className="mt-2 text-sm text-muted">
          이 언어 조합의 문장을 AI로 바로 만들 수 있어요. 매일 자동으로도 새
          문장이 추가됩니다.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <GenerateContentButton label="AI로 문장 만들기" />
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

  return (
    <SentenceViewer
      sentences={sentences}
      targetLabel={targetLabel}
      targetLang={profile.learning_target_lang}
    />
  );
}
