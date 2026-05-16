import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/me");
  }

  if (!["admin", "streamer"].includes(user.role)) {
    redirect("/");
  }

  return user;
}

export async function checkAdminApi() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      status: 401,
      message: "로그인이 필요합니다.",
    };
  }

  if (!["admin", "streamer"].includes(user.role)) {
    return {
      ok: false,
      status: 403,
      message: "관리자 권한이 없습니다.",
    };
  }

  return {
    ok: true,
    user,
  };
}