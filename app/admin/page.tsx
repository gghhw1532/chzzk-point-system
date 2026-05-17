import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: users } = await supabase.from("users").select("*");
  const { data: purchases } = await supabase.from("purchases").select("*");
  const { data: predictions } = await supabase.from("predictions").select("*");

      function isBotOnline(lastPing?: string) {
  if (!lastPing) return false;

  const diff = Date.now() - new Date(lastPing).getTime();

  return diff < 60 * 1000;
}
   

  const { data: recentPointLogs } = await supabase

    .from("point_logs")
    .select(`
      *,
      users (
        nickname
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentPurchases } = await supabase
    .from("purchases")
    .select(`
      *,
      users (
        nickname
      ),
      shop_items (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: activePredictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5);

    const { data: botStatuses } = await supabase
  .from("bot_status")
  .select("*");

  const totalPoints =
    users?.reduce((sum, user) => sum + (user.points ?? 0), 0) ?? 0;

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-violet-100">ADMIN DASHBOARD</p>
        <h1 className="mt-2 text-4xl font-black">관리자 대시보드</h1>
        <p className="mt-2 text-sm text-violet-100">
          포인트, 상점, 승부예측, 자동 보상을 관리합니다.
        </p>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">총 유저</p>
          <h2 className="mt-2 text-4xl font-black">{users?.length ?? 0}명</h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">총 포인트</p>
          <h2 className="mt-2 text-4xl font-black">
            {totalPoints.toLocaleString()}P
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">총 구매</p>
          <h2 className="mt-2 text-4xl font-black">
            {purchases?.length ?? 0}건
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">활성 예측</p>
          <h2 className="mt-2 text-4xl font-black">
            {predictions?.filter((p) => p.status === "open").length ?? 0}개
          </h2>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-black">실시간 현황</h2>

        <div className="mt-4 grid gap-5 xl:grid-cols-3">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black">최근 포인트 로그</h3>

            <div className="mt-4 space-y-3">
              {recentPointLogs && recentPointLogs.length > 0 ? (
                recentPointLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-bold">
                        {log.users?.nickname ?? "알 수 없음"}
                      </p>
                      <p className="text-sm text-gray-500">{log.reason}</p>
                    </div>

                    <span
                      className={`font-black ${
                        log.amount > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {log.amount > 0 ? "+" : ""}
                      {log.amount}P
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                  포인트 로그가 없습니다.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black">최근 구매</h3>

            <div className="mt-4 space-y-3">
              {recentPurchases && recentPurchases.length > 0 ? (
                recentPurchases.map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-bold">
                        {purchase.users?.nickname ?? "알 수 없음"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {purchase.shop_items?.name ?? "삭제된 상품"}
                      </p>
                    </div>

                    <span className="font-black text-red-500">
                      -{purchase.price}P
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                  구매 내역이 없습니다.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
  <h3 className="text-lg font-black">봇 상태</h3>

  
  
  <div className="mt-4 space-y-3">
    {["discord", "chzzk"].map((name) => {
         
      const bot = botStatuses?.find((item) => item.name === name);

const isOnline = isBotOnline(bot?.last_ping);
const isError = bot?.status === "error";
      return (
        <div
          key={name}
          className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
        >
          <div>
            <p className="font-bold">
              {name === "discord" ? "디스코드 봇" : "치지직 세션 봇"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {bot?.memo ?? "상태 정보 없음"}
            </p>

            {bot?.last_ping && (
              <p className="mt-1 text-xs text-gray-400">
                마지막 확인: {new Date(bot.last_ping).toLocaleString("ko-KR")}
              </p>
            )}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              isOnline
                ? "bg-green-100 text-green-700"
                : isError
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isOnline ? "온라인" : isError ? "오류" : "오프라인"}
          </span>
        </div>
      );
    })}
  </div>
</div>
        </div>
      </section>
    </>
  );
}