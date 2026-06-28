import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="mx-auto w-full max-w-6xl px-6 py-5">
        <Link href="/" aria-label="Daily Study 홈">
          <Logo markClassName="h-7 w-7" textClassName="text-lg" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
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
