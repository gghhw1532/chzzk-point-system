import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { sendDiscordDM } from "@/lib/discord";
import {
  sendChzzkChat,
  createHighlightMessage,
} from "@/lib/chzzk-chat";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "상품 ID가 없습니다." }, { status: 400 });
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { data: item, error: itemError } = await supabase
      .from("shop_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "상품 없음" }, { status: 404 });
    }

    if (!item.is_active) {
      return NextResponse.json(
        { error: "비활성화된 상품입니다." },
        { status: 400 }
      );
    }

    if (item.daily_purchase_limit) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { count, error: countError } = await supabaseAdmin
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("item_id", item.id)
    .gte("created_at", todayStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  if (countError) {
    return NextResponse.json(
      { error: "구매 제한 확인 실패" },
      { status: 500 }
    );
  }

  if ((count ?? 0) >= item.daily_purchase_limit) {
    return NextResponse.json(
      { error: "오늘 구매 가능한 수량이 모두 소진되었습니다." },
      { status: 400 }
    );
  }
}

    if (user.points < item.price) {
      return NextResponse.json({ error: "포인트 부족" }, { status: 400 });
    }

    const newPoints = user.points - item.price;

    const { error: updateError } = await supabase
      .from("users")
      .update({ points: newPoints })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    

    const { error: purchaseError } = await supabase.from("purchases").insert({
      user_id: user.id,
      item_id: item.id,
      price: item.price,
    });

    

    if (purchaseError) {
      return NextResponse.json({ error: purchaseError.message }, { status: 500 });
    }

    

    const { error: logError } = await supabase.from("point_logs").insert({
      user_id: user.id,
      type: "purchase",
      amount: -item.price,
      reason: `${item.name} 구매`,
    });

    

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    await sendChzzkChat(`${user.nickname}님께서 '${item.name}' 구매!`).catch(
      (error) => {
        console.error("[CHZZK CHAT SEND FAILED]", error);
      }
    );

    if (user.discord_user_id && user.discord_dm_enabled) {
  await sendDiscordDM(
    user.discord_user_id,
    `🛒 상품 구매 완료!\n\n상품: ${item.name}\n사용 포인트: ${item.price}P\n남은 포인트: ${newPoints}P`
  ).catch(console.error);

  await sendChzzkChat(
  createHighlightMessage([
    "🛒 포인트 상점 구매!",
    `👤 ${user.nickname}`,
    `🎁 ${item.name}`,
    `💰 ${item.price}P 사용`,
  ])
);
}

    return NextResponse.json({
      success: true,
      remainingPoints: newPoints,
    });
  } catch (error) {
    console.error("[PURCHASE API ERROR]", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}