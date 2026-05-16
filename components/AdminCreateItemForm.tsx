"use client";

import { useState } from "react";


export default function AdminCreateItemForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const response = await fetch("/api/admin/shop-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        description,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      alert("상품 생성 실패");
      return;
    }

    setName("");
    setPrice("");
    setDescription("");

    alert("상품 생성 완료!");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <h2 className="text-xl font-bold">
        상품 추가
      </h2>

      <div className="mt-5 space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="상품 이름"
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          placeholder="가격"
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상품 설명"
          className="min-h-[120px] w-full rounded-xl border px-4 py-3"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white"
        >
          {loading ? "생성 중..." : "상품 생성"}
        </button>
      </div>
    </form>
  );
}