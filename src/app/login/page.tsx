import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="mx-auto w-full max-w-6xl px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="text-2xl">🌱</span>
          <span>
            Lingo<span className="text-indigo-600">Daily</span>
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-400 shadow-sm">
                불러오는 중…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
