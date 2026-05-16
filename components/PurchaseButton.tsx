"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  itemId: string;
};

export default function PurchaseButton({ itemId }: Props) {
const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "구매에 실패했어요.");
        return;
      }

      toast.success("상품 구매 완료!");

      router.refresh();
    } catch (error) {
      toast.error("구매 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePurchase}
      disabled={loading}
      className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "구매 중..." : "구매하기"}
    </button>
  );
}