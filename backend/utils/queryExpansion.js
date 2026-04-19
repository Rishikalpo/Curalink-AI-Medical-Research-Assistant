// utils/queryExpansion.js — FINAL PRODUCTION VERSION (SMART + STRUCTURED)

const DISEASE_SYNONYMS = {
  "parkinson's disease": ["parkinsonism", "PD"],
  "lung cancer": ["NSCLC", "SCLC", "pulmonary carcinoma"],
  "diabetes": ["type 2 diabetes", "T2DM", "hyperglycemia"],
  "covid-19": ["SARS-CoV-2", "COVID"],
  "heart failure": ["CHF", "cardiac failure"],
};

const QUERY_SYNONYMS = {
  "deep brain stimulation": ["DBS", "neurostimulation"],
  "treatment": ["therapy", "management", "latest treatment"],
  "vitamin d": ["cholecalciferol", "supplementation"],
  "exercise": ["physical activity", "rehabilitation"],
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const norm = (s) => (s || "").toLowerCase().trim();

const findSynonyms = (input, map) => {
  const key = norm(input);

  if (map[key]) return map[key];

  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k) && k.length > 3) return v;
  }

  return [];
};

const orGroup = (terms) => {
  const unique = [...new Set(terms.filter(Boolean))];
  if (!unique.length) return "";
  return unique.length === 1 ? unique[0] : `(${unique.join(" OR ")})`;
};

// ─────────────────────────────────────────
// 🔥 INTENT DETECTION
// ─────────────────────────────────────────
const detectIntent = (query) => {
  const q = norm(query);

  if (q.includes("trial") || q.includes("study")) return "trial";
  if (q.includes("vitamin") || q.includes("diet") || q.includes("exercise")) return "lifestyle";
  if (q.includes("treatment") || q.includes("therapy")) return "treatment";

  return "general";
};

// ─────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────
const expandQuery = ({
  disease = "",
  query = "",
  patientName = "",
  location = "",
}) => {
  disease = disease || "general medicine";
  query = query || "treatment";

  const diseaseNorm = norm(disease);
  const queryNorm = norm(query);

  const diseaseSynonyms = findSynonyms(disease, DISEASE_SYNONYMS).slice(0, 5);
  const querySynonyms = findSynonyms(query, QUERY_SYNONYMS).slice(0, 5);

  const intent = detectIntent(query);

  // ─────────────────────────────────────────
  // 🔥 FORCE disease-aware query
  // ─────────────────────────────────────────
  const queryPart = orGroup([queryNorm, ...querySynonyms]);
  const diseasePart = orGroup([diseaseNorm, ...diseaseSynonyms]);

  let expandedQuery = `${queryPart} AND ${diseasePart}`;

  // ─────────────────────────────────────────
  // 🔥 INTENT-BASED ENRICHMENT
  // ─────────────────────────────────────────
  if (intent === "treatment") {
    expandedQuery += " AND (treatment OR therapy OR management)";
  }

  if (intent === "trial") {
    expandedQuery += " AND (clinical trial OR randomized trial OR study)";
  }

  if (intent === "lifestyle") {
    expandedQuery += " AND (supplement OR diet OR lifestyle OR nutrition)";
  }

  // ─────────────────────────────────────────
  // 🔥 PubMed Query (high precision)
  // ─────────────────────────────────────────
  const pubmedQuery = `
    (${[queryNorm, ...querySynonyms]
      .map(t => `"${t}"[Title/Abstract]`)
      .join(" OR ")})
    AND
    (${[diseaseNorm, ...diseaseSynonyms]
      .map(t => `"${t}"[Title/Abstract]`)
      .join(" OR ")})
  `.replace(/\s+/g, " ").trim();

  // ─────────────────────────────────────────
  // 🔥 Keywords for ranking
  // ─────────────────────────────────────────
  const stopWords = new Set([
    "the","and","or","in","of","for","with","to","on","at","by"
  ]);

  const keywords = `${queryNorm} ${diseaseNorm} ${querySynonyms.join(" ")} ${diseaseSynonyms.join(" ")}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // ─────────────────────────────────────────
  // 🔥 Structured context (for personalization)
  // ─────────────────────────────────────────
  const context = {
    patientName: patientName || null,
    location: location || null,
  };

  return {
    baseQuery: `${queryNorm} ${diseaseNorm}`,
    expandedQuery,
    pubmedQuery,
    keywords: [...new Set(keywords)],
    intent,
    context, // 🔥 NEW (important)
  };
};

module.exports = { expandQuery };