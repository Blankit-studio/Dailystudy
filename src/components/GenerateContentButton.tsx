"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateMyPairContent } from "@/lib/contentActions";

export default function GenerateContentButton({
  label = "AI로 학습 콘텐츠 만들기",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await generateMyPairContent();
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "생성에 실패했어요.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "생성 중… (10~20초)" : `✨ ${label}`}
      </button>
      {error && (
        <p className="max-w-sm text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
