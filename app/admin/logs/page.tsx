import { supabase } from "@/lib/supabase";
import { formatKoreanShortDateTime } from "@/lib/format-time";

function getLogLabel(type: string) {
  const labels: Record<string, string> = {
    chat_reward: "채팅 보상",
    donation_reward: "후원 보상",
    subscription_reward: "구독 보상",
    subscription_gift_reward: "구독 선물 보상",
    attendance: "출석 보상",
    purchase: "상품 구매",
    prediction_bet: "예측 배팅",
    prediction_win: "예측 적중",
    admin_add: "관리자 지급",
    admin_subtract: "관리자 차감",
  };

  return labels[type] ?? type;
}

export default async function AdminLogsPage() {
  const { data: logs } = await supabase
    .from("point_logs")
    .select(`
      *,
      users (
        nickname
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-violet-100">ACTIVITY LOGS</p>

        <h1 className="mt-2 text-4xl font-black">활동 로그</h1>

        <p className="mt-2 text-sm text-violet-100">
          포인트 지급, 차감, 구매, 예측 내역을 확인합니다.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">최근 포인트 로그</h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-500">
            최근 100개
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <div className="grid grid-cols-[1.2fr_1fr_120px_180px] bg-gray-50 p-4 text-sm font-bold text-gray-500">
            <span>유저</span>
            <span>내용</span>
            <span>포인트</span>
            <span>시간</span>
          </div>

          {logs && logs.length > 0 ? (
            logs.map((log: any) => (
              <div
                key={log.id}
                className="grid grid-cols-[1.2fr_1fr_120px_180px] items-center border-t p-4 text-sm"
              >
                <div>
                  <p className="font-bold">
                    {log.users?.nickname ?? "알 수 없음"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {getLogLabel(log.type)}
                  </p>
                </div>

                <p className="text-gray-600">{log.reason}</p>

                <p
                  className={`font-black ${
                    log.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {log.amount > 0 ? "+" : ""}
                  {log.amount.toLocaleString()}P
                </p>

                <p className="text-gray-400">
                 {formatKoreanShortDateTime(log.created_at)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              로그가 없습니다.
            </div>
          )}
        </div>
      </section>
    </>
  );
}