import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminPointForm from "@/components/AdminPointForm";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) {
    notFound();
  }

  const { data: pointLogs } = await supabase
    .from("point_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      *,
      shop_items (
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-violet-100">USER DETAIL</p>

        <h1 className="mt-2 text-4xl font-black">{user.nickname}</h1>

        <p className="mt-2 text-sm text-violet-100">
          유저 상세 정보 및 활동 내역
        </p>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">기본 정보</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-400">포인트</p>
                <p className="mt-1 text-3xl font-black">
                  {(user.points ?? 0).toLocaleString()}P
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">구독 티어</p>
                <p className="mt-1 font-bold">
                  {user.subscription_tier ? `티어 ${user.subscription_tier}` : "없음"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">디스코드 연동</p>
                <p className="mt-1 font-bold">
                  {user.discord_user_id ? "연동됨" : "미연동"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">DM 알림</p>
                <p className="mt-1 font-bold">
                  {user.discord_dm_enabled ? "활성화" : "비활성화"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">포인트 수동 관리</h2>

            <div className="mt-5">
              <AdminPointForm
                users={[
                  {
                    id: user.id,
                    nickname: user.nickname,
                    points: user.points ?? 0,
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">최근 포인트 로그</h2>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                  최근 {pointLogs?.length ?? 0}개
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border">
                <div className="grid grid-cols-[150px_1fr_90px] bg-gray-50 p-3 text-sm font-bold text-gray-500">
                  <span>시간</span>
                  <span>내용</span>
                  <span className="text-right">포인트</span>
                </div>

                {pointLogs && pointLogs.length > 0 ? (
                  pointLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-[150px_1fr_90px] items-center border-t p-3 text-sm"
                    >
                      <span className="text-gray-400">
                        {new Date(log.created_at).toLocaleString("ko-KR", {
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </span>

                      <span className="font-bold text-gray-700">
                        {log.reason}
                      </span>

                      <span
                        className={`text-right font-black ${
                          log.amount > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {log.amount > 0 ? "+" : ""}
                        {log.amount.toLocaleString()}P
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    포인트 로그가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">최근 구매 로그</h2>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                  최근 {purchases?.length ?? 0}개
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border">
                <div className="grid grid-cols-[150px_1fr_90px] bg-gray-50 p-3 text-sm font-bold text-gray-500">
                  <span>시간</span>
                  <span>상품</span>
                  <span className="text-right">가격</span>
                </div>

                {purchases && purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="grid grid-cols-[150px_1fr_90px] items-center border-t p-3 text-sm"
                    >
                      <span className="text-gray-400">
                        {new Date(purchase.created_at).toLocaleString("ko-KR", {
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </span>

                      <span className="font-bold text-gray-700">
                        {purchase.shop_items?.name ?? "삭제된 상품"}
                      </span>

                      <span className="text-right font-black text-red-500">
                        -{purchase.price.toLocaleString()}P
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    구매 로그가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}