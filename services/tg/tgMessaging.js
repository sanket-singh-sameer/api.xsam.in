import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const THREAD_ID = 1;

function formatTelegramText(input) {
  if (input === null || input === undefined) {
    return "";
  }

  if (typeof input === "object") {
    return JSON.stringify(input, null, 2);
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    const looksLikeJson =
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"));

    if (looksLikeJson) {
      try {
        return JSON.stringify(JSON.parse(trimmed), null, 2);
      } catch {
        return input;
      }
    }

    return input;
  }

  return String(input);
}

export async function sendToTopic(text, threadID = THREAD_ID) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const res = await axios.post(url, {
      chat_id: CHAT_ID,
      text: text,
      message_thread_id: threadID,
    });

    console.log("✅ Sent:", res.data);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}