const axios = require("axios")

const MODEL_PRIMARY = process.env.LLM_MODEL || "llama-3.1-8b-instant"
const MODEL_FALLBACK = "llama-3.1-8b-instant"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

// ─────────────────────────────────────────
// 🔥 STRONG PROMPT
// ─────────────────────────────────────────
const buildPrompt = (disease, query, publications, trials) => {
  const pubText = publications.slice(0, 5).map((p, i) =>
    `[${i + 1}] ${p.title} (${p.year || "?"})`
  ).join("\n")

  const trialText = trials.slice(0, 3).map((t, i) =>
    `[T${i + 1}] ${t.title} (${t.status})`
  ).join("\n")

  return `
You are a medical research assistant.

STRICT RULES:
- Use ONLY provided data
- DO NOT hallucinate
- Return ONLY valid JSON
- NEVER return empty arrays

DISEASE: ${disease}
QUESTION: ${query}

PUBLICATIONS:
${pubText}

CLINICAL TRIALS:
${trialText}

OUTPUT JSON (STRICT):
{
  "overview": "2-3 sentence summary",
  "research_insights": [
    {
      "finding": "clear insight",
      "evidence": "supporting detail",
      "source": "[1]"
    }
  ],
  "clinical_trials": [
    {
      "title": "trial name",
      "status": "RECRUITING",
      "summary": "short summary"
    }
  ],
  "gaps_and_limitations": "what is missing",
  "clinical_implications": "what doctors should do",
  "sources": ["[1]"]
}

IMPORTANT:
- At least 3 research_insights
- At least 1 clinical_trial
- Do NOT leave arrays empty
`
}

// ─────────────────────────────────────────
// ✅ SAFE PARSER
// ─────────────────────────────────────────
const parse = (text) => {
  try {
    let clean = text.replace(/```json|```/g, "").trim()

    const start = clean.indexOf("{")
    const end = clean.lastIndexOf("}")

    if (start === -1 || end === -1) return null

    clean = clean.slice(start, end + 1)

    return JSON.parse(clean)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────
// 🔥 GROQ CALL (with fallback model)
// ─────────────────────────────────────────
const callGroq = async (model, prompt) => {
  return axios.post(
    GROQ_URL,
    {
      model,
      messages: [
        {
          role: "system",
          content: "You are a precise medical research assistant that outputs JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
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
// MAIN FUNCTION
// ─────────────────────────────────────────
const generateInsights = async (disease, query, publications, trials) => {
  const prompt = buildPrompt(disease, query, publications, trials)

  try {
    // 🔥 Try primary model
    let res
    try {
      res = await callGroq(MODEL_PRIMARY, prompt)
    } catch (err) {
      console.warn("[LLM primary failed → switching model]")
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
        source: `[${i + 1}]`
      })),
      clinical_trials: trials.slice(0, 2),
      gaps_and_limitations: "LLM unavailable",
      clinical_implications: "",
      sources: []
    }
  }
}

module.exports = { generateInsights }