import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lingo Daily — 매일 한 걸음 언어 학습",
  description:
    "플래시카드 간격 반복, 매일 문장 학습, 연속 학습 스트릭으로 꾸준히 외국어를 익히세요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="font-sans">{children}</body>
    </html>
  );
}
