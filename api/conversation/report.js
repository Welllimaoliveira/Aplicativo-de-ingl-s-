import { authorize, callGemini, json, setCors } from "../../lib/gemini.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Método não permitido." });
  if (!authorize(req)) return json(res, 401, { error: "Código de acesso inválido." });

  try {
    const system = `You are an English speaking examiner coaching a Brazilian Portuguese learner.
Analyze only the supplied conversation transcripts.
Recognition confidence is a proxy, not a true acoustic pronunciation score.
Return ONLY JSON with:
{"overall":0,"cefr":"A1-C2","grammar":0,"vocabulary":0,"fluency":0,"naturalness":0,"pronunciationProxy":0,
"summaryPt":"...","strengths":["..."],"corrections":[{"said":"...","better":"...","whyPt":"..."}],
"recurrentErrors":["..."],"studyPlan":["..."]}.
All numeric scores are 0-100. Do not invent errors not present.`;
    return json(res, 200, await callGemini(system, JSON.stringify(req.body || {})));
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
