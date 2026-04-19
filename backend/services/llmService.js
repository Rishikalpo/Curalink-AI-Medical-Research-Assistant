const axios = require("axios")

const MODEL_PRIMARY = process.env.LLM_MODEL || "llama3-8b-8192"
const MODEL_FALLBACK = "gemma2-9b-it"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

// ─────────────────────────────────────────
// 🔥 CONTEXT-AWARE PROMPT
// ─────────────────────────────────────────
const buildPrompt = (disease, query, publications, trials, history = []) => {
  const pubText = publications.slice(0, 4).map((p, i) =>
    `[${i + 1}] ${p.title} (${p.year || "?"})`
  ).join("\n")

  const trialText = trials.slice(0, 2).map((t, i) =>
    `[T${i + 1}] ${t.title} (${t.status})`
  ).join("\n")

  const contextText = history
    .filter(m => m.role === "user")
    .slice(-2)
    .map(m => `Previous: ${m.meta?.query || m.content} (${m.meta?.disease || disease})`)
    .join("\n")

  return `
You are a medical research assistant.

STRICT RULES:
- Use ONLY provided data
- DO NOT hallucinate
- Always personalize to the disease
- If question is generic, interpret it in context of the disease
- Return ONLY valid JSON

CONTEXT:
${contextText || "None"}

CURRENT DISEASE: ${disease}
CURRENT QUESTION: ${query}

PUBLICATIONS:
${pubText}

CLINICAL TRIALS:
${trialText}

OUTPUT JSON:
{
  "overview": "",
  "research_insights": [
    {
      "finding": "",
      "evidence": "",
      "source": "[1]"
    }
  ],
  "clinical_trials": [
    {
      "title": "",
      "status": "",
      "summary": ""
    }
  ],
  "gaps_and_limitations": "",
  "clinical_implications": "",
  "sources": []
}
`
}

// ─────────────────────────────────────────
// ✅ SAFE PARSER (robust)
// ─────────────────────────────────────────
const parse = (text) => {
  try {
    let clean = text.replace(/```json|```/g, "").trim()

    const start = clean.indexOf("{")
    const end = clean.lastIndexOf("}")

    if (start === -1 || end === -1) return null

    clean = clean.slice(start, end + 1)

    // fix trailing commas
    clean = clean.replace(/,\s*}/g, "}")

    return JSON.parse(clean)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────
// 🔥 GROQ CALL (fallback-safe)
// ─────────────────────────────────────────
const callGroq = async (model, prompt) => {
  return axios.post(
    GROQ_URL,
    {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a precise medical research assistant. Always output JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.0, // 🔥 more factual
      max_tokens: 900,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  )
}

// ─────────────────────────────────────────
// MAIN FUNCTION (FINAL)
// ─────────────────────────────────────────
const generateInsights = async (
  disease,
  query,
  publications,
  trials,
  history = [] // 🔥 IMPORTANT
) => {
  const prompt = buildPrompt(disease, query, publications, trials, history)

  try {
    let res

    try {
      res = await callGroq(MODEL_PRIMARY, prompt)
    } catch (err) {
      console.warn("[LLM primary failed → fallback model]")
      res = await callGroq(MODEL_FALLBACK, prompt)
    }

    const text = res.data?.choices?.[0]?.message?.content || ""
    const parsed = parse(text)

    if (parsed) return parsed

    throw new Error("Invalid JSON")

  } catch (err) {
    console.warn("[LLM fallback]", err.response?.data || err.message)

    return {
      overview: `Showing research results for ${query} in ${disease}.`,
      research_insights: publications.slice(0, 3).map((p, i) => ({
        finding: p.title,
        evidence: `Source [${i + 1}]`,
        source: `[${i + 1}]`,
      })),
      clinical_trials: trials.slice(0, 2),
      gaps_and_limitations: "LLM unavailable",
      clinical_implications: "",
      sources: [],
    }
  }
}

module.exports = { generateInsights }