"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "대시보드", icon: "🏠" },
  { href: "/study", label: "학습", icon: "🃏" },
  { href: "/sentences", label: "문장", icon: "💬" },
  { href: "/review", label: "오답", icon: "📌" },
  { href: "/stats", label: "통계", icon: "📊" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

export default function AppNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" aria-label="Daily Study 대시보드">
          <Logo
            responsiveWordmark
            markClassName="h-6 w-6"
            textClassName="text-base"
          />
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
                  active
                    ? "bg-brand/15 text-brand"
                    : "text-muted hover:bg-muted-bg hover:text-fg"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted md:inline">
            {displayName}님
          </span>
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-muted-bg hover:text-fg"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
