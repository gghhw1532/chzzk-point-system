import PageContainer from "@/components/PageContainer";
import PredictionBetForm from "@/components/PredictionBetForm";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default async function PredictionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-bold">승부 예측</h1>
        <p className="mt-2 text-sm text-gray-500">
          배팅하려면 치지직 로그인이 필요합니다.
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

  const { data: predictions } = await supabase
    .from("predictions")
    .select(`
      *,
      prediction_options (
        id,
        title,
        prediction_bets (
          user_id,
          amount
        )
      )
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false });

    const { data: settledPredictions } = await supabase
  .from("predictions")
  .select(`
    *,
    prediction_options (
      id,
      title
    ),
    prediction_bets (
      user_id,
      option_id,
      amount
    )
  `)
  .eq("status", "settled")
  .order("created_at", { ascending: false })
  .limit(10);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">승부 예측</h1>

      <p className="mt-2 text-sm text-gray-500">
        진행 중인 예측에 포인트를 걸 수 있어요.
      </p>

      <div className="mt-6 grid gap-5">
        {predictions && predictions.length > 0 ? (
          predictions.map((prediction: any) => {
            const options = prediction.prediction_options ?? [];

            const totalPool = options.reduce((sum: number, option: any) => {
              const optionTotal = (option.prediction_bets ?? []).reduce(
                (optionSum: number, bet: any) => optionSum + bet.amount,
                0
              );

              return sum + optionTotal;
            }, 0);

            const totalParticipants = options.reduce(
              (sum: number, option: any) =>
                sum + (option.prediction_bets ?? []).length,
              0
            );

            const myBet = options
              .flatMap((option: any) => option.prediction_bets ?? [])
              .find((bet: any) => bet.user_id === user.id);

            return (
              <div
                key={prediction.id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    진행 중
                  </span>

                  <span className="text-sm text-gray-500">
                    참여 {totalParticipants}명
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-bold">
                  {prediction.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  총 배팅 포인트: {totalPool.toLocaleString()}P
                </p>

                <div className="mt-5 space-y-4">
                  {options.map((option: any) => {
                    const bets = option.prediction_bets ?? [];

                    const optionTotal = bets.reduce(
                      (sum: number, bet: any) => sum + bet.amount,
                      0
                    );

                    const percent =
                      totalPool > 0
                        ? Math.round((optionTotal / totalPool) * 100)
                        : 0;

                    return (
                      <div key={option.id} className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{option.title}</p>
                          <p className="text-sm font-bold">
                            {optionTotal.toLocaleString()}P
                          </p>
                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-black transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                          <span>{percent}%</span>
                          <span>{bets.length}명 참여</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                

                {myBet ? (
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">내 배팅</p>
                    <p className="mt-1 font-bold">{myBet.amount}P 배팅 완료</p>
                  </div>
                ) : (
                  <PredictionBetForm
                    predictionId={prediction.id}
                    options={options}
                  />
                )}
              </div>

              

            );

            
          })
        ) : (
          <div className="rounded-2xl border bg-white p-5 text-center text-sm text-gray-500">
            진행 중인 예측이 없습니다.
          </div>
        )}
      </div>

      <section className="mt-10">
  <h2 className="text-xl font-bold">최근 종료된 예측</h2>

  <div className="mt-4 grid gap-4">
    {settledPredictions && settledPredictions.length > 0 ? (
      settledPredictions.map((prediction: any) => {
        const winningOption = prediction.prediction_options?.find(
          (option: any) => option.id === prediction.winning_option_id
        );

        const myBet = prediction.prediction_bets?.find(
          (bet: any) => bet.user_id === user.id
        );

        const myOption = prediction.prediction_options?.find(
          (option: any) => option.id === myBet?.option_id
        );

        const isWin = myBet && myBet.option_id === prediction.winning_option_id;

        return (
          <div
            key={prediction.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                정산 완료
              </span>

              {isWin ? (
                <span className="text-sm font-bold text-green-600">
                  적중
                </span>
              ) : myBet ? (
                <span className="text-sm font-bold text-red-500">
                  실패
                </span>
              ) : (
                <span className="text-sm text-gray-400">
                  미참여
                </span>
              )}
            </div>

            <h3 className="mt-3 text-lg font-bold">{prediction.title}</h3>

            <p className="mt-2 text-sm text-gray-500">
              정답: {winningOption?.title ?? "알 수 없음"}
            </p>

            {myBet ? (
              <p className="mt-1 text-sm text-gray-500">
                내 선택: {myOption?.title ?? "알 수 없음"} / {myBet.amount}P
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-400">
                이 예측에는 참여하지 않았어요.
              </p>
            )}
          </div>
        );
      })
    ) : (
      <div className="rounded-2xl border bg-white p-5 text-center text-sm text-gray-500">
        종료된 예측이 없습니다.
      </div>
    )}
  </div>
</section>
    </PageContainer>

    
  );
}