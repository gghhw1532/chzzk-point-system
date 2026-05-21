"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
        body: JSON.stringify({ itemId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "구매에 실패했어요.");
        return;
      }

      toast.success("상품 구매 완료!");
      router.refresh();
    } catch {
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
      className="w-full rounded-2xl bg-black py-3 text-sm font-black text-white transition hover:scale-[1.01] hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "구매 중..." : "🛒 구매하기"}
    </button>
  );
}