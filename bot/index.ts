import dotenv from "dotenv";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateBotStatus } from "@/lib/bot-status";

dotenv.config({ path: ".env.local" });
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  GatewayIntentBits,
} from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

client.once("clientReady", () => {
  console.log(`${client.user?.tag} 로그인 완료!`);
  updateBotStatus("discord", "online", "디스코드 봇 로그인 완료").catch(console.error);
});

client.on("error", async () => {
  await updateBotStatus("discord", "error", "디스코드 봇 오류");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

 if (interaction.commandName === "포인트") {
  const discordId = interaction.user.id;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("discord_id", discordId)
    .single();

  if (!user) {
    await interaction.reply({
      content:
        "연동된 계정을 찾을 수 없어요.\n먼저 사이트에서 디스코드 연동을 해주세요.",
      ephemeral: true,
    });

    return;
  }

  await interaction.reply({
    content: `
👤 ${user.nickname}
💰 현재 포인트: ${user.points.toLocaleString()}P
`,
    ephemeral: true,
  });
}

  if (interaction.commandName === "랭킹") {
    await interaction.reply({
      content: `랭킹 보러가기\n${SITE_URL}/ranking`,
    });
  }

  if (interaction.commandName === "상점") {
    await interaction.reply({
      content: `상점 보러가기\n${SITE_URL}/shop`,
    });
  }

  if (interaction.commandName === "예측") {
    await interaction.reply({
      content: `승부예측 보러가기\n${SITE_URL}/predictions`,
    });
  }

  if (interaction.commandName === "패널") {
    const row =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("내 정보")
          .setStyle(ButtonStyle.Link)
          .setURL(`${SITE_URL}/me`),

        new ButtonBuilder()
          .setLabel("상점")
          .setStyle(ButtonStyle.Link)
          .setURL(`${SITE_URL}/shop`),

        new ButtonBuilder()
          .setLabel("승부예측")
          .setStyle(ButtonStyle.Link)
          .setURL(`${SITE_URL}/predictions`),

        new ButtonBuilder()
          .setLabel("랭킹")
          .setStyle(ButtonStyle.Link)
          .setURL(`${SITE_URL}/ranking`)
      );

    await interaction.reply({
      content: "치지직 포인트 시스템 바로가기",
      components: [row],
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);