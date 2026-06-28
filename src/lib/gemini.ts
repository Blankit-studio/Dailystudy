const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

// gemini-2.0-flash was retired on 2026-06-01; default to a current free model.
const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Calls Google Gemini (free tier) asking for structured JSON output and
 * returns the parsed result. Provider-specific logic lives only here, so
 * swapping to another free API later means changing just this file.
 */
export async function geminiGenerateJSON<T>(
  prompt: string,
  responseSchema: unknown,
): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 1.1,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API ${res.status}: ${body.slice(0, 400)}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  return parseJson<T>(text);
}

function parseJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fallback: extract the first {...} block if extra text slipped in.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as T;
    }
    throw new Error("Failed to parse Gemini JSON response");
  }
}
