# Daily Study

매일 한 걸음씩 외국어를 익히는 **데일리 언어 학습 사이트**입니다.
간격 반복(SRS) 플래시카드, 매일 문장·회화 학습, 연속 학습 스트릭과 진도 통계를
제공하며 여러 언어 쌍(한국어→영어, 한국어→일본어 등)을 지원합니다.

**스택:** Next.js (App Router) · Supabase (Auth + Postgres) · Vercel · Tailwind CSS

---

## ✨ 주요 기능

- 🃏 **스마트 플래시카드** — SM-2 기반 간격 반복 알고리즘으로 잊어버릴 때쯤 카드를 다시 보여줍니다. `다시 / 어려움 / 알맞음 / 쉬움` 4단계 평가.
- 💬 **매일 문장·회화** — 실제로 쓰는 표현을 발음 읽기·뜻과 함께 학습합니다.
- 🔥 **스트릭 & 통계** — 연속 학습일, 최장 스트릭, 13주 학습 히트맵을 제공합니다.
- 🌍 **다국어 지원** — 출발어/목표어 조합을 자유롭게 선택할 수 있는 범용 구조.
- 🔐 **Supabase Auth** — 이메일/비밀번호 · 매직 링크 · Google 로그인, 진도는 DB에 안전하게 저장(RLS 적용).

---

## 🚀 빠른 시작 (로컬)

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. **Project Settings → API**에서 다음 값을 복사합니다.
   - `Project URL`
   - `anon` `public` 키

### 2. 데이터베이스 스키마 & 시드 적용

Supabase 대시보드의 **SQL Editor**에서 아래 두 파일을 순서대로 실행합니다.

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — 테이블, 인덱스, RLS 정책, 신규 가입 시 프로필 자동 생성 트리거
2. [`supabase/seed.sql`](supabase/seed.sql) — 언어 목록과 학습 콘텐츠(영어/일본어 단어·문장)

> Supabase CLI를 쓴다면: `supabase db reset` 또는 `supabase db push` 후 `psql ... -f supabase/seed.sql`

### 3. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. 실행

```bash
npm install
npm run dev
```

→ http://localhost:3000

> 💡 **이메일 확인 없이 바로 테스트하려면:** Supabase 대시보드 **Authentication → Sign In / Providers → Email**에서
> *Confirm email* 옵션을 끄면 회원가입 직후 바로 로그인됩니다. (운영 시에는 켜두고 SMTP를 설정하세요.)

---

## ▲ Vercel 배포

