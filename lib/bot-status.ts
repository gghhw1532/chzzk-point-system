import { supabaseAdmin } from "@/lib/supabase/admin";

export async function updateBotStatus(
  name: string,
  status: "online" | "offline" | "error",
  memo?: string
) {
  const { error } = await supabaseAdmin.from("bot_status").upsert(
    {
      name,
      status,
      memo: memo ?? null,
      last_ping: new Date().toISOString(),
    },
    {
      onConflict: "name",
    }
  );

  if (error) {
    console.error("[BOT STATUS UPDATE ERROR]", error);
  }
}