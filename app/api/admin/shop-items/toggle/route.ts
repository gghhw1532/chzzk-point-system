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

    const { itemId, isActive } = body;

    const { error } = await supabaseAdmin
      .from("shop_items")
      .update({
        is_active: !isActive,
      })
      .eq("id", itemId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}