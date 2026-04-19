const axios = require("axios")

const PROVIDER = process.env.LLM_PROVIDER || "groq"
const MODEL = process.env.LLM_MODEL || "mixtral-8x7b-32768"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

// ─────────────────────────────────────────
// 🔥 STRONG PROMPT BUILDER
// ─────────────────────────────────────────
const buildPrompt = (disease, query, publications, trials) => {
  const pubText = publications.slice(0, 5).map((p, i) =>
    `[${i + 1}] ${p.title} (${p.year})`
  ).join("\n")

  const trialText = trials.slice(0, 3).map((t, i) =>
    `[T${i + 1}] ${t.title} (${t.status})`
  ).join("\n")

  return `
You are an expert medical research assistant.

STRICT RULES:
- Use ONLY the provided data
- DO NOT hallucinate or invent facts
- Be specific to ${disease}
- Cite sources using [1], [2]
- ALWAYS return valid JSON only
- NEVER return empty arrays

TASK:
Analyze the research and extract meaningful insights.

DISEASE: ${disease}
QUESTION: ${query}

PUBLICATIONS:
${pubText}

CLINICAL TRIALS:
${trialText}

OUTPUT JSON (STRICT FORMAT):
{
  "overview": "Write 2–3 sentence summary of latest treatments",
  "research_insights": [
    {
      "finding": "Key medical finding",
      "evidence": "What study shows",
      "source": "[1]"
    },
    {
      "finding": "Another important insight",
      "evidence": "Supporting detail",
      "source": "[2]"
    },
    {
      "finding": "Third insight",
      "evidence": "Supporting detail",
      "source": "[3]"
    }
  ],
  "clinical_trials": [
    {
      "title": "Trial name",
      "status": "RECRUITING",
      "summary": "What the trial is testing"
    }
  ],
  "gaps_and_limitations": "What is still unknown",
  "clinical_implications": "What this means for treatment",
  "sources": ["[1]", "[2]", "[3]"]
}

IMPORTANT:
- Provide at least 3 research_insights
- Provide at least 1 clinical trial
- Do NOT return empty arrays
`
}

// ─────────────────────────────────────────
// 🔥 ROBUST JSON PARSER
// ─────────────────────────────────────────
const parse = (text) => {
  try {
    let clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

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
// 🔥 FALLBACK (SAFE)
// ─────────────────────────────────────────
const fallback = (disease, query, publications, trials) => ({
  overview: `Showing available research for ${query} in ${disease}.`,
  research_insights: publications.slice(0, 3).map((p, i) => ({
    finding: p.title,
    evidence: `See source [${i + 1}]`,
    source: `[${i + 1}]`
  })),
  clinical_trials: trials.slice(0, 2).map((t) => ({
    title: t.title,
    status: t.status,
    summary: t.summary?.slice(0, 120)
  })),
  gaps_and_limitations: "LLM unavailable",
  clinical_implications: "",
  sources: []
})

// ─────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────
const generateInsights = async (disease, query, publications, trials) => {
  const prompt = buildPrompt(disease, query, publications, trials)

  try {
    const res = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a precise medical research assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    )

    const text = res.data.choices?.[0]?.message?.content || ""
    const parsed = parse(text)

    if (parsed) return parsed

    throw new Error("Invalid JSON")

  } catch (err) {
    console.warn("[LLM fallback]", err.message)
    return fallback(disease, query, publications, trials)
  }
}

module.exports = { generateInsights }