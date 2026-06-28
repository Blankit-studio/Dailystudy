import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import AppNav from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav displayName={profile.display_name ?? "학습자"} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
