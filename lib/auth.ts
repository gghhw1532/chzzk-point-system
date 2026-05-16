import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("current_user_id")?.value;

  if (!userId) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return user;
}