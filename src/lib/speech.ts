/** Maps our language codes to BCP-47 tags for the Web Speech API. */
const BCP47: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  ru: "ru-RU",
  vi: "vi-VN",
  th: "th-TH",
  id: "id-ID",
};

export function toBcp47(code: string): string {
  return BCP47[code] ?? code;
}

/** Speaks `text` in the given language using the browser's built-in TTS. */
export function speak(text: string, langCode: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = toBcp47(langCode);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch {
    // TTS is best-effort; ignore unsupported environments.
  }
}
