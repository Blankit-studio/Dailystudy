"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logSentenceStudy } from "@/lib/actions";
import type { Sentence } from "@/lib/types";

export default function SentenceViewer({
  sentences,
  targetLabel,
}: {
  sentences: Sentence[];
  targetLabel: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [logged, setLogged] = useState(false);
  const [, startTransition] = useTransition();

  const total = sentences.length;
  const current = sentences[index];
  const isLast = index === total - 1;

  function go(next: number) {
    const clamped = Math.max(0, Math.min(total - 1, next));
    setIndex(clamped);
    setRevealed(false);
    setSeen((s) => new Set(s).add(clamped));
  }

  function finish() {
    if (!logged) {
      setLogged(true);
      startTransition(async () => {
        try {
          await logSentenceStudy(seen.size);
        } catch {
          // ignore network errors, keep UX smooth
        }
        router.refresh();
      });
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ✕
        </Link>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-zinc-400">
          {index + 1}/{total}
        </span>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
            {targetLabel}
          </span>
          {current.day_index != null && (
            <span className="text-xs text-zinc-500">
              Day {current.day_index}
            </span>
          )}
        </div>

        <p className="mt-6 text-2xl font-bold leading-snug text-white">
          {current.text_target}
        </p>
        {current.reading && (
          <p className="mt-2 text-sm text-zinc-500">{current.reading}</p>
        )}

        <div className="mt-6 min-h-16 border-t border-dashed border-zinc-800 pt-5">
          {revealed ? (
            <p className="text-lg font-medium text-brand animate-pop">
              {current.text_source}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              뜻 보기
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
        >
          ← 이전
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={finish}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            {logged ? "기록됨 ✓" : "오늘 학습 완료"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            다음 →
          </button>
        )}
      </div>

      {logged && (
        <p className="mt-4 text-center text-sm text-brand-light">
          오늘 {seen.size}개의 문장을 학습했어요! 🎉
        </p>
      )}
    </div>
  );
}
