# Daily Study — 프로젝트 가이드

매일 언어를 학습하는 웹앱. **Next.js(App Router) + Supabase + Vercel**,
콘텐츠와 리포트는 **Google Gemini(무료 티어)** 로 생성한다.

## 명령어

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드 — 커밋 전 반드시 통과시킬 것
npm run lint    # ESLint (flat config)
```

컨테이너가 새로 뜨면 `node_modules`가 없다 → `npm ci` 로 복원한다.
빌드만 확인할 때는 `.env.local`에 placeholder 값만 넣어도 통과한다.

## 구조

```
src/app/            라우트 (랜딩 · /login · /auth/* · (app)/* 보호 영역 · /api/*)
src/components/     UI 컴포넌트
src/lib/            도메인 로직
  ├ srs.ts            SM-2 기반 간격 반복 스케줄러 (순수 함수)
  ├ stats.ts          스트릭·히트맵 계산 (순수 함수)
  ├ data.ts           서버 조회 (RLS 적용된 사용자 클라이언트)
  ├ actions.ts        서버 액션 (복습 기록, 설정 저장)
  ├ contentActions.ts 사용자 트리거 콘텐츠 생성
  ├ generateContent.ts AI 콘텐츠 생성 (카드·문장)
  ├ reports.ts        AI 리포트 (초기화 요약 · 주간 분석)
  ├ gemini.ts         Gemini 호출 래퍼 — 프로바이더 종속 코드는 여기에만
  └ supabase/         client(브라우저) · server(SSR) · admin(service-role) · middleware
src/proxy.ts        세션 갱신 + 보호 라우트 가드 (Next 16의 middleware 후속 규약)
supabase/migrations/ 스키마 (번호 순서대로 실행)
```

## 규칙

- **Supabase 클라이언트 3종을 구분한다.**
  `supabase/client.ts`(브라우저) · `server.ts`(서버, RLS 적용) ·
  `admin.ts`(service-role, **RLS 우회 — 서버 전용, 절대 클라이언트에서 import 금지**).
  cron/admin 라우트와 콘텐츠 생성만 admin을 쓴다.
- **색은 시맨틱 토큰만 사용한다.** `bg-surface` · `text-fg` · `text-muted` ·
  `border-line` · `text-brand` 등 (`globals.css`의 `@theme` + CSS 변수).
  `bg-zinc-900` 같은 하드코딩은 라이트/다크 한쪽에서 깨진다.
- **다국어는 데이터 기반이다.** 언어를 늘릴 때 코드를 고치지 않는다 —
  `languages` 테이블에 행을 추가하면 설정에 노출되고 AI 생성기가 이름을 읽어 쓴다.
  (`speech.ts`의 BCP-47 맵에만 발음용 코드를 추가하면 TTS도 동작한다.)
- **레벨 필터를 빠뜨리지 않는다.** 카드/문장 조회는 항상
  `source_lang` + `target_lang` + `level` 세 조건으로 건다.
- 커밋 전 `npm run build && npm run lint` 를 통과시킨다.

## 환경 변수

| 변수 | 필수 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | |
| `SUPABASE_SERVICE_ROLE_KEY` | AI 기능 | **서버 전용**, 브라우저 노출 금지 |
| `GEMINI_API_KEY` | AI 기능 | https://aistudio.google.com/apikey (무료) |
| `CRON_SECRET` | cron 보호 | 임의의 긴 문자열. Vercel Cron이 Bearer로 전송 |
| `GEMINI_MODEL` | 선택 | 기본 `gemini-2.5-flash` |

## 마이그레이션 (번호 순서대로 실행)

| 파일 | 내용 |
|---|---|
| `0001_init` | 기본 스키마 · RLS · 가입 시 프로필 생성 트리거 |
| `0002_daily_content` | `cards.created_at/origin`, `sentences.origin/for_date` |
| `0003_reports` | `reports` 테이블 + RLS |
| `0004_more_languages` | 언어 7종 추가 (총 13개) |
| `0005_levels` | `profiles.learning_level` + 기존 콘텐츠 레벨 정리 |

> **마이그레이션 누락은 이 프로젝트에서 가장 흔한 장애 원인이다.**
> 예: `0005` 미적용 → "column profiles.learning_level does not exist" →
> AI 생성 버튼이 실패한다. 앱 오류를 만나면 스키마 적용 여부를 먼저 확인할 것.

## 자동화 (`vercel.json`)

- `/api/cron/generate` — 매일 21:00 UTC(06:00 KST), 활성 (언어쌍 + 레벨) 조합별 콘텐츠 생성
- `/api/cron/weekly` — 매주 일 15:00 UTC(월 00:00 KST), 사용자별 주간 AI 리포트
- `/api/admin/reset` — 수동 전체 초기화 (`secret` + `confirm=1` 필요, 파괴적)

수동 실행: `curl "https://<앱>/api/cron/generate?secret=<CRON_SECRET>&force=1"`

## 배포

Vercel + GitHub 연동. 브랜치 `claude/daily-language-learning-site-yj8ro0`.
환경 변수를 추가/변경하면 **재배포해야 반영된다.**
Supabase Auth의 Redirect URL에 배포 도메인의 `/auth/callback`, `/auth/confirm`을 등록한다.

## 알려진 주의점

- Google 로그인은 Google Cloud의 OAuth 콜백을 **Supabase 주소**
  (`https://<ref>.supabase.co/auth/v1/callback`)로 등록한다 — 앱 주소가 아니다.
- `gemini-2.0-flash`는 2026-06-01 종료. 기본값은 `gemini-2.5-flash`.
- Vercel Hobby 플랜은 cron 개수 제한이 있을 수 있다.
