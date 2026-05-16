"use client";

import { useState } from "react";

export default function AdminCreatePredictionForm() {
  const [title, setTitle] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const response = await fetch("/api/admin/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        option1,
        option2,
        closesAt,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error || "예측 생성 실패");
      return;
    }

    alert("승부예측 생성 완료!");

    setTitle("");
    setOption1("");
    setOption2("");
    setClosesAt("");

    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <h2 className="text-xl font-bold">승부예측 생성</h2>

      <div className="mt-5 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예측 제목 예: 다음 판 이길까?"
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          placeholder="선택지 1 예: 이긴다"
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
          placeholder="선택지 2 예: 진다"
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
          type="datetime-local"
          className="w-full rounded-xl border px-4 py-3"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white"
        >
          {loading ? "생성 중..." : "예측 생성"}
        </button>
      </div>
    </form>
  );
}