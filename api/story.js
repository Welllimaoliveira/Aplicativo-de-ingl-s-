import { authorize, callGemini, json, setCors } from "../lib/gemini.js";

function levelText(level) {
  if (level === "advanced") return "B2-C1 advanced (richer vocabulary, longer sentences, some idioms)";
  if (level === "intermediate") return "A2-B1 intermediate (everyday vocabulary, simple past/future, connectors)";
  return "A1 beginner (very simple present-tense sentences, common words, short clauses)";
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Método não permitido." });
  if (!authorize(req)) return json(res, 401, { error: "Código de acesso inválido." });

  try {
    const b = req.body || {};
    const theme = String(b.theme || "").trim().slice(0, 200);
    if (!theme) return json(res, 400, { error: "Descreva um tema para a história." });
    const level = ["beginner", "intermediate", "advanced"].includes(b.level) ? b.level : "beginner";

    const system = `You are a children/adult-friendly English-learning story writer for Brazilian Portuguese speakers using the "Fala Real" app.
Write an ORIGINAL story (never copy an existing copyrighted text) inspired by the theme the learner gives you, at ${levelText(level)} level.
Rules:
- At least 20 and at most 26 short segments (paragraphs), each 1-3 sentences in English.
- Every segment needs an accurate, natural Brazilian Portuguese translation.
- Content must be wholesome and appropriate for all ages: no violence, profanity, sexual content, drugs or real tragedy - even for dark/mythological/biblical/historical themes, tell it in a gentle, respectful, age-appropriate way.
- Keep vocabulary and grammar consistent with the requested level throughout.
- Pick one emoji that represents the story as its icon.
Return ONLY JSON in this exact shape:
{"title":"Short English title","description":"Uma frase em português descrevendo a história.","icon":"📖","segments":[["Tradução em português.","English sentence."], ...at least 20 items...]}`;

    const prompt = `Tema pedido pelo aluno: "${theme}". Nível: ${level}. Gere a história agora, com pelo menos 20 segmentos.`;

    const result = await callGemini(system, prompt);
    const segments = Array.isArray(result?.segments) ? result.segments.filter((s) => Array.isArray(s) && s[0] && s[1]) : [];
    if (segments.length < 12) throw new Error("A IA gerou uma história curta demais. Tente descrever o tema de outro jeito.");

    return json(res, 200, {
      id: `ai-${Date.now()}`,
      level,
      icon: typeof result.icon === "string" && result.icon ? result.icon : "📖",
      title: String(result.title || theme).slice(0, 120),
      description: String(result.description || "").slice(0, 240),
      segments: segments.slice(0, 30),
      generated: true,
    });
  } catch (e) {
    return json(res, 500, { error: e.name === "AbortError" ? "Tempo limite ao gerar a história." : e.message });
  }
}
