import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDiscordChannelMessage } from "@/lib/discord";
import { checkAdminApi } from "@/lib/admin";


export async function POST(req: Request) {

const admin = await checkAdminApi();

if (!admin.ok) {
  return NextResponse.json(
    { error: admin.message },
    { status: admin.status }
  );
}

  const body = await req.json();
  const { title, option1, option2, closesAt } = body;

  if (!title || !option1 || !option2) {
    return NextResponse.json(
      { error: "제목과 선택지 2개는 필수입니다." },
      { status: 400 }
    );
  }

  const { data: prediction, error } = await supabaseAdmin
    .from("predictions")
    .insert({
      title,
      closes_at: closesAt || null,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !prediction) {
    return NextResponse.json(
      { error: error?.message || "예측 생성 실패" },
      { status: 500 }
    );
  }

  const { error: optionError } = await supabaseAdmin
    .from("prediction_options")
    .insert([
      { prediction_id: prediction.id, title: option1 },
      { prediction_id: prediction.id, title: option2 },
    ]);

  if (optionError) {
    return NextResponse.json({ error: optionError.message }, { status: 500 });
  }

  await sendDiscordChannelMessage(
  `🎲 새로운 승부예측이 시작되었습니다!\n\n주제: ${title}\n선택지: ${option1} / ${option2}\n\n참여하기: ${process.env.NEXT_PUBLIC_SITE_URL}/predictions`
).catch(console.error);

  return NextResponse.json({ success: true });
}