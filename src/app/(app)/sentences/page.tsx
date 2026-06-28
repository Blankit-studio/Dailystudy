import Link from "next/link";
import { getLanguages, getProfile, getSentences, languageLabel } from "@/lib/data";
import SentenceViewer from "@/components/SentenceViewer";

export const dynamic = "force-dynamic";

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
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <div className="text-5xl">📭</div>
        <h1 className="mt-4 text-xl font-bold text-white">
          문장이 아직 없어요
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          선택한 언어({targetLabel})에 등록된 문장이 없어요. 설정에서 다른
          언어를 선택해보세요.
        </p>
        <Link
          href="/settings"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          설정으로
        </Link>
      </div>
    );
  }

  return <SentenceViewer sentences={sentences} targetLabel={targetLabel} />;
}
