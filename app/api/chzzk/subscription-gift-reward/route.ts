import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordDM } from "@/lib/discord";
import { applyPointMultiplier } from "@/lib/points";
import { getNumberSetting } from "@/lib/settings";
import { errorResponse, successResponse } from "@/lib/api-response";

function getDayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { chzzkChannelId, giftCount } = body;

    if (!chzzkChannelId) {
      return errorResponse("채널 ID 없음", 400);
    }

    const POINT_PER_GIFT = await getNumberSetting("subscription_gift_reward", 50);
    const DAILY_MAX_REWARD = await getNumberSetting(
      "subscription_gift_daily_max",
      250
    );
    const MONTHLY_FIRST_GIFT_BONUS = await getNumberSetting(
      "monthly_first_gift_bonus",
      500
    );

    const count = Number(giftCount) || 1;

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("chzzk_channel_id", chzzkChannelId)
      .single();

    if (userError || !user) {
      return errorResponse("유저 없음", 404, userError);
    }

    const dayStart = getDayStart();
    const monthStart = getMonthStart();

    const { data: todayLogs, error: todayLogsError } = await supabaseAdmin
      .from("subscription_gift_logs")
      .select("reward_points")
      .eq("user_id", user.id)
      .gte("created_at", dayStart.toISOString());

    if (todayLogsError) {
      return errorResponse("일일 구독 선물 로그 조회 실패", 500, todayLogsError);
    }

    const todayRewardTotal =
      todayLogs?.reduce((sum, log) => sum + log.reward_points, 0) ?? 0;

    const remainingDailyReward = Math.max(
      DAILY_MAX_REWARD - todayRewardTotal,
      0
    );

    const baseReward = Math.min(count * POINT_PER_GIFT, remainingDailyReward);

    const { data: monthlyGift, error: monthlyGiftError } = await supabaseAdmin
      .from("subscription_gift_logs")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (monthlyGiftError) {
      return errorResponse(
        "월간 구독 선물 로그 조회 실패",
        500,
        monthlyGiftError
      );
    }

    const monthlyBonus = monthlyGift ? 0 : MONTHLY_FIRST_GIFT_BONUS;

    const multipliedReward = applyPointMultiplier(
      baseReward,
      user.subscription_tier
    );

    const rewardPoints = multipliedReward + monthlyBonus;

    if (rewardPoints <= 0) {
      return successResponse({
        rewarded: false,
        rewardPoints: 0,
        message: "오늘 받을 수 있는 구독 선물 보상을 모두 받았습니다.",
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

    const { error: giftLogError } = await supabaseAdmin
      .from("subscription_gift_logs")
      .insert({
        user_id: user.id,
        gift_count: count,
        reward_points: rewardPoints,
      });

    if (giftLogError) {
      return errorResponse("구독 선물 로그 저장 실패", 500, giftLogError);
    }

    const { error: pointLogError } = await supabaseAdmin
      .from("point_logs")
      .insert({
        user_id: user.id,
        type: "subscription_gift_reward",
        amount: rewardPoints,
        reason: `구독 선물 보상 (${count}개)`,
      });

    if (pointLogError) {
      return errorResponse("포인트 로그 저장 실패", 500, pointLogError);
    }

    if (user.discord_user_id && user.discord_dm_enabled) {
      const bonusText =
        monthlyBonus > 0
          ? `\n👑 월간 첫 구독 선물 보너스: +${monthlyBonus}P`
          : "";

      await sendDiscordDM(
        user.discord_user_id,
        `🎁 구독 선물 보상 지급!\n\n선물 개수: ${count}개\n획득 포인트: +${rewardPoints}P${bonusText}\n현재 포인트: ${newPoints}P`
      ).catch(console.error);
    }

    return successResponse({
      rewarded: true,
      rewardPoints,
      monthlyBonus,
      points: newPoints,
    });
  } catch (error) {
    return errorResponse("구독 선물 보상 지급 실패", 500, error);
  }
}