import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordChannelMessage } from "@/lib/discord";
import { checkAdminApi } from "@/lib/admin";

export async function POST(req: Request) {
  try {

    const admin = await checkAdminApi();

if (!admin.ok) {
  return NextResponse.json(
    { error: admin.message },
    { status: admin.status }
  );
}

    const { predictionId, winningOptionId } = await req.json();

    if (!predictionId || !winningOptionId) {
      return NextResponse.json(
        { error: "예측 ID와 정답 선택지가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: prediction } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("id", predictionId)
      .single();

    if (!prediction) {
      return NextResponse.json({ error: "예측 없음" }, { status: 404 });
    }

    if (prediction.status === "settled") {
      return NextResponse.json(
        { error: "이미 정산된 예측입니다." },
        { status: 400 }
      );
    }

    const { data: bets } = await supabaseAdmin
      .from("prediction_bets")
      .select("*")
      .eq("prediction_id", predictionId);

    if (!bets || bets.length === 0) {
      await supabaseAdmin
        .from("predictions")
        .update({
          status: "settled",
          winning_option_id: winningOptionId,
        })
        .eq("id", predictionId);

      return NextResponse.json({ success: true, message: "배팅 없음" });
    }

    const winningBets = bets.filter((bet) => bet.option_id === winningOptionId);
    const losingBets = bets.filter((bet) => bet.option_id !== winningOptionId);

    const winningTotal = winningBets.reduce((sum, bet) => sum + bet.amount, 0);
    const losingTotal = losingBets.reduce((sum, bet) => sum + bet.amount, 0);

    if (winningTotal <= 0) {
      await supabaseAdmin
        .from("predictions")
        .update({
          status: "settled",
          winning_option_id: winningOptionId,
        })
        .eq("id", predictionId);

      return NextResponse.json({
        success: true,
        message: "정답자가 없어 포인트 지급 없음",
      });
    }

    for (const bet of winningBets) {
      const profit = Math.floor(losingTotal * (bet.amount / winningTotal));
      const payout = bet.amount + profit;

      const { data: user } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", bet.user_id)
        .single();

      if (!user) continue;

      const newPoints = user.points + payout;

      await supabaseAdmin
        .from("users")
        .update({ points: newPoints })
        .eq("id", user.id);

      await supabaseAdmin.from("point_logs").insert({
        user_id: user.id,
        type: "prediction_win",
        amount: payout,
        reason: `승부예측 적중: ${prediction.title}`,
      });
    }

    await supabaseAdmin
      .from("predictions")
      .update({
        status: "settled",
        winning_option_id: winningOptionId,
      })
      .eq("id", predictionId);

      await sendDiscordChannelMessage(
  `🏁 승부예측이 정산되었습니다!\n\n주제: ${prediction.title}\n정답자: ${winningBets.length}명\n정답 쪽 총 배팅: ${winningTotal}P\n오답 쪽 총 배팅: ${losingTotal}P`
).catch(console.error);

    return NextResponse.json({
      success: true,
      winningTotal,
      losingTotal,
      winners: winningBets.length,
    });
  } catch (error) {
    console.error("[PREDICTION SETTLE ERROR]", error);

    

    return NextResponse.json(
      { error: "정산 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}