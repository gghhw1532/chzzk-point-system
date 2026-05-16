import AdminSettingsForm from "@/components/AdminSettingsForm";
import { supabase } from "@/lib/supabase";

export default async function AdminSettingsPage() {
  const { data: settings } = await supabase
    .from("system_settings")
    .select("*")
    .order("key");

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-violet-100">SYSTEM SETTINGS</p>

        <h1 className="mt-2 text-4xl font-black">운영 설정</h1>

        <p className="mt-2 text-sm text-violet-100">
          포인트 지급 규칙과 자동 보상 값을 관리합니다.
        </p>
      </section>

      <div className="mt-6">
        <AdminSettingsForm settings={settings ?? []} />
      </div>
    </>
  );
}