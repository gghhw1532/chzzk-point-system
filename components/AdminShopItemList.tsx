"use client";

import { useState } from "react";

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
};

export default function AdminShopItemList({
  items,
}: {
  items: Item[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleItem(itemId: string, isActive: boolean) {
    setLoadingId(itemId);

    const response = await fetch(
      "/api/admin/shop-items/toggle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          isActive,
        }),
      }
    );

    setLoadingId(null);

    if (!response.ok) {
      alert("상태 변경 실패");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          상품 관리
        </h2>

        <p className="text-sm text-gray-500">
          총 {items.length}개
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">
                    {item.name}
                  </p>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      item.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.is_active ? "활성" : "비활성"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>

              <p className="font-bold">
                {item.price}P
              </p>
            </div>

            <button
              disabled={loadingId === item.id}
              onClick={() =>
                toggleItem(item.id, item.is_active)
              }
              className={`mt-4 w-full rounded-xl py-3 text-sm font-bold text-white ${
                item.is_active
                  ? "bg-red-500"
                  : "bg-black"
              }`}
            >
              {loadingId === item.id
                ? "처리 중..."
                : item.is_active
                ? "비활성화"
                : "활성화"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}