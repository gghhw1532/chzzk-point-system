import { NextResponse } from "next/server";

export function successResponse(data: object = {}) {
  return NextResponse.json({
    success: true,
    ...data,
  });
}

export function errorResponse(
  message: string,
  status = 500,
  detail?: unknown
) {
  if (detail) {
    console.error("[API ERROR]", message, detail);
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    }
  );
}