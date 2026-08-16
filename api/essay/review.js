import { authorize, callGemini, json, setCors } from "../../lib/gemini.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Método não permitido." });
  if (!authorize(req)) return json(res, 401, { error: "Código de acesso inválido." });

  try {
    const b = req.body || {};
    const language = b.language === "pt" ? "Portuguese" : "English";
    const feedback = b.reviewLanguage === "en" ? "English" : "Brazilian Portuguese";
    const system = `You are Banca Real, a rigorous but pedagogical writing examiner.
Essay language: ${language}. Feedback language: ${feedback}.
Evaluate the FULL text for task fulfillment, argument quality, organization, coherence, grammar, spelling, punctuation, vocabulary, style and naturalness.
CRITICAL: correctedText must be the complete corrected essay and remain entirely in the SAME LANGUAGE as the original essay.
Return ONLY JSON:
{"score":0,"cefr":"A1-C2 or N/A",
"criteria":{"task":0,"organization":0,"coherence":0,"grammar":0,"vocabulary":0,"spelling":0},
"summaryPt":"...","summaryEn":"...","strengths":["..."],"priorities":["..."],
"corrections":[{"original":"...","corrected":"...","explanationPt":"...","explanationEn":"..."}],
"correctedText":"full corrected essay"}.
Criterion maxima: task 20, organization 15, coherence 15, grammar 20, vocabulary 15, spelling 15.`;
    return json(res, 200, await callGemini(system, JSON.stringify(b)));
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
