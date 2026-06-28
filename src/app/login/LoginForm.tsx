"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

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

  const tabs: { key: Mode; label: string }[] = [
    { key: "signin", label: "로그인" },
    { key: "signup", label: "회원가입" },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold text-slate-900">
        {mode === "signup" ? "계정 만들기" : "다시 오신 걸 환영해요"}
      </h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        {mode === "signup"
          ? "무료로 가입하고 오늘부터 학습을 시작하세요."
          : "학습을 이어가려면 로그인하세요."}
      </p>

      {mode !== "magic" && (
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
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
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              이름 (선택)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {mode !== "magic" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
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
            className="text-indigo-600 hover:underline"
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
            className="text-indigo-600 hover:underline"
          >
            비밀번호 없이 이메일 링크로 로그인
          </button>
        )}
      </div>
    </div>
  );
}
