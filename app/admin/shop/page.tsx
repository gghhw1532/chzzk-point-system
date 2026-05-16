import AdminCreateItemForm from "@/components/AdminCreateItemForm";
import AdminShopItemList from "@/components/AdminShopItemList";
import { supabase } from "@/lib/supabase";

export default async function AdminShopPage() {
  const { data: items } = await supabase
    .from("shop_items")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-8">
      <h1 className="text-3xl font-black">상점 관리</h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
        <AdminCreateItemForm />
        <AdminShopItemList items={items ?? []} />
      </div>
    </main>
  );
}