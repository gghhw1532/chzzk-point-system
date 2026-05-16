import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkAdminApi } from "@/lib/admin";

export async function GET() {
  return NextResponse.json({
    message: "shop-items API 연결 성공",
  });
}

export async function POST(req: Request) {

  const admin = await checkAdminApi();

if (!admin.ok) {
  return NextResponse.json(
    { error: admin.message },
    { status: admin.status }
  );
}

  const body = await req.json();

  const { name, price, description } = body;

  if (!name || !price) {
    return NextResponse.json(
      { error: "상품 이름과 가격은 필수입니다." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("shop_items").insert({
    name,
    price,
    description,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}