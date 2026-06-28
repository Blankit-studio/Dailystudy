"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/lib/actions";
import type { Language, Profile } from "@/lib/types";

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

  function onSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateSettings(formData);
      setSaved(true);
      router.refresh();
    });
  }

  const sameLang = source === target;
  const selectClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <form action={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-bold text-white">프로필</h2>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            이름
          </label>
          <input
            name="display_name"
            type="text"
            defaultValue={profile.display_name ?? ""}
            placeholder="홍길동"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-bold text-white">학습 언어</h2>
        <p className="mt-1 text-sm text-zinc-400">
          어떤 언어를 사용해 어떤 언어를 배울지 선택하세요.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              내 언어 (출발어)
            </label>
            <select
              name="source_lang"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={selectClass}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name_ko}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              배울 언어 (목표어)
            </label>
            <select
              name="target_lang"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={selectClass}
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
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-sm text-amber-300">
            출발어와 목표어가 같아요. 서로 다른 언어를 선택해주세요.
          </p>
        )}
        <p className="mt-3 text-xs text-zinc-500">
          현재 콘텐츠가 준비된 조합: 한국어 → 영어, 한국어 → 일본어
        </p>
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
          <span className="text-sm text-brand-light">저장되었습니다 ✓</span>
        )}
      </div>
    </form>
  );
}
