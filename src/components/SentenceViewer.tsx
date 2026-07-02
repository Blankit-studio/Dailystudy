"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logSentenceStudy } from "@/lib/actions";
import { toBcp47 } from "@/lib/speech";
import SpeakButton from "@/components/SpeakButton";
import type { Sentence } from "@/lib/types";

function isInteractive(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
  );
}

export default function SentenceViewer({
  sentences,
  targetLabel,
  targetLang,
}: {
  sentences: Sentence[];
  targetLabel: string;
  targetLang: string;
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

  // Keyboard shortcuts: ←/→ navigate, Space/Enter reveals the meaning.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isInteractive(e.target)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setRevealed(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-subtle transition hover:text-fg"
        >
          ✕
        </Link>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted-bg">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted">
          {index + 1}/{total}
        </span>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-muted">
            {targetLabel}
          </span>
          {current.day_index != null && (
            <span className="text-xs text-subtle">Day {current.day_index}</span>
          )}
        </div>

        <div className="mt-6 flex items-start justify-between gap-3">
          <p
            lang={toBcp47(targetLang)}
            className="text-2xl font-bold leading-snug text-fg"
          >
            {current.text_target}
          </p>
          <SpeakButton
            text={current.text_target}
            lang={targetLang}
            className="shrink-0"
          />
        </div>
        {current.reading && (
          <p className="mt-2 text-sm text-subtle">{current.reading}</p>
        )}

        <div className="mt-6 min-h-16 border-t border-dashed border-line pt-5">
          {revealed ? (
            <p className="text-lg font-medium text-brand animate-pop">
              {current.text_source}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-fg px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
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
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-muted transition hover:bg-muted-bg hover:text-fg disabled:opacity-40"
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

      <p className="mt-3 hidden text-center text-xs text-subtle sm:block">
        단축키: ←/→ 이동 · Space 뜻 보기
      </p>

      {logged && (
        <p className="mt-4 text-center text-sm text-brand">
          오늘 {seen.size}개의 문장을 학습했어요! 🎉
        </p>
      )}
    </div>
  );
}
