"use client";

import { useState } from "react";

type Option = {
  id: string;
  title: string;
};

type Prediction = {
  id: string;
  title: string;
  status: string;
  prediction_options: Option[];
};

export default function AdminPredictionList({
  predictions,
}: {
  predictions: Prediction[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function settlePrediction(predictionId: string, winningOptionId: string) {
    if (!confirm("이 선택지로 결과를 확정할까요? 정산 후 되돌릴 수 없습니다.")) {
      return;
    }

    setLoadingId(predictionId);

    const response = await fetch("/api/admin/predictions/settle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ predictionId, winningOptionId }),
    });

    const result = await response.json();

    setLoadingId(null);

    if (!response.ok) {
      alert(result.error || "정산 실패");
      return;
    }

    alert("정산 완료!");
    window.location.reload();
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">승부예측 관리</h2>

      <div className="mt-5 space-y-4">
        {predictions.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
            생성된 예측이 없습니다.
          </div>
        ) : (
          predictions.map((prediction) => (
            <div key={prediction.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{prediction.title}</p>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    prediction.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {prediction.status === "open" ? "진행 중" : "정산 완료"}
                </span>
              </div>

              {prediction.status === "open" ? (
                <div className="mt-4 grid gap-2">
                  {prediction.prediction_options.map((option) => (
                    <button
                      key={option.id}
                      disabled={loadingId === prediction.id}
                      onClick={() => settlePrediction(prediction.id, option.id)}
                      className="rounded-xl bg-black py-3 text-sm font-bold text-white"
                    >
                      {loadingId === prediction.id
                        ? "정산 중..."
                        : `'${option.title}' 승리로 정산`}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  이미 결과가 확정된 예측입니다.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}