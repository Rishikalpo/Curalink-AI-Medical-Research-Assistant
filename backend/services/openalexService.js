// openalexService.js
// services/openalexService.js
// Fetches open-access research papers from OpenAlex (https://openalex.org)
// Free, no API key required — huge corpus of academic literature

const axios  = require("axios");
const cache  = require("../config/cache");

const BASE_URL    = "https://api.openalex.org/works";
const PAGE_SIZE   = 50; // max per page allowed by OpenAlex
const USER_AGENT  = "MedResearchAssistant/1.0 (mailto:dev@example.com)"; // polite pool

/**
 * Fetch a single page of results from OpenAlex
 * @param {string} query  - Search query string
 * @param {number} page   - Page number (1-indexed)
 * @param {number} perPage
 */
const fetchPage = async (query, page, perPage = PAGE_SIZE) => {
  const params = {
    search: query,
    page,
    "per-page": perPage,
    sort: "relevance_score:desc",
    filter: "type:article",         // articles only, not book chapters etc.
    select: [
      "id",
      "title",
      "abstract_inverted_index",
      "authorships",
      "publication_year",
      "doi",
      "primary_location",
      "cited_by_count",
    ].join(","),
  };

  const response = await axios.get(BASE_URL, {
    params,
    headers: { "User-Agent": USER_AGENT },
    timeout: 20000,
  });

  return response.data;
};

/**
 * Reconstruct plain-text abstract from OpenAlex's inverted index format.
 * The inverted index is: { "word": [position1, position2], ... }
 */
const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";

  const words = {};
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words[pos] = word;
    }
  }

  // Sort by position and join
  return Object.keys(words)
    .sort((a, b) => Number(a) - Number(b))
    .map((pos) => words[pos])
    .join(" ");
};

/**
 * Normalize a raw OpenAlex work object into our standard format
 */
const normalizeWork = (work) => {
  const title    = work.title || "Untitled";
  const abstract = reconstructAbstract(work.abstract_inverted_index);

  const authors = (work.authorships || []).map((a) => {
    return a?.author?.display_name || "Unknown Author";
  });

  const year = work.publication_year || 0;

  // Build URL from DOI or OpenAlex ID
  const doi = work.doi ? work.doi.replace("https://doi.org/", "") : null;
  const url = doi
    ? `https://doi.org/${doi}`
    : work.id
    ? `https://openalex.org/${work.id}`
    : "";

  return {
    title,
    abstract: abstract || "Abstract not available.",
    authors,
    year,
    source: "OpenAlex",
    url,
    doi,
    citedByCount: work.cited_by_count || 0,
  };
};

/**
 * Main entry: fetch OpenAlex articles, paginating to reach maxResults
 *
 * @param {string} expandedQuery - The expanded search string
 * @param {number} maxResults    - Target number of results (default 100)
 * @returns {Object[]}           - Normalized articles
 */
const fetchOpenAlexArticles = async (expandedQuery, maxResults = 100) => {
  const cacheKey = `openalex:${expandedQuery}:${maxResults}`;
  const cached   = cache.get(cacheKey);
  if (cached) {
    console.log("[OpenAlex] Cache hit");
    return cached;
  }

  console.log(`[OpenAlex] Fetching up to ${maxResults} results for: "${expandedQuery}"`);

  const articles    = [];
  const totalPages  = Math.ceil(maxResults / PAGE_SIZE);

  for (let page = 1; page <= totalPages; page++) {
    try {
      console.log(`[OpenAlex] Page ${page}/${totalPages}`);
      const data = await fetchPage(expandedQuery, page);
      const works = data?.results || [];

      if (works.length === 0) {
        console.log("[OpenAlex] No more results.");
        break;
      }

      const normalized = works.map(normalizeWork);
      articles.push(...normalized);

      // If we've hit the total count reported by OpenAlex, stop early
      if (data?.meta?.count && articles.length >= data.meta.count) break;

      // Polite delay between pages
      if (page < totalPages) await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`[OpenAlex] Error on page ${page}:`, err.message);
      break; // don't retry, just return what we have
    }
  }

  console.log(`[OpenAlex] Retrieved ${articles.length} articles`);

  cache.set(cacheKey, articles);
  return articles;
};

module.exports = { fetchOpenAlexArticles };
