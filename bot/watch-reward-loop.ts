import { supabaseAdmin } from "@/lib/supabase/admin";
import { applyPointMultiplier } from "@/lib/points";
import { getNumberSetting } from "@/lib/settings";

const CHECK_INTERVAL_MS = 60 * 1000;

export function startWatchRewardLoop() {
  console.log("[WATCH REWARD] 시청 보상 루프 시작");

  setInterval(async () => {
    try {
      await processWatchRewards();
    } catch (error) {
      console.error("[WATCH REWARD ERROR]", error);
    }
  }, CHECK_INTERVAL_MS);
}

async function processWatchRewards() {
  const rewardPoints = await getNumberSetting("watch_reward_points", 5);
  const rewardMinutes = await getNumberSetting("watch_reward_minutes", 5);
  const ACTIVITY_TIMEOUT_MINUTES = 120;

  const now = new Date();

  const { data: sessions, error } = await supabaseAdmin
    .from("watch_sessions")
    .select(`
      *,
      users (
        id,
        points,
        subscription_tier
      )
    `)
    .eq("is_watching", true);

  if (error) {
    console.error("[WATCH REWARD SELECT ERROR]", error);
    return;
  }

  for (const session of sessions ?? []) {
    const lastRewardAt = session.last_watch_reward_at
      ? new Date(session.last_watch_reward_at)
      : new Date(session.started_at);

      const lastActivityAt = session.last_activity_at
  ? new Date(session.last_activity_at)
  : new Date(session.started_at);

const inactiveMinutes =
  (now.getTime() - lastActivityAt.getTime()) / 1000 / 60;

if (inactiveMinutes >= ACTIVITY_TIMEOUT_MINUTES) {
  await supabaseAdmin
    .from("watch_sessions")
    .update({
      is_watching: false,
      updated_at: now.toISOString(),
    })
    .eq("id", session.id);

  console.log(
    `[WATCH REWARD] ${session.user_id} 시청 종료 처리`
  );

  continue;
}

    const diffMinutes =
      (now.getTime() - lastRewardAt.getTime()) / 1000 / 60;

    if (diffMinutes < rewardMinutes) continue;

    const user = session.users;

    if (!user) continue;

    const finalReward = applyPointMultiplier(
      rewardPoints,
      user.subscription_tier
    );

    const newPoints = (user.points ?? 0) + finalReward;

    await supabaseAdmin
      .from("users")
      .update({
        points: newPoints,
      })
      .eq("id", user.id);

    await supabaseAdmin.from("point_logs").insert({
      user_id: user.id,
      type: "watch_reward",
      amount: finalReward,
      reason: "시청 시간 자동 보상",
    });

    await supabaseAdmin
      .from("watch_sessions")
      .update({
        last_watch_reward_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", session.id);

    console.log(
      `[WATCH REWARD] ${user.id} +${finalReward}P 지급`
    );
  }

  
}