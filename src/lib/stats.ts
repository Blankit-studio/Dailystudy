import { toDateString } from "./srs";

/**
 * Computes the current consecutive-day streak from a set of studied
 * dates (YYYY-MM-DD). The streak counts today if studied, otherwise it
 * still counts as long as yesterday was studied (today not over yet).
 */
export function computeCurrentStreak(
  studiedDates: Iterable<string>,
  today: Date = new Date(),
): number {
  const set = new Set(studiedDates);
  const cursor = new Date(today);

  if (!set.has(toDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(toDateString(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(toDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Computes the longest consecutive-day streak ever recorded. */
export function computeLongestStreak(studiedDates: Iterable<string>): number {
  const sorted = Array.from(new Set(studiedDates)).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const ds of sorted) {
    const d = new Date(ds + "T00:00:00");
    if (prev) {
      const diff = Math.round((d.getTime() - prev.getTime()) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }
  return longest;
}

/**
 * Where the user stands on today's streak — drives the in-app reminder.
 *
 *  done     오늘 학습을 마쳤다
 *  at-risk  연속 기록이 살아 있지만 오늘 아직 안 했다 (자정에 끊긴다)
 *  broken   기록은 있으나 연속이 이미 끊겼다
 *  none     학습 기록이 아직 없다
 */
export type StreakStatus = "done" | "at-risk" | "broken" | "none";

export function getStreakStatus(
  studiedDates: Iterable<string>,
  today: Date = new Date(),
): { status: StreakStatus; streak: number; hoursLeft: number } {
  const set = new Set(studiedDates);
  const streak = computeCurrentStreak(set, today);
  // Whole hours remaining before midnight ends the day.
  const hoursLeft = Math.max(0, 23 - today.getHours());

  if (set.size === 0) return { status: "none", streak: 0, hoursLeft };
  if (set.has(toDateString(today))) return { status: "done", streak, hoursLeft };
  if (streak > 0) return { status: "at-risk", streak, hoursLeft };
  return { status: "broken", streak: 0, hoursLeft };
}

/** Builds the last `weeks` weeks of dates (Sun→Sat columns) for a heatmap. */
export function buildHeatmapWeeks(
  counts: Map<string, number>,
  weeks = 13,
  today: Date = new Date(),
): { date: string; count: number }[][] {
  const end = new Date(today);
  // move to the end of the current week (Saturday)
  end.setDate(end.getDate() + (6 - end.getDay()));

  const totalDays = weeks * 7;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDays - 1));

  const result: { date: string; count: number }[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const ds = toDateString(cursor);
      week.push({ date: ds, count: counts.get(ds) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    result.push(week);
  }
  return result;
}
