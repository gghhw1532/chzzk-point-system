import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendChzzkChat } from "@/lib/chzzk";
import { getCurrentUser } from "@/lib/auth";
import { sendDiscordDM } from "@/lib/discord";
import { applyPointMultiplier } from "@/lib/points";

function getKoreanDateString() {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().slice(0, 10);
}

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const today = getKoreanDateString();
  const rewardPoints = 50;

  const { data: already } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("attended_date", today)
    .maybeSingle();

  if (already) {
    return NextResponse.json(
      { error: "오늘은 이미 출석했습니다." },
      { status: 400 }
    );
  }

  const { data: lastAttendance } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("attended_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  let streak = 1;

  if (lastAttendance) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().slice(0, 10);

    if (lastAttendance.attended_date === yesterdayString) {
      streak = lastAttendance.streak + 1;
    }
  }

  const bonusPoints = streak > 0 && streak % 7 === 0 ? 300 : 0;
  const baseReward = rewardPoints + bonusPoints;

const totalReward = applyPointMultiplier(
  baseReward,
  user.subscription_tier
);
  const newPoints = user.points + totalReward;

  const { error: updateError } = await supabase
    .from("users")
    .update({ points: newPoints })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: attendanceError } = await supabase
    .from("attendance_logs")
    .insert({
      user_id: user.id,
      attended_date: today,
      streak,
      reward_points: totalReward,
    });

  if (attendanceError) {
    return NextResponse.json({ error: attendanceError.message }, { status: 500 });
  }

  await supabase.from("point_logs").insert({
    user_id: user.id,
    type: "attendance",
    amount: totalReward,
    reason:
      bonusPoints > 0
        ? `출석 체크 ${streak}일 연속 보상`
        : "출석 체크 보상",
  });

  await sendChzzkChat(
    `${user.nickname}님 출석 완료! +${totalReward}P (${streak}일 연속)`
  ).catch((error) => {
    console.error("[CHZZK CHAT SEND FAILED]", error);
  });

if (user.discord_user_id && user.discord_dm_enabled) {
  await sendDiscordDM(
    user.discord_user_id,
    `✅ 출석 완료!\n\n획득 포인트: +${totalReward}P\n연속 출석: ${streak}일\n현재 포인트: ${newPoints}P`
  ).catch(console.error);
}

  return NextResponse.json({
    success: true,
    rewardPoints: totalReward,
    streak,
    points: newPoints,
  });
}