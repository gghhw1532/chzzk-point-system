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

    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "설정값이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("system_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SETTINGS SAVE ERROR]", error);

    return NextResponse.json(
      { error: "설정 저장 실패" },
      { status: 500 }
    );
  }
}