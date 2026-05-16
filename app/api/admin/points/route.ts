import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
    const body = await req.json();

    const { userId, amount, reason } = body;

    if (!userId || !amount || !reason) {
      return NextResponse.json(
        { error: "유저, 포인트, 사유는 필수입니다." },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "유저 없음" }, { status: 404 });
    }

    const newPoints = user.points + Number(amount);

    if (newPoints < 0) {
      return NextResponse.json(
        { error: "포인트는 0보다 작아질 수 없습니다." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ points: newPoints })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: logError } = await supabaseAdmin.from("point_logs").insert({
      user_id: user.id,
      type: Number(amount) > 0 ? "admin_add" : "admin_subtract",
      amount: Number(amount),
      reason,
    });

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      points: newPoints,
    });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}