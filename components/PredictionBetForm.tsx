"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  title: string;
};

type Props = {
  predictionId: string;
  options: Option[];
};

export default function PredictionBetForm({
  predictionId,
  options,
}: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleBet() {
    if (loading) return;

    if (!selectedOptionId) {
      toast.error("선택지를 골라주세요.");
      return;
    }

    if (!points || Number(points) <= 0) {
      toast.error("포인트를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/predictions/bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          predictionId,
          optionId: selectedOptionId,
          points: Number(points),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "예측 참여 실패");
        return;
      }

      toast.success("예측 참여 완료!");

      router.refresh();
    } catch (error) {
      toast.error("예측 참여 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedOptionId(option.id)}
            disabled={loading}
            className={`rounded-2xl border p-4 text-left font-bold transition ${
              selectedOptionId === option.id
                ? "border-violet-600 bg-violet-50 text-violet-700"
                : "hover:bg-gray-50"
            }`}
          >
            {option.title}
          </button>
        ))}
      </div>

      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        disabled={loading}
        placeholder="배팅할 포인트"
        className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet-500"
      />

      <button
        type="button"
        onClick={handleBet}
        disabled={loading}
        className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "참여 중..." : "예측 참여"}
      </button>
    </div>
  );
}