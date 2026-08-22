import { describe, expect, it } from "vitest";
import {
  DEFAULT_EASE,
  difficultyLevel,
  estimatedLapses,
  isDifficult,
  sortByDifficulty,
} from "../difficulty";
import { schedule } from "../srs";

describe("isDifficult", () => {
  it("한 번도 틀리지 않은 카드는 제외한다", () => {
    expect(isDifficult(DEFAULT_EASE)).toBe(false);
    expect(isDifficult(2.65)).toBe(false); // 'easy' 로 ease 가 오른 경우
  });

  it("ease 가 떨어진 카드는 포함한다", () => {
    expect(isDifficult(2.3)).toBe(true);
    expect(isDifficult(1.3)).toBe(true);
  });

  it("실제 스케줄러가 낮춘 ease 를 어려운 카드로 판정한다", () => {
    const afterAgain = schedule(null, "again", new Date());
    expect(isDifficult(afterAgain.ease)).toBe(true);
  });
});

describe("difficultyLevel", () => {
  it("ease 가 낮을수록 높은 난이도로 분류한다", () => {
    expect(difficultyLevel(1.3)).toBe("high");
    expect(difficultyLevel(2.0)).toBe("medium");
    expect(difficultyLevel(2.4)).toBe("low");
  });

  it("경계값을 포함해서 분류한다", () => {
    expect(difficultyLevel(1.7)).toBe("high");
    expect(difficultyLevel(2.1)).toBe("medium");
  });
});

describe("estimatedLapses", () => {
  it("정상 카드는 0 이다", () => {
    expect(estimatedLapses(DEFAULT_EASE)).toBe(0);
  });

  it("ease 하락폭에 비례해 늘어난다", () => {
    expect(estimatedLapses(2.3)).toBe(1);
    expect(estimatedLapses(1.9)).toBe(3);
  });

  it("조금이라도 떨어졌으면 최소 1 로 센다", () => {
    expect(estimatedLapses(2.45)).toBe(1);
  });
});

describe("sortByDifficulty", () => {
  it("가장 어려운 카드를 앞으로 보낸다", () => {
    const sorted = sortByDifficulty([{ ease: 2.4 }, { ease: 1.4 }, { ease: 2.0 }]);
    expect(sorted.map((c) => c.ease)).toEqual([1.4, 2.0, 2.4]);
  });

  it("원본 배열을 바꾸지 않는다", () => {
    const input = [{ ease: 2.4 }, { ease: 1.4 }];
    sortByDifficulty(input);
    expect(input[0].ease).toBe(2.4);
  });
});
