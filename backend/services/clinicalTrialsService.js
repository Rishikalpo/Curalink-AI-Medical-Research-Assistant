// services/clinicalTrialsService.js — UPGRADED v2
// Fetches + intelligently scores clinical trials from ClinicalTrials.gov v2 API.
//
// Scoring factors:
//   1. Status priority  — RECRUITING scored highest, descending to COMPLETED
//   2. Keyword match    — title + summary vs. user disease+query terms
//   3. Phase priority   — Phase 3/4 preferred over Phase 1
//   4. Recency          — recently started trials preferred

const axios = require("axios");
const cache = require("../config/cache");

const BASE_URL    = "https://clinicaltrials.gov/api/v2/studies";
const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// Status scoring (higher = more actionable for patients/researchers)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_SCORES = {
  "RECRUITING":              10,
  "NOT_YET_RECRUITING":       7,
  "ENROLLING_BY_INVITATION":  6,
  "ACTIVE_NOT_RECRUITING":    4,
  "COMPLETED":                3,
  "SUSPENDED":                1,
  "TERMINATED":               0,
  "WITHDRAWN":                0,
  "UNKNOWN":                  1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Phase scoring
// ─────────────────────────────────────────────────────────────────────────────
const PHASE_SCORES = {
  "PHASE4":  5,
  "PHASE3":  4,
  "PHASE2":  3,
  "PHASE1":  2,
  "NA":      1,
};

const phaseScore = (phases = []) => {
  if (!phases || phases.length === 0) return 1;
  return Math.max(...phases.map((p) => PHASE_SCORES[p.replace(/\s+/g, "").toUpperCase()] || 1));
};

