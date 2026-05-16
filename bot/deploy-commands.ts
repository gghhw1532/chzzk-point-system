import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("포인트")
    .setDescription("내 포인트를 확인합니다."),

  new SlashCommandBuilder()
    .setName("랭킹")
    .setDescription("랭킹 페이지 링크를 확인합니다."),

  new SlashCommandBuilder()
    .setName("상점")
    .setDescription("상점 페이지 링크를 확인합니다."),

  new SlashCommandBuilder()
    .setName("예측")
    .setDescription("승부예측 페이지 링크를 확인합니다."),

  new SlashCommandBuilder()
    .setName("패널")
    .setDescription("사이트 패널 메시지를 생성합니다."),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN!
);

async function deploy() {
  try {
    console.log("슬래시 명령어 등록 중...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!
      ),
      {
        body: commands,
      }
    );

    console.log("슬래시 명령어 등록 완료!");
  } catch (error) {
    console.error(error);
  }
}

deploy();