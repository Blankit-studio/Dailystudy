"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

const inputClass =
  "w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-sm text-fg placeholder-subtle outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectedFrom = params.get("redirectedFrom") || "/dashboard";
  const initialMode: Mode =
    params.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(
              redirectedFrom,
            )}`,
          },
        });
        if (error) throw error;
        setNotice("로그인 링크를 이메일로 보냈어요. 메일함을 확인하세요.");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || null } },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice(
            "확인 이메일을 보냈어요. 메일의 링크를 눌러 가입을 완료하세요. (Supabase에서 이메일 확인을 꺼두면 바로 로그인됩니다.)",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      router.push(redirectedFrom);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "문제가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          redirectedFrom,
        )}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success the browser is redirected to Google; nothing else to do here.
  }

  const tabs: { key: Mode; label: string }[] = [
    { key: "signin", label: "로그인" },
    { key: "signup", label: "회원가입" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-xl shadow-black/5 dark:shadow-black/40">
      <h1 className="text-center text-2xl font-bold text-fg">
        {mode === "signup" ? "계정 만들기" : "다시 오신 걸 환영해요"}
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        {mode === "signup"
          ? "무료로 가입하고 오늘부터 학습을 시작하세요."
          : "학습을 이어가려면 로그인하세요."}
      </p>

      {mode !== "magic" && (
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted-bg p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setMode(t.key);
                setError(null);
                setNotice(null);
              }}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                mode === t.key
                  ? "bg-surface text-brand shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-60"
      >
        <GoogleIcon />
        Google로 계속하기
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-subtle">또는 이메일로</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              이름 (선택)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="홍길동"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-muted">
            이메일
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        {mode !== "magic" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              비밀번호
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className={inputClass}
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-brand/20 bg-brand/10 px-3.5 py-2.5 text-sm text-brand">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading
            ? "처리 중…"
            : mode === "signup"
              ? "가입하기"
              : mode === "magic"
                ? "로그인 링크 받기"
                : "로그인"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm">
        {mode === "magic" ? (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="text-brand transition hover:text-brand-dark"
          >
            비밀번호로 로그인하기
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("magic");
              setError(null);
              setNotice(null);
            }}
            className="text-brand transition hover:text-brand-dark"
          >
            비밀번호 없이 이메일 링크로 로그인
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
