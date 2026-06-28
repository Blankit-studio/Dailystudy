import type { CardProgress, Rating } from "./types";

export type SrsState = {
  ease: number;
  interval_days: number;
  repetitions: number;
  status: CardProgress["status"];
};

export type SrsResult = SrsState & {
  /** Next due date as YYYY-MM-DD. */
  due_date: string;
};

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * SM-2 inspired spaced-repetition scheduler.
 *
 * `again`  → reset, study again in the same session (interval 0).
 * `hard`   → smaller interval growth, ease penalty.
 * `good`   → standard growth using the current ease factor.
 * `easy`   → bonus interval and a small ease boost.
 */
export function schedule(
  prev: SrsState | null,
  rating: Rating,
  today: Date = new Date(),
): SrsResult {
  let ease = prev?.ease ?? DEFAULT_EASE;
  let repetitions = prev?.repetitions ?? 0;
  let interval = prev?.interval_days ?? 0;

  if (rating === "again") {
    ease = Math.max(MIN_EASE, ease - 0.2);
    return {
      ease: round2(ease),
      interval_days: 0,
      repetitions: 0,
      status: "learning",
      due_date: toDateString(today),
    };
  }

  if (rating === "hard") {
    ease = Math.max(MIN_EASE, ease - 0.15);
  } else if (rating === "easy") {
    ease = ease + 0.15;
  }

  repetitions += 1;

  if (repetitions === 1) {
    interval = rating === "easy" ? 3 : 1;
  } else if (repetitions === 2) {
    interval = rating === "hard" ? 3 : rating === "easy" ? 6 : 4;
  } else {
    const factor = rating === "hard" ? 1.2 : ease;
    interval = Math.round(Math.max(1, interval) * factor);
    if (rating === "easy") interval = Math.round(interval * 1.3);
  }

  interval = Math.max(1, interval);

  return {
    ease: round2(ease),
    interval_days: interval,
    repetitions,
    status: "review",
    due_date: toDateString(addDays(today, interval)),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
