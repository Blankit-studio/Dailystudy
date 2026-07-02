"use client";

import { useSyncExternalStore } from "react";
import { speak } from "@/lib/speech";

const emptySubscribe = () => () => {};

/** True on clients that support the Web Speech API; false during SSR. */
function useSpeechSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => "speechSynthesis" in window,
    () => false,
  );
}

/** Small speaker button that reads `text` aloud in the target language. */
export default function SpeakButton({
  text,
  lang,
  className = "",
}: {
  text: string;
  lang: string;
  className?: string;
}) {
  const supported = useSpeechSupported();
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, lang);
      }}
      aria-label="발음 듣기"
      title="발음 듣기"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:bg-muted-bg hover:text-fg ${className}`}
    >
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.6 5.4a9 9 0 0 1 0 13.2" />
      </svg>
    </button>
  );
}
