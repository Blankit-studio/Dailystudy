import { getLanguages, getProfile } from "@/lib/data";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) return null;
  const languages = await getLanguages();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">설정</h1>
        <p className="mt-1 text-sm text-slate-500">
          학습 언어와 프로필을 관리하세요.
        </p>
      </div>
      <SettingsForm profile={profile} languages={languages} />
    </div>
  );
}
