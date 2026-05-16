"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";

type Setting = {
  key: string;
  value: string;
};


const labels: Record<string, string> = {
  chat_reward_points: "채팅 보상 포인트",
  chat_reward_cooldown_minutes: "채팅 보상 쿨타임(분)",
  donation_point_ratio: "후원 포인트 비율",
  weekly_first_donation_bonus: "주간 첫 후원 보너스",
  monthly_first_donation_bonus: "월간 첫 후원 보너스",
  subscription_tier1_reward: "티어1 구독 보상",
  subscription_tier2_reward: "티어2 구독 보상",
  subscription_gift_reward: "구독 선물 1개당 보상",
  subscription_gift_daily_max: "구독 선물 일일 최대 보상",
  monthly_first_gift_bonus: "월간 첫 구독 선물 보너스",
};

const descriptions: Record<string, string> = {
  chat_reward_points: "채팅 활동 시 지급되는 기본 포인트입니다.",
  chat_reward_cooldown_minutes:
    "같은 유저가 채팅 보상을 다시 받을 수 있는 시간입니다.",
  donation_point_ratio:
    "후원 금액에 곱해지는 비율입니다. 예: 0.1 = 10원당 1P",
  weekly_first_donation_bonus:
    "한 주의 첫 후원 시 추가 지급되는 포인트입니다.",
  monthly_first_donation_bonus:
    "한 달의 첫 후원 시 추가 지급되는 포인트입니다.",
  subscription_tier1_reward:
    "티어1 정기구독 시 지급되는 포인트입니다.",
  subscription_tier2_reward:
    "티어2 정기구독 시 지급되는 포인트입니다.",
  subscription_gift_reward:
    "구독 선물 1개당 지급되는 포인트입니다.",
  subscription_gift_daily_max:
    "하루 동안 구독 선물로 받을 수 있는 최대 포인트입니다.",
  monthly_first_gift_bonus:
    "한 달의 첫 구독 선물 시 추가 지급되는 포인트입니다.",
};

export default function AdminSettingsForm({
  settings,
}: {
  settings: Setting[];
}) {
  const initialValues = Object.fromEntries(
    settings.map((setting) => [setting.key, setting.value])
  );

  const router = useRouter();

  const [values, setValues] =
    useState<Record<string, string>>(initialValues);

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: values,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "설정 저장 실패");
        return;
      }

      toast.success("설정 저장 완료!");

      router.refresh();
    } catch (error) {
      toast.error("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="grid w-full gap-5 xl:grid-cols-[1.25fr_0.9fr]">
        <section className="min-w-0 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">운영 설정</h2>

          <p className="mt-1 text-sm text-gray-500">
            포인트 지급 규칙을 코드 수정 없이 변경할 수 있어요.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border">
            {Object.keys(labels).map((key) => (
              <div
                key={key}
                className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[220px_1fr_160px] md:items-center"
              >
                <p className="font-bold text-gray-900">
                  {labels[key]}
                </p>

                <p className="text-sm leading-6 text-gray-500">
                  {descriptions[key]}
                </p>

                <input
                  value={values[key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  disabled={loading}
                  className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "저장 중..." : "설정 저장"}
          </button>
        </section>

        <aside className="min-w-0 space-y-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">설정 안내</h2>

            <div className="mt-5 space-y-5 rounded-2xl bg-violet-50 p-5">
              <div className="flex gap-3">
                <Info
                  className="mt-0.5 shrink-0 text-violet-600"
                  size={22}
                />

                <div>
                  <p className="font-bold">실시간 적용</p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    설정 저장 후 이후 지급부터 바로 적용됩니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-violet-600"
                  size={22}
                />

                <div>
                  <p className="font-bold">안전한 운영</p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    모든 설정값은 데이터베이스에 저장됩니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertCircle
                  className="mt-0.5 shrink-0 text-violet-600"
                  size={22}
                />

                <div>
                  <p className="font-bold">주의사항</p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    지나치게 높은 값은 포인트 인플레이션을 유발할 수
                    있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">최근 변경 내역</h2>

            <div className="mt-5 overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-3 bg-gray-50 p-3 text-sm font-bold text-gray-500">
                <span>키</span>
                <span>새로운 값</span>
                <span>상태</span>
              </div>

              <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center text-gray-400">
                <FileText size={34} />

                <p className="mt-3 text-sm">
                  변경 내역이 없습니다.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}