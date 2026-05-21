import PageContainer from "@/components/PageContainer";
import PurchaseButton from "@/components/PurchaseButton";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const user = await getCurrentUser();

  const { data: items } = await supabase
    .from("shop_items")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <PageContainer>
      <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-sm">
        <p className="text-sm font-bold text-white/70">POINT SHOP</p>

        <h1 className="mt-3 text-3xl font-black">포인트 상점</h1>

        <p className="mt-3 text-sm text-white/80">
          포인트를 사용해 방송 미션을 구매할 수 있어요.
        </p>

        <div className="mt-6 rounded-2xl bg-white/15 p-4 backdrop-blur">
          <p className="text-sm text-white/70">내 보유 포인트</p>
          <p className="mt-1 text-3xl font-black">
            {user ? `${Number(user.points ?? 0).toLocaleString()}P` : "로그인 필요"}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black">구매 가능한 상품</h2>
            <p className="mt-1 text-sm text-gray-500">
              방송에서 사용할 수 있는 미션 목록이에요.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600">
            {items?.length ?? 0}개
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items && items.length > 0 ? (
            items.map((item: any) => (
              <article
                key={item.id}
                className="group rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {item.daily_purchase_limit ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
                          하루 {item.daily_purchase_limit}회 한정
                        </span>
                      ) : (
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                          상시 구매
                        </span>
                      )}

                      {item.cooldown_seconds > 0 ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                          쿨타임 {item.cooldown_seconds}초
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-xl font-black">{item.name}</h3>

                    <p className="mt-2 min-h-[42px] text-sm leading-6 text-gray-500">
                      {item.description || "설명이 없는 상품입니다."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black px-4 py-3 text-right text-white">
                    <p className="text-xs text-white/60">가격</p>
                    <p className="text-lg font-black">
                      {Number(item.price ?? 0).toLocaleString()}P
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <PurchaseButton itemId={item.id} />
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border bg-white p-10 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3">
              현재 구매 가능한 상품이 없습니다.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}