// utils/queryExpansion.js — FINAL OPTIMIZED VERSION

const DISEASE_SYNONYMS = {
  "parkinson's disease": ["parkinsonism", "PD"],
  "lung cancer": ["NSCLC", "SCLC", "pulmonary carcinoma"],
  "diabetes": ["type 2 diabetes", "T2DM", "hyperglycemia"],
  "covid-19": ["SARS-CoV-2", "COVID"],
  "heart failure": ["CHF", "cardiac failure"],
};

const QUERY_SYNONYMS = {
  "deep brain stimulation": ["DBS", "neurostimulation"],
  "treatment": ["therapy", "management"],
  "vitamin d": ["cholecalciferol"],
  "exercise": ["physical activity"],
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
  if (unique.length === 0) return "";
  return unique.length === 1 ? unique[0] : `(${unique.join(" OR ")})`;
};

// ─────────────────────────────────────────
// Main function
// ─────────────────────────────────────────
const expandQuery = ({ disease = "", query = "" }) => {
  disease = disease || "general medicine";
  query = query || "treatment";

  const diseaseSynonyms = findSynonyms(disease, DISEASE_SYNONYMS).slice(0, 5);
  const querySynonyms = findSynonyms(query, QUERY_SYNONYMS).slice(0, 5);

  const baseQuery = `${query} ${disease}`;

  const queryPart = orGroup([query, ...querySynonyms]);
  const diseasePart = orGroup([disease, ...diseaseSynonyms]);

  const expandedQuery = `${queryPart} AND ${diseasePart}`;

  const pubmedQuery = `(${[query, ...querySynonyms]
    .map(t => `"${t}"[Title/Abstract]`)
    .join(" OR ")}) AND (${[disease, ...diseaseSynonyms]
    .map(t => `"${t}"[Title/Abstract]`)
    .join(" OR ")})`;

  const stopWords = new Set([
    "the","and","or","in","of","for","with","to","on","at","by"
  ]);

  const keywords = `${query} ${disease} ${querySynonyms.join(" ")} ${diseaseSynonyms.join(" ")}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  return {
    baseQuery,
    expandedQuery,
    pubmedQuery,
    keywords: [...new Set(keywords)],
  };
};

module.exports = { expandQuery };