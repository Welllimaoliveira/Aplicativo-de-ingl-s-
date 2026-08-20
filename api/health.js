import { json, setCors, MODEL } from "../lib/gemini.js";

export default function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return json(res, 405, { error: "Método não permitido." });
  return json(res, 200, {
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL,
    speechConfigured: Boolean(process.env.GEMINI_API_KEY),
    speechModel: process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview",
    platform: "vercel"
  });
}
