import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import TopRankCard from "@/components/TopRankCard";

export default async function RankingPage() {
  const user = await getCurrentUser();

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("points", { ascending: false });

  const currentMonth = new Date();
  currentMonth.setDate(1);

  const { data: logs } = await supabase
    .from("point_logs")
    .select("*")
    .gte("created_at", currentMonth.toISOString());

  const earnMap = new Map<string, number>();
  const spendMap = new Map<string, number>();

  logs?.forEach((log) => {
    if (!log.user_id) return;

    if (log.amount > 0) {
      earnMap.set(
        log.user_id,
        (earnMap.get(log.user_id) ?? 0) + log.amount
      );
    }

    if (log.amount < 0) {
      spendMap.set(
        log.user_id,
        (spendMap.get(log.user_id) ?? 0) + Math.abs(log.amount)
      );
    }
  });

  const earnRanking =
    users
      ?.map((user) => ({
        ...user,
        earned: earnMap.get(user.id) ?? 0,
      }))
      .sort((a, b) => b.earned - a.earned) ?? [];

  const spendRanking =
    users
      ?.map((user) => ({
        ...user,
        spent: spendMap.get(user.id) ?? 0,
      }))
      .sort((a, b) => b.spent - a.spent) ?? [];

  const myRank =
    users?.findIndex((u) => u.id === user?.id) ?? -1;

  return (
    <PageContainer>
      <section className="rounded-3xl bg-black p-6 text-white shadow-sm">
        <p className="text-sm text-gray-300">POINT RANKING</p>

        <h1 className="mt-2 text-3xl font-bold">
          포인트 랭킹
        </h1>

        <p className="mt-2 text-sm text-gray-300">
          활동량과 포인트 순위를 확인해보세요.
        </p>
      </section>

      {user && (
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">내 순위</p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              #{myRank + 1}
            </h2>

            <p className="font-bold">
              {user.nickname}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
  {users?.slice(0, 3).map((topUser, index) => (
    <TopRankCard
      key={topUser.id}
      rank={index + 1}
      nickname={topUser.nickname}
      points={topUser.points}
    />
  ))}
</div>

      <section className="mt-8">
        <h2 className="text-xl font-bold">
          전체 포인트 랭킹
        </h2>

        <div className="mt-4 space-y-3">
          {users?.map((rankUser, index) => (
            <div
              key={rankUser.id}
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                index < 3
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-black">
                  #{index + 1}
                </div>

                <div>
                  <p className="font-bold">
                    {rankUser.nickname}
                  </p>

                  <p
                    className={`text-sm ${
                      index < 3
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    총 포인트
                  </p>
                </div>
              </div>

              <p className="text-xl font-black">
                {rankUser.points.toLocaleString()}P
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">
          이번 달 획득 랭킹
        </h2>

        <div className="mt-4 space-y-3">
          {earnRanking.slice(0, 5).map((rankUser, index) => (
            <div
              key={rankUser.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-4"
            >
              <div>
                <p className="font-bold">
                  #{index + 1} {rankUser.nickname}
                </p>

                <p className="text-sm text-gray-500">
                  월간 획득 포인트
                </p>
              </div>

              <p className="font-black text-green-600">
                +{rankUser.earned.toLocaleString()}P
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">
          이번 달 사용 랭킹
        </h2>

        <div className="mt-4 space-y-3">
          {spendRanking.slice(0, 5).map((rankUser, index) => (
            <div
              key={rankUser.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-4"
            >
              <div>
                <p className="font-bold">
                  #{index + 1} {rankUser.nickname}
                </p>

                <p className="text-sm text-gray-500">
                  월간 사용 포인트
                </p>
              </div>

              <p className="font-black text-red-500">
                -{rankUser.spent.toLocaleString()}P
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}