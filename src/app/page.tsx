import Link from "next/link";
import { getUser } from "@/lib/data";

const FEATURES = [
  {
    icon: "🃏",
    title: "스마트 플래시카드",
    desc: "SM-2 기반 간격 반복(SRS) 알고리즘이 잊어버릴 때쯤 카드를 다시 보여줘 가장 효율적으로 암기시켜요.",
  },
  {
    icon: "💬",
    title: "매일 문장·회화",
    desc: "실제로 쓰는 표현을 매일 한 세트씩. 발음 읽기와 뜻을 함께 보며 자연스러운 문장을 익혀요.",
  },
  {
    icon: "🔥",
    title: "스트릭 & 진도 통계",
    desc: "연속 학습일을 쌓고 히트맵으로 한눈에 진도를 확인하세요. 꾸준함이 실력이 됩니다.",
  },
];

const LANGUAGES = [
  { flag: "🇺🇸", name: "영어" },
  { flag: "🇯🇵", name: "일본어" },
  { flag: "🇨🇳", name: "중국어" },
  { flag: "🇪🇸", name: "스페인어" },
  { flag: "🇫🇷", name: "프랑스어" },
];

export default async function Home() {
  const user = await getUser();
  const primaryHref = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "대시보드로 이동" : "무료로 시작하기";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-2xl">🌱</span>
          <span>
            Lingo<span className="text-indigo-600">Daily</span>
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm font-medium">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
              대시보드
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:text-slate-900"
              >
                로그인
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-full bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
              >
                시작하기
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
            🔥 매일 5분, 꾸준함의 힘
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            매일 한 걸음씩,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              외국어가 습관이 됩니다
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            간격 반복 플래시카드와 매일 문장 학습, 그리고 연속 학습 스트릭으로
            지치지 않고 꾸준히 언어를 익히세요. 영어·일본어·중국어 등 여러
            언어를 지원합니다.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="w-full rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:w-auto"
            >
              {primaryLabel}
            </Link>
            <a
              href="#features"
              className="w-full rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-300 sm:w-auto"
            >
              기능 살펴보기
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {LANGUAGES.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                <span className="text-lg">{l.flag}</span>
                {l.name}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-12 text-center text-white sm:px-16">
            <h2 className="text-2xl font-bold sm:text-3xl">
              오늘 바로 시작하는 3단계
            </h2>
            <div className="mt-10 grid gap-8 text-left sm:grid-cols-3">
              {[
                ["1", "학습 언어 선택", "배우고 싶은 언어 쌍을 고르세요."],
                ["2", "매일 카드 복습", "오늘의 단어와 문장을 학습하세요."],
                ["3", "스트릭 쌓기", "연속 학습일을 늘려가며 습관을 만드세요."],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                    {n}
                  </div>
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-indigo-100">{d}</p>
                </div>
              ))}
            </div>
            <Link
              href={primaryHref}
              className="mt-10 inline-block rounded-full bg-white px-8 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              {primaryLabel}
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-slate-400">
        <p>
          Lingo Daily · Next.js + Supabase로 만든 데일리 언어 학습 사이트
        </p>
      </footer>
    </div>
  );
}
