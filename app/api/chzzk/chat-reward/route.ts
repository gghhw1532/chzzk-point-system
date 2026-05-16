import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordDM } from "@/lib/discord";
import { applyPointMultiplier } from "@/lib/points";
import { getNumberSetting } from "@/lib/settings";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chzzkChannelId, message } = body;

    if (!chzzkChannelId) {
      return errorResponse("채널 ID 없음", 400);
    }

    const REWARD_POINTS = await getNumberSetting("chat_reward_points", 5);
    const COOLDOWN_MINUTES = await getNumberSetting(
      "chat_reward_cooldown_minutes",
      10
    );

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("chzzk_channel_id", chzzkChannelId)
      .single();

    if (userError || !user) {
      return errorResponse("유저 없음", 404, userError);
    }

    const { data: lastReward, error: lastRewardError } = await supabaseAdmin
      .from("chat_activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastRewardError) {
      return errorResponse("최근 채팅 보상 조회 실패", 500, lastRewardError);
    }

    if (lastReward) {
      const lastTime = new Date(lastReward.created_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - lastTime) / 1000 / 60;

      if (diffMinutes < COOLDOWN_MINUTES) {
        return successResponse({
          rewarded: false,
          cooldown: true,
          remainingMinutes: Math.ceil(COOLDOWN_MINUTES - diffMinutes),
        });
      }
    }

    const rewardPoints = applyPointMultiplier(
      REWARD_POINTS,
      user.subscription_tier
    );

    const newPoints = user.points + rewardPoints;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ points: newPoints })
      .eq("id", user.id);

    if (updateError) {
      return errorResponse("포인트 업데이트 실패", 500, updateError);
    }

    const { error: activityError } = await supabaseAdmin
      .from("chat_activity_logs")
      .insert({
        user_id: user.id,
        message,
        reward_points: rewardPoints,
      });

    if (activityError) {
      return errorResponse("채팅 활동 로그 저장 실패", 500, activityError);
    }

    const { error: pointLogError } = await supabaseAdmin
      .from("point_logs")
      .insert({
        user_id: user.id,
        type: "chat_reward",
        amount: rewardPoints,
        reason: "채팅 활동 보상",
      });

    if (pointLogError) {
      return errorResponse("포인트 로그 저장 실패", 500, pointLogError);
    }

    if (user.discord_user_id && user.discord_dm_enabled) {
      await sendDiscordDM(
        user.discord_user_id,
        `💬 채팅 활동 보상!\n\n+${rewardPoints}P 지급되었습니다.\n현재 포인트: ${newPoints}P`
      ).catch(console.error);
    }

    return successResponse({
      rewarded: true,
      reward: rewardPoints,
      points: newPoints,
    });
  } catch (error) {
    return errorResponse("채팅 보상 처리 실패", 500, error);
  }
}