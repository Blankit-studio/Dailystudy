"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reviewCard } from "@/lib/actions";
import type { Rating, StudyCard } from "@/lib/types";

const RATINGS: {
  value: Rating;
  label: string;
  hint: string;
  className: string;
}[] = [
  {
    value: "again",
    label: "다시",
    hint: "몰랐어요",
    className: "bg-rose-500 hover:bg-rose-600",
  },
  {
    value: "hard",
    label: "어려움",
    hint: "겨우 기억",
    className: "bg-amber-500 hover:bg-amber-600",
  },
  {
    value: "good",
    label: "알맞음",
    hint: "기억했어요",
    className: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    value: "easy",
    label: "쉬움",
    hint: "완벽해요",
    className: "bg-indigo-500 hover:bg-indigo-600",
  },
];

export default function StudySession({
  cards,
  targetLabel,
}: {
  cards: StudyCard[];
  targetLabel: string;
}) {
  const router = useRouter();
  const [queue, setQueue] = useState<StudyCard[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [again, setAgain] = useState(0);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(() => cards.length, [cards.length]);
  const current = queue[index];
  const done = index >= queue.length;

  function handleRate(rating: Rating) {
    if (!current || isPending) return;
    const card = current;

    startTransition(async () => {
      try {
        await reviewCard(card.id, rating);
      } catch {
        // Keep the UI flowing even if the network write fails.
      }
    });

    setReviewed((n) => n + 1);

    if (rating === "again") {
      // Re-queue the card near the end for another pass this session.
      setAgain((n) => n + 1);
      setQueue((q) => {
        const next = [...q];
        const [c] = next.splice(index, 1);
        const insertAt = Math.min(next.length, index + 3);
        next.splice(insertAt, 0, c);
        return next;
      });
      setFlipped(false);
      return;
    }

    setIndex((i) => i + 1);
    setFlipped(false);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm animate-pop">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">학습 완료!</h1>
        <p className="mt-2 text-sm text-slate-500">
          이번 세션에서 {reviewed}번 복습했어요. 꾸준함이 실력이 됩니다 💪
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-2xl font-bold text-indigo-600">{total}</div>
            <div className="text-xs text-slate-500">학습한 카드</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-2xl font-bold text-rose-500">{again}</div>
            <div className="text-xs text-slate-500">다시 본 횟수</div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            onClick={() => router.refresh()}
          >
            대시보드로
          </Link>
          <Link
            href="/sentences"
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            문장 학습하기
          </Link>
        </div>
      </div>
    );
  }

  const progress = Math.round((reviewed / (total + again)) * 100) || 0;

  return (
    <div className="mx-auto max-w-xl">
      {/* progress */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 transition hover:text-slate-600"
        >
          ✕
        </Link>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-slate-500">
          {Math.min(reviewed + 1, total + again)}/{total + again}
        </span>
      </div>

      {/* flashcard */}
      <div className="flip-card">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative block h-80 w-full text-left"
          aria-label="카드 뒤집기"
        >
          <div className={`flip-inner relative h-full w-full ${flipped ? "is-flipped" : ""}`}>
            {/* front */}
            <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="absolute left-5 top-5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                {targetLabel}
              </span>
              <p className="text-center text-4xl font-bold text-slate-900">
                {current.term}
              </p>
              {current.reading && (
                <p className="mt-3 text-center text-base text-slate-400">
                  {current.reading}
                </p>
              )}
              <p className="absolute bottom-5 text-xs text-slate-400">
                탭하여 뜻 보기
              </p>
            </div>

            {/* back */}
            <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 p-8">
              <p className="text-center text-3xl font-bold text-indigo-900">
                {current.meaning}
              </p>
              {current.example && (
                <div className="mt-5 max-w-sm text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {current.example}
                  </p>
                  {current.example_meaning && (
                    <p className="mt-1 text-sm text-slate-500">
                      {current.example_meaning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* controls */}
      <div className="mt-6">
        {!flipped ? (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            정답 보기
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleRate(r.value)}
                disabled={isPending}
                className={`flex flex-col items-center rounded-xl py-3 text-white transition disabled:opacity-60 ${r.className}`}
              >
                <span className="text-sm font-bold">{r.label}</span>
                <span className="mt-0.5 text-[11px] opacity-90">{r.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
