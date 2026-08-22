"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DIFFICULTY_LABEL,
  difficultyLevel,
  estimatedLapses,
  type DifficultyLevel,
} from "@/lib/difficulty";
import { toBcp47 } from "@/lib/speech";
import SpeakButton from "@/components/SpeakButton";
import type { StudyCard } from "@/lib/types";

const BADGE: Record<DifficultyLevel, string> = {
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-brand/15 text-brand",
};

export default function DifficultCardList({
  cards,
  targetLabel,
  targetLang,
}: {
  cards: StudyCard[];
  targetLabel: string;
  targetLang: string;
}) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allRevealed = revealed.size === cards.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">오답 노트</h1>
          <p className="mt-1 text-sm text-muted">
            자주 틀린 {targetLabel} 카드 {cards.length}개 · 어려운 순
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setRevealed(allRevealed ? new Set() : new Set(cards.map((c) => c.id)))
            }
            className="rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-muted transition hover:bg-muted-bg hover:text-fg"
          >
            {allRevealed ? "뜻 숨기기" : "뜻 모두 보기"}
          </button>
          <Link
            href="/review?focus=1"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            집중 복습 시작
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {cards.map((card) => {
          const ease = card.progress?.ease ?? 2.5;
          const level = difficultyLevel(ease);
          const isOpen = revealed.has(card.id);

          return (
            <li
              key={card.id}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      lang={toBcp47(targetLang)}
                      className="text-lg font-bold text-fg"
                    >
                      {card.term}
                    </span>
                    {card.reading && (
                      <span className="text-sm text-subtle">{card.reading}</span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[level]}`}
                    >
                      {DIFFICULTY_LABEL[level]}
                    </span>
                    <span className="text-xs text-subtle">
                      {estimatedLapses(ease)}회 헷갈림
                    </span>
                  </div>

                  {isOpen ? (
                    <div className="mt-2 animate-pop">
                      <p className="font-medium text-brand">{card.meaning}</p>
                      {card.example && (
                        <p
                          lang={toBcp47(targetLang)}
                          className="mt-1 text-sm text-muted"
                        >
                          {card.example}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(card.id)}
                      className="mt-2 text-sm text-subtle underline-offset-4 transition hover:text-fg hover:underline"
                    >
                      뜻 보기
                    </button>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <SpeakButton text={card.term} lang={targetLang} />
                  {isOpen && (
                    <button
                      type="button"
                      onClick={() => toggle(card.id)}
                      aria-label="뜻 숨기기"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-subtle transition hover:bg-muted-bg hover:text-fg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-center text-xs text-subtle">
        학습에서 <strong>다시</strong>·<strong>어려움</strong>으로 평가할수록 위로
        올라가고, 잘 외우면 목록에서 사라집니다.
      </p>
    </div>
  );
}