1. 이 저장소를 GitHub에 푸시한 뒤 [Vercel](https://vercel.com)에서 **Import**합니다.
2. **Environment Variables**에 아래 두 값을 추가합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**. Next.js는 자동 감지되며 `npm run build`로 빌드됩니다.

### 인증 리다이렉트 URL 등록

Supabase 대시보드 **Authentication → URL Configuration**에 배포 도메인을 등록하세요.

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:**
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/auth/confirm`
  - 로컬 개발용 `http://localhost:3000/**` 도 함께 추가

---

## 🔑 Google 로그인 설정 (선택)

로그인 화면의 **"Google로 계속하기"** 버튼을 쓰려면 Google·Supabase 양쪽 설정이 필요합니다.
(설정 전에는 버튼을 눌러도 동작하지 않습니다.)

### 1. Google Cloud에서 OAuth 자격 증명 만들기

1. [Google Cloud Console](https://console.cloud.google.com/) → 프로젝트 생성/선택
2. **APIs & Services → OAuth consent screen** 구성 (External, 앱 이름·이메일 입력)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized redirect URIs**에 Supabase 콜백 주소 추가:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
     (이 주소는 Supabase **Authentication → Sign In / Providers → Google** 화면에도 안내됩니다)
4. 생성된 **Client ID**와 **Client Secret**을 복사

### 2. Supabase에 Google provider 등록

1. Supabase 대시보드 **Authentication → Sign In / Providers → Google**
2. **Google enabled** 켜기 → 위에서 복사한 **Client ID / Client Secret** 붙여넣기 → 저장

### 3. 리다이렉트 URL 확인

위 "인증 리다이렉트 URL 등록"의 `…/auth/callback` 주소들이 Supabase에 등록되어 있으면 됩니다.
앱은 `redirectTo`를 `/auth/callback`으로 지정하고, 해당 라우트가 코드 교환 후 대시보드로 보냅니다.

> 흐름: 버튼 클릭 → Google 동의 화면 → `…supabase.co/auth/v1/callback` → 앱 `/auth/callback?code=…` → 세션 생성 → `/dashboard`

---

## 🔄 매일 AI 콘텐츠 자동 생성

매일 정해진 시간에 **무료 Google Gemini**가 새 단어 카드와 예문을 생성해
Supabase에 자동으로 추가합니다. 새 카드는 플래시카드의 신규 카드 큐(SRS)로,
새 문장은 문장 페이지 상단으로 자동 반영됩니다.

### 동작 방식
- `/api/cron/generate` 라우트가 활성 언어쌍마다 카드 4개 + 문장 3개를 생성합니다.
- **Vercel Cron**이 매일 06:00(KST, = 21:00 UTC)에 호출합니다 (`vercel.json`).
- 오늘 이미 생성한 언어쌍은 건너뛰고, 기존 단어/문장과 중복도 피합니다.

### 설정
1. **무료 Gemini API 키** 발급 (카드 불필요): <https://aistudio.google.com/apikey>
2. **Supabase service_role 키** 복사: Project Settings → API → `service_role`
3. **마이그레이션 실행**: SQL Editor에서 `supabase/migrations/0002_daily_content.sql`
4. 환경 변수 추가 (로컬 `.env.local` **그리고** Vercel 둘 다):
   - `GEMINI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ← **절대 브라우저에 노출 금지** (서버 전용)
   - `CRON_SECRET` (임의의 긴 문자열)
   - (선택) `GEMINI_MODEL` — 기본값 `gemini-2.5-flash`, 더 가벼운 `gemini-2.5-flash-lite`

> Vercel Cron은 **프로덕션 배포**에서만 동작하며, `CRON_SECRET`을 설정하면
> 호출 시 `Authorization: Bearer <CRON_SECRET>` 헤더를 자동으로 붙여 보냅니다.

### 수동 테스트
배포 후(또는 로컬 `npm run dev`) 아래로 즉시 생성해볼 수 있어요:

```bash
curl "https://<앱>.vercel.app/api/cron/generate?secret=<CRON_SECRET>&force=1"
```

`force=1`은 "오늘 이미 생성됨" 건너뛰기를 무시합니다. 응답 JSON에 언어쌍별 생성
개수가 표시되고, 키가 틀리면 Gemini 오류 메시지가 그대로 나와 디버깅이 쉽습니다.

### 전체 초기화 (수동, 1회용)
기존 콘텐츠를 **모두 지우고** 새 분량으로 다시 시작하고 싶을 때 사용합니다.
모든 단어·문장을 삭제하고(플래시카드 SRS 진행도 함께 초기화) AI로 더 넉넉한
새 배치를 생성합니다. **되돌릴 수 없으니** 비밀키 + `confirm=1` 이중 확인이 필요합니다.

```bash
curl "https://<앱>.vercel.app/api/admin/reset?secret=<CRON_SECRET>&confirm=1"
```

- 기본 생성량: 언어쌍별 **단어 12개 + 문장 8개** (`&cards=`, `&sentences=`로 조정)
- 연속 학습일(스트릭) 기록까지 지우려면 `&logs=1` 추가
- `confirm=1`이 없으면 안전을 위해 실행되지 않습니다.
- 초기화 직전 데이터는 **AI 요약 리포트**로 통계 페이지에 자동 저장됩니다(아래 참고).

## 🧠 AI 리포트 (초기화 요약 · 주간 분석)

학습 통계 페이지(`/stats`)의 **AI 리포트** 섹션에서 확인합니다. (마이그레이션
`supabase/migrations/0003_reports.sql` 실행 필요)

- **초기화 요약**: 전체 초기화(`/api/admin/reset`) 실행 시, 지워지기 직전의
  누적 학습 데이터를 AI가 짧게 정리해 전역 리포트로 남깁니다.
- **주간 분석**: 매주 일요일 **Vercel Cron**(`/api/cron/weekly`, 일 15:00 UTC =
  월 00:00 KST)이 사용자별 지난 7일 학습을 AI로 분석해 리포트를 생성합니다.

수동으로 주간 리포트를 만들어 보려면:

```bash
curl "https://<앱>.vercel.app/api/cron/weekly?secret=<CRON_SECRET>&force=1"
```

> Vercel Hobby 플랜은 Cron 개수에 제한이 있을 수 있습니다. 두 cron(`generate`,
> `weekly`)이 거부되면 하나로 합치거나 플랜을 올리면 됩니다.

---

## 🗂️ 프로젝트 구조

```
src/
├─ app/
│  ├─ page.tsx                 # 랜딩 페이지
│  ├─ login/                   # 로그인 / 회원가입 / 매직 링크
│  ├─ auth/                    # callback · confirm · signout 라우트 핸들러
│  └─ (app)/                   # 인증이 필요한 영역 (공통 네비게이션 레이아웃)
│     ├─ dashboard/            # 오늘의 요약 · 스트릭 · 바로가기
│     ├─ study/                # 플래시카드 SRS 학습 세션
│     ├─ sentences/            # 매일 문장·회화
│     ├─ stats/                # 학습 통계 + 히트맵
│     └─ settings/             # 학습 언어/프로필 설정
├─ components/                 # AppNav, StudySession, SentenceViewer 등
├─ lib/
│  ├─ supabase/                # 브라우저/서버 클라이언트 + 세션 헬퍼
│  ├─ srs.ts                   # SM-2 간격 반복 스케줄러
│  ├─ stats.ts                 # 스트릭/히트맵 계산
│  ├─ data.ts                  # 서버 데이터 조회
│  ├─ actions.ts               # 서버 액션(복습 기록, 설정 저장 등)
│  └─ types.ts                 # 공용 타입
└─ proxy.ts                    # 세션 갱신 + 보호 라우트 (Next 16 proxy 컨벤션)

supabase/
├─ migrations/0001_init.sql    # 스키마 · RLS · 트리거
└─ seed.sql                    # 언어 · 카드 · 문장 시드 데이터
```

---

## 🧠 SRS(간격 반복) 동작 방식

`src/lib/srs.ts`의 `schedule()`는 SM-2를 변형한 스케줄러입니다.

| 평가 | 동작 |
| --- | --- |
| **다시** | 진도 초기화, 같은 세션에서 다시 등장 (ease −0.2) |
| **어려움** | 간격을 작게 증가, ease −0.15 |
| **알맞음** | 현재 ease 계수로 표준 증가 |
| **쉬움** | 보너스 간격 + ease +0.15 |

복습할 때마다 다음 `due_date`가 계산되어 `user_cards`에 저장되고, 그날의 학습 활동은
`study_logs`에 기록되어 스트릭과 통계에 반영됩니다.

---

## 🌐 학습 콘텐츠 추가하기

새 단어/문장은 Supabase에 직접 추가하면 됩니다.

```sql
-- 새 덱
insert into decks (title, source_lang, target_lang, level)
values ('비즈니스 영어', 'ko', 'en', 'advanced');

-- 새 카드 (위 덱의 id 사용)
insert into cards (deck_id, term, meaning, example, example_meaning)
values ('<deck-id>', 'deadline', '마감 기한', 'The deadline is Friday.', '마감은 금요일이에요.');

-- 새 문장
insert into sentences (source_lang, target_lang, text_target, text_source, day_index)
values ('ko', 'en', 'Let me get back to you.', '다시 연락드릴게요.', 13);
```

새 언어 쌍을 추가하려면 `languages`에 코드를 넣고, 해당 조합의 `decks`/`cards`/`sentences`를
채운 뒤 설정 페이지에서 선택하면 됩니다.

---

## 📜 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |
