"use client";

import { useState } from "react";

export default function AttendanceButton() {
  const [loading, setLoading] = useState(false);

  async function handleAttendance() {
    setLoading(true);

    const response = await fetch("/api/attendance", {
      method: "POST",
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error || "출석 실패");
      return;
    }

    alert(
      `출석 완료! +${result.rewardPoints}P / ${result.streak}일 연속 출석`
    );

    window.location.reload();
  }

  return (
    <button
      onClick={handleAttendance}
      disabled={loading}
      className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "출석 처리 중..." : "출석 체크하기"}
    </button>
  );
}