const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Token");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

export function authorize(req) {
  const expected = process.env.APP_ACCESS_TOKEN || "";
  if (!expected) return true;
  return req.headers["x-app-token"] === expected;
}

export function json(res, status, body) {
  setCors(res);
  return res.status(status).json(body);
}

function extractText(data) {
  return (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p?.text || "")
    .join("")
    .trim();
}

function parseJsonText(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("A IA retornou um formato inesperado.");
  }
}

export async function callGemini(system, userText) {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) throw new Error("GEMINI_API_KEY não configurada no Vercel.");

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 45000);

  try {
    const models = [...new Set([MODEL, "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"])];
    let lastError = "Não foi possível consultar a IA.";
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.45 }
        }),
        signal: ctrl.signal
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) return parseJsonText(extractText(data));
      lastError = data?.error?.message || `Gemini HTTP ${response.status}`;
      // Modelo ausente, limite ou pico de demanda: tenta automaticamente o
      // próximo modelo estável, sem interromper a conversa do aluno.
      if (![404, 429, 503].includes(response.status)) throw new Error(lastError);
    }
    throw new Error(lastError);
  } finally {
    clearTimeout(timeout);
  }
}

export { MODEL };
