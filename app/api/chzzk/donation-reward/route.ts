import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordDM } from "@/lib/discord";
import { applyPointMultiplier } from "@/lib/points";
import { getNumberSetting } from "@/lib/settings";
import { errorResponse, successResponse } from "@/lib/api-response";

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;

  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getMonthStart() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { chzzkChannelId, payAmount } = body;

    if (!chzzkChannelId || !payAmount) {
      return errorResponse("필수값 누락", 400);
    }

    const POINT_PER_DONATION = await getNumberSetting(
      "donation_point_ratio",
      0.1
    );

    const WEEKLY_FIRST_BONUS = await getNumberSetting(
      "weekly_first_donation_bonus",
      200
    );

    const MONTHLY_FIRST_BONUS = await getNumberSetting(
      "monthly_first_donation_bonus",
      1000
    );

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("chzzk_channel_id", chzzkChannelId)
      .single();

    if (userError || !user) {
      return errorResponse("유저 없음", 404, userError);
    }

    const baseRewardPoints = Math.floor(Number(payAmount) * POINT_PER_DONATION);

    let rewardPoints = applyPointMultiplier(
      baseRewardPoints,
      user.subscription_tier
    );

    let weeklyBonus = 0;
    let monthlyBonus = 0;

    const weekStart = getWeekStart();
    const monthStart = getMonthStart();

    const { data: weeklyDonation, error: weeklyError } = await supabaseAdmin
      .from("donation_logs")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (weeklyError) {
      return errorResponse("주간 후원 조회 실패", 500, weeklyError);
    }

    if (!weeklyDonation) {
      weeklyBonus = WEEKLY_FIRST_BONUS;
    }

    const { data: monthlyDonation, error: monthlyError } = await supabaseAdmin
      .from("donation_logs")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (monthlyError) {
      return errorResponse("월간 후원 조회 실패", 500, monthlyError);
    }

    if (!monthlyDonation) {
      monthlyBonus = MONTHLY_FIRST_BONUS;
    }

    rewardPoints += weeklyBonus + monthlyBonus;

    if (rewardPoints <= 0) {
      return successResponse({
        rewarded: false,
        rewardPoints: 0,
      });
    }

    const newPoints = user.points + rewardPoints;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ points: newPoints })
      .eq("id", user.id);

    if (updateError) {
      return errorResponse("포인트 업데이트 실패", 500, updateError);
    }

    const { error: donationLogError } = await supabaseAdmin
      .from("donation_logs")
      .insert({
        user_id: user.id,
        donate_amount: Number(payAmount),
        reward_points: rewardPoints,
      });

    if (donationLogError) {
      return errorResponse("후원 로그 저장 실패", 500, donationLogError);
    }

    const { error: pointLogError } = await supabaseAdmin
      .from("point_logs")
      .insert({
        user_id: user.id,
        type: "donation_reward",
        amount: rewardPoints,
        reason: `후원 보상 (${Number(payAmount).toLocaleString()}원)`,
      });

    if (pointLogError) {
      return errorResponse("포인트 로그 저장 실패", 500, pointLogError);
    }

    if (user.discord_user_id && user.discord_dm_enabled) {
      let bonusText = "";

      if (weeklyBonus > 0) {
        bonusText += `\n🎉 주간 첫 후원 보너스: +${weeklyBonus}P`;
      }

      if (monthlyBonus > 0) {
        bonusText += `\n👑 월간 첫 후원 보너스: +${monthlyBonus}P`;
      }

      await sendDiscordDM(
        user.discord_user_id,
        `💰 후원 포인트 지급!\n\n후원 금액: ${Number(
          payAmount
        ).toLocaleString()}원\n획득 포인트: +${rewardPoints}P${bonusText}\n\n현재 포인트: ${newPoints}P`
      ).catch(console.error);
    }

    return successResponse({
      rewarded: true,
      rewardPoints,
      weeklyBonus,
      monthlyBonus,
      points: newPoints,
    });
  } catch (error) {
    return errorResponse("후원 포인트 지급 실패", 500, error);
  }
}