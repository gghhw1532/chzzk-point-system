import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordDM } from "@/lib/discord";
import { getNumberSetting } from "@/lib/settings";
import { errorResponse, successResponse } from "@/lib/api-response";

async function getSubscriptionReward(tierNo: number) {
  if (tierNo === 2) {
    return getNumberSetting("subscription_tier2_reward", 500);
  }

  return getNumberSetting("subscription_tier1_reward", 300);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { chzzkChannelId, tierNo, month } = body;

    if (!chzzkChannelId) {
      return errorResponse("채널 ID 없음", 400);
    }

    const tier = Number(tierNo) || 1;
    const rewardPoints = await getSubscriptionReward(tier);

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("chzzk_channel_id", chzzkChannelId)
      .single();

    if (userError || !user) {
      return errorResponse("유저 없음", 404, userError);
    }

    const newPoints = user.points + rewardPoints;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        points: newPoints,
        subscription_tier: tier,
      })
      .eq("id", user.id);

    if (updateError) {
      return errorResponse("유저 구독 정보 업데이트 실패", 500, updateError);
    }

    const { error: subscriptionLogError } = await supabaseAdmin
      .from("subscription_logs")
      .insert({
        user_id: user.id,
        tier_no: tier,
        month: month ? Number(month) : null,
        reward_points: rewardPoints,
      });

    if (subscriptionLogError) {
      return errorResponse("구독 로그 저장 실패", 500, subscriptionLogError);
    }

    const { error: pointLogError } = await supabaseAdmin
      .from("point_logs")
      .insert({
        user_id: user.id,
        type: "subscription_reward",
        amount: rewardPoints,
        reason: `티어${tier} 구독 보상`,
      });

    if (pointLogError) {
      return errorResponse("포인트 로그 저장 실패", 500, pointLogError);
    }

    if (user.discord_user_id && user.discord_dm_enabled) {
      await sendDiscordDM(
        user.discord_user_id,
        `⭐ 구독 보상 지급!\n\n구독 티어: 티어${tier}\n획득 포인트: +${rewardPoints}P\n현재 포인트: ${newPoints}P`
      ).catch(console.error);
    }

    return successResponse({
      rewarded: true,
      rewardPoints,
      tier,
      points: newPoints,
    });
  } catch (error) {
    return errorResponse("구독 포인트 지급 실패", 500, error);
  }
}