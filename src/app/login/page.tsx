import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Daily Study 홈">
          <Logo markClassName="h-7 w-7" textClassName="text-lg" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-line bg-surface p-8 text-center text-subtle">
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
