import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Study — 매일 한 걸음 언어 학습",
  description:
    "플래시카드 간격 반복, 매일 문장 학습, 연속 학습 스트릭으로 꾸준히 외국어를 익히세요.",
};

// Applies the saved (or system) theme before paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
