// Thin client for the Gemini API (generateContent), called directly from the
// browser. This is fine for a personal-use / prototype deployment, but the
// API key is visible in client-side network requests. For a public multi-user
// deployment, proxy these calls through a small server route instead and keep
// the key server-side only.

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

function getApiKey() {
  // Priority: key saved by the user in Settings (localStorage) > build-time env var.
  const stored = localStorage.getItem("guru_gemini_key");
  return stored || import.meta.env.VITE_GEMINI_API_KEY || "";
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

/**
 * Send a chat turn to Gemini.
 * @param {Array<{role: 'user'|'model', text?: string, imageBase64?: string, mimeType?: string}>} history
 * @param {{useSearch?: boolean, systemInstruction?: string, model?: string}} opts
 */
export async function sendChat(history, opts = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const model = opts.model || DEFAULT_MODEL;
  const url = `${API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = history.map((turn) => {
    const parts = [];
    if (turn.text) parts.push({ text: turn.text });
    if (turn.imageBase64) {
      parts.push({
        inline_data: {
          mime_type: turn.mimeType || "image/jpeg",
          data: turn.imageBase64,
        },
      });
    }
    return { role: turn.role === "model" ? "model" : "user", parts };
  });

  const body = {
    contents,
    systemInstruction: opts.systemInstruction
      ? { role: "system", parts: [{ text: opts.systemInstruction }] }
      : undefined,
    tools: opts.useSearch ? [{ google_search: {} }] : undefined,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`GEMINI_ERROR_${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p) => p.text || "").join("") ||
    "I didn't get a response back — mind trying that again?";

  const groundingChunks =
    candidate?.groundingMetadata?.groundingChunks
      ?.map((c) => c.web)
      .filter(Boolean) || [];

  return { text, sources: groundingChunks };
}
