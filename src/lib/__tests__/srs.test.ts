import { describe, expect, it } from "vitest";
import { schedule, toDateString, type SrsState } from "../srs";

const TODAY = new Date("2026-08-22T10:00:00");

/** Reviews a fresh card `n` times with the given rating. */
function repeat(rating: Parameters<typeof schedule>[1], times: number) {
  let state: SrsState | null = null;
  for (let i = 0; i < times; i++) {
    state = schedule(state, rating, TODAY);
  }
  return state!;
}

describe("toDateString", () => {
  it("formats as YYYY-MM-DD in local time", () => {
    expect(toDateString(new Date("2026-01-05T23:00:00"))).toBe("2026-01-05");
  });
});

describe("schedule — 간격 증가", () => {
  it("첫 복습 'good'은 하루 뒤로 잡는다", () => {
    const next = schedule(null, "good", TODAY);
    expect(next.interval_days).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.status).toBe("review");
  });

  it("두 번째 'good'은 나흘 뒤로 잡는다", () => {
    const next = schedule(schedule(null, "good", TODAY), "good", TODAY);
    expect(next.interval_days).toBe(4);
  });

  it("세 번째부터는 ease 배수로 늘어난다", () => {
    const second = repeat("good", 2);
    const third = schedule(second, "good", TODAY);
    expect(third.interval_days).toBe(Math.round(second.interval_days * second.ease));
  });

  it("첫 복습이 'easy'면 'good'보다 멀리 잡는다", () => {
    expect(schedule(null, "easy", TODAY).interval_days).toBeGreaterThan(
      schedule(null, "good", TODAY).interval_days,
    );
  });

  it("간격은 난이도 순서(hard < good < easy)를 지킨다", () => {
    const base = repeat("good", 2);
    const hard = schedule(base, "hard", TODAY).interval_days;
    const good = schedule(base, "good", TODAY).interval_days;
    const easy = schedule(base, "easy", TODAY).interval_days;
    expect(hard).toBeLessThan(good);
    expect(good).toBeLessThan(easy);
  });

  it("due_date 는 간격만큼 미래로 계산된다", () => {
    const next = schedule(null, "good", TODAY);
    expect(next.due_date).toBe("2026-08-23");
  });
});

describe("schedule — 'again' 처리", () => {
  it("진도를 초기화하고 같은 날 다시 출제한다", () => {
    const next = schedule(repeat("good", 3), "again", TODAY);
    expect(next.interval_days).toBe(0);
    expect(next.repetitions).toBe(0);
    expect(next.status).toBe("learning");
    expect(next.due_date).toBe(toDateString(TODAY));
  });

  it("ease 를 낮춘다", () => {
    const before = repeat("good", 2);
    expect(schedule(before, "again", TODAY).ease).toBeLessThan(before.ease);
  });
});

describe("schedule — ease 경계", () => {
  it("반복 실패해도 ease 는 1.3 아래로 내려가지 않는다", () => {
    let state = schedule(null, "good", TODAY);
    for (let i = 0; i < 30; i++) state = schedule(state, "again", TODAY);
    expect(state.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("'easy' 는 ease 를 올린다", () => {
    const before = repeat("good", 2);
    expect(schedule(before, "easy", TODAY).ease).toBeGreaterThan(before.ease);
  });

  it("간격은 항상 최소 하루 이상이다", () => {
    for (const rating of ["hard", "good", "easy"] as const) {
      expect(schedule(null, rating, TODAY).interval_days).toBeGreaterThanOrEqual(1);
    }
  });
});
