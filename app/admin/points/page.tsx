import AdminPointForm from "@/components/AdminPointForm";
import { supabase } from "@/lib/supabase";

export default async function AdminPointsPage() {
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("points", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-8">
      <h1 className="text-3xl font-black">포인트 관리</h1>

      <div className="mt-6">
        <AdminPointForm users={users ?? []} />
      </div>
    </main>
  );
}