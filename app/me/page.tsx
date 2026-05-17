import PageContainer from "@/components/PageContainer";
import StatCard from "@/components/StatCard";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-bold">내 정보</h1>

        <p className="mt-2 text-sm text-gray-500">
          치지직 로그인이 필요합니다.
        </p>

        

        <a
          href="/api/auth/chzzk/login"
          className="mt-6 block w-full rounded-xl bg-black py-3 text-center text-sm font-bold text-white"
        >
          치지직 로그인
        </a>
      </PageContainer>
    );
  }

  <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-500">
  <p className="font-bold text-gray-700">치지직 로그인 안내</p>
  <p className="mt-2">
    치지직 로그인은 포인트 지급, 출석, 시청 인증, 상점 구매,
    승부예측 참여를 위해 사용됩니다.
  </p>
  <p className="mt-2">
    비밀번호는 저장하지 않으며, 치지직 채널 ID와 닉네임 등 필요한 정보만
    저장됩니다.
  </p>
  <a href="/privacy" className="mt-2 inline-block font-bold text-violet-600">
    개인정보 및 서비스 이용 안내 보기
  </a>
</div>

  const { data: pointLogs } = await supabase
    .from("point_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      *,
      shop_items (
        name,
        description
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">내 정보</h1>

      <p className="mt-2 text-sm text-gray-500">
        내 포인트와 활동 내역을 확인할 수 있어요.
      </p>

      <div className="mt-6 rounded-3xl bg-black p-6 text-white shadow-sm">
        <p className="text-sm text-gray-300">치지직 계정</p>

        <h2 className="mt-2 text-3xl font-bold">
          {user.nickname}
        </h2>

        <p className="mt-2 text-sm text-gray-300">
          로그인된 계정 기준으로 포인트가 관리됩니다.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard title="현재 포인트" value={`${user.points ?? 0}P`} />

        <StatCard
          title="구독 티어"
          value={
            user.subscription_tier === 2
              ? "티어2"
              : user.subscription_tier === 1
              ? "티어1"
              : "없음"
          }
        />

        <StatCard
          title="권한"
          value={user.role === "admin" ? "관리자" : "시청자"}
        />
      </div>

      {user.discord_user_id ? (
  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
    <p className="font-bold text-green-700">
      디스코드 연동 완료
    </p>

    <p className="mt-1 text-sm text-green-600">
      개인 DM 알림을 받을 수 있어요.
    </p>
  </div>
) : (
  <a
    href="/api/auth/discord/login"
    className="mt-6 block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-bold text-white"
  >
    디스코드 연동하기
  </a>
)}

      <form action="/api/auth/logout" method="POST">
        <button className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600">
          로그아웃
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-bold">최근 포인트 내역</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
          {pointLogs && pointLogs.length > 0 ? (
            pointLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b p-5 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{log.reason}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>

                <p
                  className={`font-bold ${
                    log.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {log.amount > 0 ? "+" : ""}
                  {log.amount}P
                </p>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-sm text-gray-500">
              아직 포인트 내역이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">구매 내역</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
          {purchases && purchases.length > 0 ? (
            purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between border-b p-5 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">
                    {purchase.shop_items?.name ?? "삭제된 상품"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(purchase.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>

                <p className="font-bold text-red-500">
                  -{purchase.price}P
                </p>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-sm text-gray-500">
              아직 구매 내역이 없습니다.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}