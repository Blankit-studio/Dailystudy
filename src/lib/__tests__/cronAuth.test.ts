import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isCronAuthorized } from "../cronAuth";

const SECRET = "s3cret-value";

function request(opts: { secret?: string; bearer?: string } = {}) {
  const url = opts.secret
    ? `https://app.example.com/api/cron/generate?secret=${opts.secret}`
    : "https://app.example.com/api/cron/generate";
  return new Request(url, {
    headers: opts.bearer ? { authorization: `Bearer ${opts.bearer}` } : {},
  });
}

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isCronAuthorized — secret 이 설정된 경우", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", SECRET);
  });

  it("Bearer 헤더가 맞으면 통과한다 (Vercel Cron 방식)", () => {
    expect(isCronAuthorized(request({ bearer: SECRET }))).toBe(true);
  });

  it("쿼리 파라미터가 맞으면 통과한다 (수동 실행)", () => {
    expect(isCronAuthorized(request({ secret: SECRET }))).toBe(true);
  });

  it("secret 이 틀리면 거부한다", () => {
    expect(isCronAuthorized(request({ secret: "wrong" }))).toBe(false);
    expect(isCronAuthorized(request({ bearer: "wrong" }))).toBe(false);
  });

  it("secret 이 없으면 거부한다", () => {
    expect(isCronAuthorized(request())).toBe(false);
  });
});

describe("isCronAuthorized — secret 미설정 (환경 변수 누락)", () => {
  it("프로덕션에서는 거부한다 (fail-closed)", () => {
    // 회귀 방지: 예전에는 통과시켜서 /api/admin/reset 이 무방비였다.
    vi.stubEnv("NODE_ENV", "production");
    expect(isCronAuthorized(request())).toBe(false);
    expect(isCronAuthorized(request({ secret: "anything" }))).toBe(false);
  });

  it("개발 환경에서는 통과시킨다 (로컬 편의)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isCronAuthorized(request())).toBe(true);
  });
});
