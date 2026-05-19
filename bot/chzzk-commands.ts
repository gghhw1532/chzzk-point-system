import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendChzzkChat } from "@/lib/chzzk-chat";

export async function handleChzzkCommand(data: any) {
  const content = String(data.content ?? "").trim();

  if (!content.startsWith("!")) return false;

  const chzzkChannelId = data.senderChannelId;
  const nickname = data.profile?.nickname ?? "시청자";

  if (!chzzkChannelId) return false;

  if (content === "!포인트") {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("chzzk_channel_id", chzzkChannelId)
      .maybeSingle();

    if (!user) {
      await sendChzzkChat(
        `💰 ${nickname}님, 사이트에서 치지직 로그인을 먼저 해주세요!`
      );
      return true;
    }

    await sendChzzkChat(
      `💰 ${nickname}님의 현재 포인트는 ${Number(
        user.points ?? 0
      ).toLocaleString()}P 입니다!`
    );

    return true;
  }

  if (content === "!상점") {
    await sendChzzkChat(
      `🛒 포인트 상점: ${process.env.NEXT_PUBLIC_SITE_URL}/shop`
    );
    return true;
  }

  if (content === "!예측") {
    const { data: predictions } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (!predictions || predictions.length === 0) {
      await sendChzzkChat("🔮 현재 진행 중인 승부예측이 없습니다.");
      return true;
    }

    await sendChzzkChat(
      `🔮 진행 중인 승부예측 ${predictions.length}개! 참여하기: ${process.env.NEXT_PUBLIC_SITE_URL}/predictions`
    );

    return true;
  }

  if (content === "!랭킹") {
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("nickname, points")
      .order("points", { ascending: false })
      .limit(3);

    if (!users || users.length === 0) {
      await sendChzzkChat("🏆 아직 랭킹 데이터가 없습니다.");
      return true;
    }

    const rankingText = users
      .map(
        (user, index) =>
          `${index + 1}위 ${user.nickname} ${Number(
            user.points ?? 0
          ).toLocaleString()}P`
      )
      .join(" / ");

    await sendChzzkChat(`🏆 포인트 랭킹 TOP3 | ${rankingText}`);

    return true;
  }

  return false;
}