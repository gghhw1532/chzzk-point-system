import PageContainer from "@/components/PageContainer";
import AttendanceButton from "@/components/AttendanceButton";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

function getKoreanDateString() {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().slice(0, 10);
}

export default async function AttendancePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-bold">출석 체크</h1>

        <p className="mt-2 text-sm text-gray-500">
          출석 체크를 하려면 치지직 로그인이 필요합니다.
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

  const today = getKoreanDateString();

  const { data: todayAttendance } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("attended_date", today)
    .maybeSingle();

  const { data: recentLogs } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("attended_date", { ascending: false })
    .limit(7);

  const currentStreak = recentLogs?.[0]?.streak ?? 0;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">출석 체크</h1>

      <p className="mt-2 text-sm text-gray-500">
        하루 한 번 출석하고 포인트를 받아요.
      </p>

      <div className="mt-6 rounded-3xl border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500">오늘 출석 보상</p>
        <p className="mt-2 text-4xl font-bold">50P</p>

        <p className="mt-2 text-sm text-gray-500">
          7일 연속 출석마다 추가 300P 보상
        </p>

        <div className="mt-5 rounded-2xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">현재 연속 출석</p>
          <p className="mt-1 text-2xl font-bold">{currentStreak}일</p>
        </div>

        {todayAttendance ? (
          <button
            disabled
            className="mt-6 w-full rounded-xl bg-gray-300 py-3 text-sm font-bold text-white"
          >
            오늘 출석 완료
          </button>
        ) : (
          <AttendanceButton />
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-bold">최근 출석 기록</h2>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
          {recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b p-5 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{log.attended_date}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {log.streak}일 연속 출석
                  </p>
                </div>

                <p className="font-bold text-green-600">
                  +{log.reward_points}P
                </p>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-sm text-gray-500">
              아직 출석 기록이 없습니다.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}