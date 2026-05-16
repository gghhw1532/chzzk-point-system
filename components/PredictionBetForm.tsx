"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Option = {
  id: string;
  title: string;
};

export default function PredictionBetForm({
  predictionId,
  options,
}: {
  predictionId: string;
  options: Option[];
}) {
  const router = useRouter();

  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBet() {
    if (loading) return;

    if (!selectedOptionId) {
      toast.error("선택지를 골라주세요.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("배팅할 포인트를 입력해주세요.");
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
          amount: Number(amount),
          points: Number(amount),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "예측 참여 실패");
        return;
      }

      toast.success("예측 참여 완료!");
      router.refresh();
    } catch {
      toast.error("예측 참여 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 space-y-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setSelectedOptionId(option.id)}
          disabled={loading}
          className={`w-full rounded-2xl border p-4 text-left font-bold transition ${
            selectedOptionId === option.id
              ? "border-violet-600 bg-violet-50 text-violet-700"
              : "hover:bg-gray-50"
          }`}
        >
          {option.title}
        </button>
      ))}

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
        placeholder="배팅할 포인트"
        className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet-500"
      />

      <button
        type="button"
        onClick={handleBet}
        disabled={loading}
        className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white disabled:opacity-50"
      >
        {loading ? "참여 중..." : "예측 참여"}
      </button>
    </div>
  );
}