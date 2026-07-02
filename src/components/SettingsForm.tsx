"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/lib/actions";
import type { Language, Profile } from "@/lib/types";

const PRESETS = [
  { s: "ko", t: "en", label: "🇰🇷 → 🇺🇸 영어" },
  { s: "ko", t: "ja", label: "🇰🇷 → 🇯🇵 일본어" },
  { s: "ko", t: "zh", label: "🇰🇷 → 🇨🇳 중국어" },
  { s: "ko", t: "es", label: "🇰🇷 → 🇪🇸 스페인어" },
  { s: "en", t: "ja", label: "🇺🇸 → 🇯🇵 일본어" },
];

const LEVELS = [
  { value: "beginner", label: "초급", desc: "기초 단어·짧은 문장" },
  { value: "intermediate", label: "중급", desc: "일상 회화 수준" },
  { value: "advanced", label: "고급", desc: "관용구·복잡한 표현" },
];

export default function SettingsForm({
  profile,
  languages,
}: {
  profile: Profile;
  languages: Language[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState(profile.learning_source_lang);
  const [target, setTarget] = useState(profile.learning_target_lang);
  const [level, setLevel] = useState(profile.learning_level ?? "beginner");

  function onSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateSettings(formData);
      setSaved(true);
      router.refresh();
    });
  }

  const sameLang = source === target;
  const fieldClass =
    "w-full rounded-lg border border-line bg-input px-3.5 py-2.5 text-sm text-fg placeholder-subtle outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <form action={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-bold text-fg">프로필</h2>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-muted">
            이름
          </label>
          <input
            name="display_name"
            type="text"
            defaultValue={profile.display_name ?? ""}
            placeholder="홍길동"
            className={fieldClass}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-bold text-fg">학습 언어</h2>
        <p className="mt-1 text-sm text-muted">
          어떤 언어를 사용해 어떤 언어를 배울지 선택하세요.
        </p>

        {/* Popular pairs quick-select */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = source === p.s && target === p.t;
            return (
              <button
                key={`${p.s}-${p.t}`}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSource(p.s);
                  setTarget(p.t);
                }}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-line text-muted hover:bg-muted-bg hover:text-fg"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              내 언어 (출발어)
            </label>
            <select
              name="source_lang"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={fieldClass}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name_ko}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              배울 언어 (목표어)
            </label>
            <select
              name="target_lang"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={fieldClass}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name_ko}
                </option>
              ))}
            </select>
          </div>
        </div>
        {sameLang && (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-sm text-amber-700 dark:text-amber-300">
            출발어와 목표어가 같아요. 서로 다른 언어를 선택해주세요.
          </p>
        )}
        <p className="mt-3 text-xs text-subtle">
          어떤 언어 쌍이든 선택할 수 있어요. 콘텐츠가 없으면 학습·문장 화면에서
          AI로 바로 생성하고, 매일 자동으로도 새 콘텐츠가 추가됩니다.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-bold text-fg">난이도</h2>
        <p className="mt-1 text-sm text-muted">
          선택한 난이도에 맞춰 학습 카드·문장이 필터링되고, AI도 그 수준으로
          새 콘텐츠를 생성합니다.
        </p>
        <input type="hidden" name="learning_level" value={level} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {LEVELS.map((l) => {
            const active = level === l.value;
            return (
              <button
                key={l.value}
                type="button"
                aria-pressed={active}
                onClick={() => setLevel(l.value)}
                className={`rounded-xl border px-3 py-3 text-center transition ${
                  active
                    ? "border-brand bg-brand/10"
                    : "border-line hover:bg-muted-bg"
                }`}
              >
                <div
                  className={`text-sm font-bold ${active ? "text-brand" : "text-fg"}`}
                >
                  {l.label}
                </div>
                <div className="mt-0.5 text-[11px] text-subtle">{l.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || sameLang}
          className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isPending ? "저장 중…" : "저장하기"}
        </button>
        {saved && !isPending && (
          <span className="text-sm text-brand">저장되었습니다 ✓</span>
        )}
      </div>
    </form>
  );
}
