/**
 * Difficulty scoring for the "오답 노트" (tricky cards) view.
 *
 * The SRS scheduler starts every card at ease 2.5 and only lowers it when
 * a review is rated "again" (−0.2) or "hard" (−0.15). So an ease below the
 * starting value is a record of past struggle — no extra tracking needed.
 */

/** Ease every card starts at; anything lower means the user has struggled. */
export const DEFAULT_EASE = 2.5;

export type DifficultyLevel = "high" | "medium" | "low";

/** Whether a card belongs in the tricky-cards list. */
export function isDifficult(ease: number): boolean {
  return ease < DEFAULT_EASE;
}

/** How much the user is struggling with a card. */
export function difficultyLevel(ease: number): DifficultyLevel {
  if (ease <= 1.7) return "high";
  if (ease <= 2.1) return "medium";
  return "low";
}

export const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
  high: "매우 어려움",
  medium: "어려움",
  low: "조금 어려움",
};

/**
 * Roughly how many times a card was rated "again", inferred from how far
 * its ease has fallen. Used only as a hint in the UI.
 */
export function estimatedLapses(ease: number): number {
  if (ease >= DEFAULT_EASE) return 0;
  return Math.max(1, Math.round((DEFAULT_EASE - ease) / 0.2));
}

/** Hardest cards first; ties keep a stable order. */
export function sortByDifficulty<T extends { ease: number }>(cards: T[]): T[] {
  return [...cards].sort((a, b) => a.ease - b.ease);
}
