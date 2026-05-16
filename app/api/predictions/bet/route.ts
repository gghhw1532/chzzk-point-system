import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { sendChzzkChat } from "@/lib/chzzk";
import { sendDiscordDM } from "@/lib/discord";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const { predictionId, optionId, amount } = body;

  const betAmount = Number(amount);

  if (!predictionId || !optionId || !betAmount || betAmount <= 0) {
    return NextResponse.json(
      { error: "배팅 정보가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const { data: prediction } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", predictionId)
    .single();

  if (!prediction) {
    return NextResponse.json({ error: "예측 없음" }, { status: 404 });
  }

  if (prediction.status !== "open") {
    return NextResponse.json(
      { error: "이미 마감된 예측입니다." },
      { status: 400 }
    );
  }

  if (prediction.closes_at && new Date(prediction.closes_at) < new Date()) {
    return NextResponse.json(
      { error: "배팅 시간이 종료되었습니다." },
      { status: 400 }
    );
  }

  const { data: existingBet } = await supabase
    .from("prediction_bets")
    .select("*")
    .eq("prediction_id", predictionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingBet) {
    return NextResponse.json(
      { error: "이미 이 예측에 배팅했습니다." },
      { status: 400 }
    );
  }

  if (user.points < betAmount) {
    return NextResponse.json({ error: "포인트 부족" }, { status: 400 });
  }

  const newPoints = user.points - betAmount;

  const { error: updateError } = await supabase
    .from("users")
    .update({ points: newPoints })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: betError } = await supabase.from("prediction_bets").insert({
    prediction_id: predictionId,
    option_id: optionId,
    user_id: user.id,
    amount: betAmount,
  });

  if (betError) {
    return NextResponse.json({ error: betError.message }, { status: 500 });
  }

  
  
  await supabase.from("point_logs").insert({
    user_id: user.id,
    type: "prediction_bet",
    amount: -betAmount,
    reason: `승부예측 배팅: ${prediction.title}`,
  });

  

  await sendChzzkChat(
    `${user.nickname}님 '${prediction.title}'에 ${betAmount}P 배팅!`
  ).catch(console.error);

  if (user.discord_user_id && user.discord_dm_enabled) {
  await sendDiscordDM(
    user.discord_user_id,
    `🎲 배팅 완료!\n\n예측: ${prediction.title}\n배팅 포인트: ${betAmount}P\n남은 포인트: ${newPoints}P`
  ).catch(console.error);
}

  return NextResponse.json({
    success: true,
    remainingPoints: newPoints,
  });
}