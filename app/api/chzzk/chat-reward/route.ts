import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordDM } from "@/lib/discord";
import { applyPointMultiplier } from "@/lib/points";
import { getNumberSetting } from "@/lib/settings";
import { errorResponse, successResponse } from "@/lib/api-response";

const WATCH_VERIFY_MINUTES = 60;
const WATCH_VERIFY_REWARD = 100;

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
      .maybeSingle();

    if (!user) {
  return errorResponse("유저 없음", 404);
}

    let chatRewardPoints = 0;
    let watchRewardPoints = 0;
    let watchVerified = false;

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

    const now = Date.now();

    const canReceiveChatReward =
      !lastReward ||
      (now - new Date(lastReward.created_at).getTime()) / 1000 / 60 >=
        COOLDOWN_MINUTES;

    if (canReceiveChatReward) {
      chatRewardPoints = applyPointMultiplier(
        REWARD_POINTS,
        user.subscription_tier
      );
    }

    const { data: watchSession, error: watchSessionError } =
      await supabaseAdmin
        .from("watch_sessions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

await supabaseAdmin
  .from("watch_sessions")
  .update({
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq("id", watchSession.id);

    if (watchSessionError) {
      return errorResponse("시청 세션 조회 실패", 500, watchSessionError);
    }

    if (!watchSession) {
      const { error: createSessionError } = await supabaseAdmin
        .from("watch_sessions")
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_watching: true,
          last_watch_reward_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        });

      if (createSessionError) {
        return errorResponse("시청 세션 생성 실패", 500, createSessionError);
      }
    } else {
      const startedAt = new Date(watchSession.started_at).getTime();
      const diffMinutes = (now - startedAt) / 1000 / 60;

      if (diffMinutes >= WATCH_VERIFY_MINUTES) {
        watchVerified = true;
        watchRewardPoints = applyPointMultiplier(
          WATCH_VERIFY_REWARD,
          user.subscription_tier
        );

        const { error: updateSessionError } = await supabaseAdmin
          .from("watch_sessions")
          .update({
            started_at: new Date().toISOString(),
            last_verified_at: new Date().toISOString(),
            total_verified_hours:
              (watchSession.total_verified_hours ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", watchSession.id);

        if (updateSessionError) {
          return errorResponse(
            "시청 인증 세션 업데이트 실패",
            500,
            updateSessionError
          );
        }
      } else {
        await supabaseAdmin
          .from("watch_sessions")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", watchSession.id);
      }
    }

    const totalRewardPoints = chatRewardPoints + watchRewardPoints;

    if (totalRewardPoints <= 0) {
      return successResponse({
        rewarded: false,
        cooldown: true,
        watchVerified: false,
      });
    }

    const newPoints = user.points + totalRewardPoints;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ points: newPoints })
      .eq("id", user.id);

    if (updateError) {
      return errorResponse("포인트 업데이트 실패", 500, updateError);
    }

    if (chatRewardPoints > 0) {
      const { error: activityError } = await supabaseAdmin
        .from("chat_activity_logs")
        .insert({
          user_id: user.id,
          message,
          reward_points: chatRewardPoints,
        });

      if (activityError) {
        return errorResponse("채팅 활동 로그 저장 실패", 500, activityError);
      }

      const { error: pointLogError } = await supabaseAdmin
        .from("point_logs")
        .insert({
          user_id: user.id,
          type: "chat_reward",
          amount: chatRewardPoints,
          reason: "채팅 활동 보상",
        });

      if (pointLogError) {
        return errorResponse("포인트 로그 저장 실패", 500, pointLogError);
      }
    }

    if (watchRewardPoints > 0) {
      const { error: watchPointLogError } = await supabaseAdmin
        .from("point_logs")
        .insert({
          user_id: user.id,
          type: "watch_1hour_reward",
          amount: watchRewardPoints,
          reason: "방송 시청 1시간 인증 보상",
        });

      if (watchPointLogError) {
        return errorResponse("시청 인증 로그 저장 실패", 500, watchPointLogError);
      }

      if (user.discord_user_id && user.discord_dm_enabled) {
        await sendDiscordDM(
          user.discord_user_id,
          `⏰ 방송 시청 1시간 인증 완료!\n\n+${watchRewardPoints}P 지급 완료 🎉\n현재 포인트: ${newPoints}P\n\n계속 시청하면 다음 1시간 보상도 받을 수 있어요.`
        ).catch(console.error);
      }
    }

    return successResponse({
      rewarded: true,
      chatReward: chatRewardPoints,
      watchReward: watchRewardPoints,
      watchVerified,
      points: newPoints,
    });
  } catch (error) {
    return errorResponse("채팅/시청 보상 처리 실패", 500, error);
  }
}