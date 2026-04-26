require("dotenv").config();
console.log(process.env.TOKEN);
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
// 🔴 GANTI SEMUA INI
const TOKEN = "MTQ5NzgyMTQ0MTc2MzMxNTg3Mg.GPjl0A.dFt2wnL10nw_sJ898LJDuSzyfl87ih64SB4k6w";
const CHANNEL_ID = "1497297946545356902";
const TARGET_BOT_ID = "1497298005198377131"; 
const WEBHOOK = "https://script.google.com/macros/s/AKfycbxvg33vrVpRShg7VJwoNYz9Cmwc5kaS1jLWXOsYjIvpfnJ2XxeUT0HfpvC7ED7ZeiRzVg/exec";
const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Bot aktif di Render");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
  });
// init bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔧 convert 8:49 AM → 08:49
function convertJam(text) {
  const match = text.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
  if (!match) return "";

  let hour = parseInt(match[1]);
  let minute = match[2];
  let period = match[3];

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute}`;
}

// bot ready
client.on("clientReady", () => {
  console.log("✅ Bot aktif!");
});

// baca pesan
client.on("messageCreate", async (message) => {

  // hanya ambil dari bot tertentu
  if (message.author.id !== TARGET_BOT_ID) return;

  // hanya channel tertentu
  if (message.channel.id !== CHANNEL_ID) return;

  let text = "";

  // 🔥 ambil dari EMBED (penting!)
  if (message.embeds.length > 0) {
    const embed = message.embeds[0];

    const title = embed.title || "";
    const desc = embed.description || "";

    text = title + "\n" + desc;

  } else {
    text = message.content;
  }

  console.log("\n=== PESAN MASUK ===");
  console.log(text);

  // pastikan ini absensi
  if (!text.includes("Clock In Time")) return;

  try {
   const lines = text.split("\n");

// cari baris nama (bukan clock)
let nama = lines.find(line => 
  line &&
  !line.includes("Clock") &&
  !line.includes("Time") &&
  !line.includes("Duty")
);

nama = nama ? nama.trim() : "";

if (!nama) {
  console.log("❌ Nama tidak ditemukan");
  return;
}
    // ambil jam masuk
    const masukMatch = text.match(/Clock In Time:.*?(\d{1,2}:\d{2} [AP]M)/);
    if (!masukMatch) return;

    const jamMasuk = convertJam(masukMatch[1]);

    // ambil jam keluar (opsional)
    const keluarMatch = text.match(/Clock Out Time:.*?(\d{1,2}:\d{2} [AP]M)/);
    const jamKeluar = keluarMatch ? convertJam(keluarMatch[1]) : "";

    console.log("Nama:", nama);
    console.log("Masuk:", jamMasuk);
    console.log("Keluar:", jamKeluar);

    // kirim ke Google Sheets
    await axios.post(WEBHOOK, {
      nama: nama,
      masuk: jamMasuk,
      keluar: jamKeluar
    });

    console.log("📤 Berhasil kirim ke Sheets");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
});
console.log("CEK ENV:", process.env);
// login bot
client.login(process.env.TOKEN);
client.login(TOKEN);