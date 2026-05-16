type Props = {
  rank: number;
  nickname: string;
  points: number;
};

export default function TopRankCard({
  rank,
  nickname,
  points,
}: Props) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 shadow-sm ${
        rank === 1
          ? "bg-black text-white"
          : "border bg-white"
      }`}
    >
      <div className="absolute right-4 top-4 text-3xl">
        {medals[rank - 1]}
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black ${
            rank === 1
              ? "bg-white text-black"
              : "bg-gray-100"
          }`}
        >
          {nickname[0]}
        </div>

        <div>
          <p
            className={`text-sm ${
              rank === 1
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            전체 {rank}위
          </p>

          <h2 className="mt-1 text-2xl font-black">
            {nickname}
          </h2>

          <p className="mt-2 text-lg font-bold">
            {points.toLocaleString()}P
          </p>
        </div>
      </div>

      {rank === 1 && (
        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-gray-300">
            현재 시즌 TOP 랭커
          </p>

          <p className="mt-1 text-xl font-black">
            👑 KING OF POINT
          </p>
        </div>
      )}
    </div>
  );
}