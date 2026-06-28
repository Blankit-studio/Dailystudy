# 🌱 Lingo Daily

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