// ─────────────────────────────────────────────────────────────────────────────
// Keyword match helper
// ─────────────────────────────────────────────────────────────────────────────
const countMatches = (text, keywords) => {
  if (!text || !keywords || keywords.length === 0) return 0;
  const lower = text.toLowerCase();
  return keywords.reduce((n, kw) => n + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
};

/**
 * Keyword relevance score (normalised 0–1) for a trial
 */
const trialKeywordScore = (trial, keywords) => {
  if (!keywords || keywords.length === 0) return 0;
  const titleHits   = countMatches(trial.title,   keywords) * 2;
  const summaryHits = countMatches(trial.summary,  keywords);
  const max = keywords.length * 3;
  return Math.min(1, (titleHits + summaryHits) / max);
};

// ─────────────────────────────────────────────────────────────────────────────
// Recency score for trials (based on start year)
// ─────────────────────────────────────────────────────────────────────────────
const trialRecencyScore = (startDate) => {
  if (!startDate) return 0.5; // unknown — neutral
  const year = parseInt(startDate.slice(0, 4), 10);
  if (isNaN(year)) return 0.5;
  const age = Math.max(0, CURRENT_YEAR - year);
  return Math.exp(-0.2 * age); // faster decay than publications
};

// ─────────────────────────────────────────────────────────────────────────────
// Normaliser — converts raw API object to clean format
// ─────────────────────────────────────────────────────────────────────────────
const normalizeStudy = (study) => {
  const proto    = study?.protocolSection;
  const ident    = proto?.identificationModule;
  const status   = proto?.statusModule;
  const desc     = proto?.descriptionModule;
  const eligib   = proto?.eligibilityModule;
  const contacts = proto?.contactsLocationsModule;
  const design   = proto?.designModule;

  const title           = ident?.briefTitle || ident?.officialTitle || "No title available";
  const overallStatus   = status?.overallStatus || "UNKNOWN";
  const startDate       = status?.startDateStruct?.date || "";
  const completionDate  = status?.completionDateStruct?.date || "";
  const summary         = (desc?.briefSummary || "No description available.").trim();
  const eligibilityCriteria = (eligib?.eligibilityCriteria || "Not specified").trim();
  const minAge          = eligib?.minimumAge || "";
  const maxAge          = eligib?.maximumAge || "";
  const sex             = eligib?.sex || "All";
  const healthy         = eligib?.healthyVolunteers ? "Healthy volunteers accepted" : "";
  const phases          = design?.phases || [];
  const nctId           = ident?.nctId || "";

  const locations = (contacts?.locations || []).slice(0, 5).map((loc) => ({
    facility: loc?.facility || "",
    city:     loc?.city     || "",
    country:  loc?.country  || "",
    status:   loc?.status   || "",
  }));

  const centralContacts = (contacts?.centralContacts || []).slice(0, 2).map((c) => ({
    name:  c?.name  || "",
    role:  c?.role  || "",
    phone: c?.phone || "",
    email: c?.email || "",
  }));

  return {
    nctId,
    title,
    status: overallStatus,
    phases,
    summary,
    eligibility: {
      criteria:          eligibilityCriteria.slice(0, 500) + (eligibilityCriteria.length > 500 ? "..." : ""),
      ageRange:          [minAge, maxAge].filter(Boolean).join(" – "),
      sex,
      healthyVolunteers: healthy,
    },
    dates: { startDate, completionDate },
    locations,
    contact: centralContacts,
    url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : "",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Trial scorer — returns a ranked score for sorting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a relevance score for a trial.
 *
 * Weights:
 *   0.40 × status priority
 *   0.30 × keyword relevance
 *   0.20 × phase quality
 *   0.10 × recency
 */
const scoreTrial = (trial, keywords) => {
  const maxStatus = Math.max(...Object.values(STATUS_SCORES));  // 10
  const maxPhase  = Math.max(...Object.values(PHASE_SCORES));   // 5

  const statusNorm  = (STATUS_SCORES[trial.status.toUpperCase().replace(/ /g, "_")] || 1) / maxStatus;
  const keywordNorm = trialKeywordScore(trial, keywords);
  const phaseNorm   = phaseScore(trial.phases) / maxPhase;
  const recencyNorm = trialRecencyScore(trial.dates?.startDate);

  return (
    0.40 * statusNorm +
    0.30 * keywordNorm +
    0.20 * phaseNorm +
    0.10 * recencyNorm
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch, normalise, score, and return the top clinical trials.
 *
 * @param {string}   disease    - Disease condition name
 * @param {string}   query      - User research query
 * @param {number}   maxFetch   - Max trials to pull from API (default 30)
 * @param {string[]} [keywords] - Pre-extracted keyword tokens (from query expansion)
 * @returns {Promise<Object[]>} - Top 5-6 scored + normalised trials
 */
const fetchClinicalTrials = async (disease, query, maxFetch = 30, keywords = []) => {
  const cacheKey = `trials_v2:${disease}:${query}:${maxFetch}`;
  const cached   = cache.get(cacheKey);
  if (cached) {
    console.log("[ClinicalTrials] Cache hit");
    return cached;
  }

  console.log(`[ClinicalTrials] Searching: disease="${disease}" | query="${query}"`);

  // Build keyword list for scoring (fallback if not provided)
  const scoringKeywords = keywords.length > 0
    ? keywords
    : `${disease} ${query}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);

  let rawTrials = [];

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        "query.cond": disease,
        "query.term": query,
        "pageSize":   Math.min(maxFetch, 100),
        "sort":       "@relevance",
        "format":     "json",
      },
      timeout: 20000,
      headers: { Accept: "application/json" },
    });

    const studies = response.data?.studies || [];
    console.log(`[ClinicalTrials] API returned ${studies.length} studies`);

    for (const study of studies) {
      try {
        rawTrials.push(normalizeStudy(study));
      } catch (e) {
        console.warn("[ClinicalTrials] Normalise failed for a study:", e.message);
      }
    }
  } catch (err) {
    console.error("[ClinicalTrials] API error:", err.message);
    // Non-fatal — return empty so pipeline continues
  }

  // Score each trial
  const scored = rawTrials.map((trial) => ({
    ...trial,
    _score: scoreTrial(trial, scoringKeywords),
  }));

  // Sort by score
  scored.sort((a, b) => b._score - a._score);

  // Return top 6, strip internal score
  const top = scored.slice(0, 6).map(({ _score, ...rest }) => rest);

  // Tag recruiting trials prominently (useful for frontend highlight)
  const result = top.map((t) => ({
    ...t,
    isActivelyRecruiting: ["RECRUITING", "NOT_YET_RECRUITING", "ENROLLING_BY_INVITATION"]
      .includes((t.status || "").toUpperCase()),
  }));

  console.log(
    `[ClinicalTrials] Top ${result.length} trials: ` +
    result.map((t) => `"${t.status}"`).join(", ")
  );

  cache.set(cacheKey, result);
  return result;
};

module.exports = { fetchClinicalTrials };