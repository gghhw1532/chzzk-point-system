import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";
import PurchaseButton from "@/components/PurchaseButton";

export default async function ShopPage() {
const { data: items } = await supabase
  .from("shop_items")
  .select("*")
  .eq("is_active", true)
  .order("created_at", { ascending: false });

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">포인트 상점</h1>

      <p className="mt-2 text-sm text-gray-500">
        포인트를 사용해 방송 미션을 구매할 수 있어요.
      </p>

      <div className="mt-6 grid gap-4">
        {items?.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">{item.name}</p>

                <p className="mt-1 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>

              <p className="font-bold">{item.price}P</p>
            </div>

            <PurchaseButton itemId={item.id} />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}