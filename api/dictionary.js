import { authorize, callGemini, json, setCors } from "../lib/gemini.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Método não permitido." });
  if (!authorize(req)) return json(res, 401, { error: "Código de acesso inválido." });

  try {
    const word = String(req.body?.word || "").slice(0, 80);
    const system = `You are a concise English-to-Brazilian-Portuguese learner dictionary.
Return ONLY JSON:
{"word":"...","translation":"Brazilian Portuguese meaning(s)","example":"one simple English example sentence","tipPt":"one short Portuguese usage or pronunciation tip"}.`;
    return json(res, 200, await callGemini(system, word));
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
