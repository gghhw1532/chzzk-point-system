import { supabase } from "@/lib/supabase";

export async function getSetting(
  key: string,
  fallback: string
) {
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  return data?.value ?? fallback;
}

export async function getNumberSetting(
  key: string,
  fallback: number
) {
  const value = await getSetting(
    key,
    String(fallback)
  );

  return Number(value);
}