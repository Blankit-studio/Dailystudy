import { describe, expect, it } from "vitest";
import {
  buildHeatmapWeeks,
  computeCurrentStreak,
  computeLongestStreak,
} from "../stats";
import { toDateString } from "../srs";

const TODAY = new Date("2026-08-22T10:00:00");

/** YYYY-MM-DD for `n` days before TODAY. */
function daysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return toDateString(d);
}

describe("computeCurrentStreak", () => {
  it("오늘까지 이어지면 그 길이를 센다", () => {
    expect(computeCurrentStreak([daysAgo(0), daysAgo(1), daysAgo(2)], TODAY)).toBe(3);
  });

  it("오늘 아직 안 했어도 어제까지 이어졌으면 유지한다", () => {
    expect(computeCurrentStreak([daysAgo(1), daysAgo(2)], TODAY)).toBe(2);
  });

  it("이틀 전에 끊겼으면 0 이다", () => {
    expect(computeCurrentStreak([daysAgo(2), daysAgo(3)], TODAY)).toBe(0);
  });

  it("기록이 없으면 0 이다", () => {
    expect(computeCurrentStreak([], TODAY)).toBe(0);
  });

  it("같은 날짜가 중복돼도 하루로 센다", () => {
    expect(computeCurrentStreak([daysAgo(0), daysAgo(0), daysAgo(1)], TODAY)).toBe(2);
  });

  it("중간에 빈 날이 있으면 최근 구간만 센다", () => {
    expect(
      computeCurrentStreak([daysAgo(0), daysAgo(1), daysAgo(5), daysAgo(6)], TODAY),
    ).toBe(2);
  });
});

describe("computeLongestStreak", () => {
  it("가장 긴 연속 구간을 찾는다", () => {
    expect(
      computeLongestStreak([daysAgo(10), daysAgo(9), daysAgo(8), daysAgo(5), daysAgo(4)]),
    ).toBe(3);
  });

  it("기록이 없으면 0 이다", () => {
    expect(computeLongestStreak([])).toBe(0);
  });

  it("하루만 있으면 1 이다", () => {
    expect(computeLongestStreak([daysAgo(3)])).toBe(1);
  });

  it("입력 순서와 무관하게 같은 결과를 낸다", () => {
    const dates = [daysAgo(1), daysAgo(3), daysAgo(2)];
    expect(computeLongestStreak(dates)).toBe(3);
    expect(computeLongestStreak([...dates].reverse())).toBe(3);
  });
});

describe("buildHeatmapWeeks", () => {
  it("요청한 주 수만큼 7일짜리 열을 만든다", () => {
    const weeks = buildHeatmapWeeks(new Map(), 13, TODAY);
    expect(weeks).toHaveLength(13);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it("해당 날짜의 학습량을 채우고 나머지는 0 으로 둔다", () => {
    const counts = new Map([[daysAgo(1), 7]]);
    const days = buildHeatmapWeeks(counts, 13, TODAY).flat();
    expect(days.find((d) => d.date === daysAgo(1))?.count).toBe(7);
    expect(days.find((d) => d.date === daysAgo(2))?.count).toBe(0);
  });

  it("오늘을 포함한 범위를 만든다", () => {
    const days = buildHeatmapWeeks(new Map(), 13, TODAY).flat();
    expect(days.some((d) => d.date === toDateString(TODAY))).toBe(true);
  });
});
