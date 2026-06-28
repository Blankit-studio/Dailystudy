"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "대시보드", icon: "🏠" },
  { href: "/study", label: "학습", icon: "🃏" },
  { href: "/sentences", label: "문장", icon: "💬" },
  { href: "/stats", label: "통계", icon: "📊" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

export default function AppNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-base font-bold tracking-tight"
        >
          <span className="text-xl">🌱</span>
          <span className="hidden sm:inline">
            Lingo<span className="text-indigo-600">Daily</span>
          </span>
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
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 md:inline">
            {displayName}님
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
