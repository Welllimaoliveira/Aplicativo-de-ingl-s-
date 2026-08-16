import { authorize, callGemini, json, setCors } from "../lib/gemini.js";

function levelText(level) {
  if (level === "advanced") return "B2-C1 advanced";
  if (level === "intermediate") return "A2-B1 intermediate";
  return "A1 beginner";
}
function topicText(topic) {
  return ({
    free: "any everyday topic chosen naturally by the learner",
    daily: "daily life and routines",
    travel: "travel, airports, hotels and tourism",
    work: "workplace and professional situations",
    restaurant: "restaurants and ordering food",
    interview: "job interview practice",
    technology: "technology and artificial intelligence"
  })[topic] || "general conversation";
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Método não permitido." });
  if (!authorize(req)) return json(res, 401, { error: "Código de acesso inválido." });

  try {
    const b = req.body || {};
    const history = Array.isArray(b.history) ? b.history.slice(-16) : [];
    const historyText = history.map(h =>
      `${h.role === "model" ? "Tutor" : "Learner"}: ${String(h.text || "")}`
    ).join("\n");

    const system = `You are Fala Real AI, a warm English conversation tutor for a Brazilian Portuguese speaker.
Learner level: ${levelText(b.level)}.
Topic: ${topicText(b.topic)}.
Keep the conversation natural and in English, normally 1-3 short sentences plus a follow-up question.
Correct only important mistakes.
Return ONLY JSON:
{"reply":"English reply","correction":{"corrected":null or "better English sentence","explanationPt":null or "short Brazilian Portuguese explanation"}}`;

    const prompt = b.action === "start" && !history.length
      ? "Start the conversation with a friendly opening question."
      : `${historyText}\nLearner: ${String(b.userText || "")}\nContinue the conversation.`;

    return json(res, 200, await callGemini(system, prompt));
  } catch (e) {
    return json(res, 500, { error: e.name === "AbortError" ? "Tempo limite ao consultar a IA." : e.message });
  }
}
