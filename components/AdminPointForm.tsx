"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  nickname: string;
  points: number;
};

export default function AdminPointForm({
  users,
}: {
  users: User[];
}) {
  const [selectedUserId, setSelectedUserId] = useState(
    users[0]?.id ?? ""
  );

  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(type: "add" | "subtract") {
    if (loading) return;

    if (!selectedUserId) {
      toast.error("유저를 선택해주세요.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("포인트를 입력해주세요.");
      return;
    }

    if (!reason.trim()) {
      toast.error("사유를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: Number(amount),
          reason,
          type,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "포인트 처리 실패");
        return;
      }

      toast.success(
        type === "add"
          ? "포인트 지급 완료!"
          : "포인트 차감 완료!"
      );

      setAmount("");
      setReason("");

      router.refresh();
    } catch (error) {
      toast.error("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black">포인트 수동 관리</h2>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-600">
            유저 선택
          </label>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet-500"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nickname} ({user.points.toLocaleString()}P)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-600">
            포인트
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            placeholder="지급/차감할 포인트"
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-600">
            사유
          </label>

          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            placeholder="예: 이벤트 보상"
            className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSubmit("add")}
            disabled={loading}
            className="rounded-2xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "처리 중..." : "포인트 지급"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("subtract")}
            disabled={loading}
            className="rounded-2xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "처리 중..." : "포인트 차감"}
          </button>
        </div>
      </div>
    </div>
  );
}