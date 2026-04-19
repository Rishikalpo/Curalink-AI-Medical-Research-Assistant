// pubmedService.js
// services/pubmedService.js
// Fetches research publications from NCBI PubMed using the E-utilities API
// Step 1: esearch → get IDs  |  Step 2: efetch → get full records

const axios = require("axios");
const xml2js = require("xml2js");
const cache = require("../config/cache");

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH_URL  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
const BATCH_SIZE  = 50; // fetch details in batches to avoid huge XML responses

/**
 * Parse raw XML string into a JS object using xml2js
 */
const parseXML = (xml) =>
  new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false, trim: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

/**
 * Extract a clean string value from xml2js output (handles string or object forms)
 */
const safeStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (val._) return val._; // text content with attributes
    if (Array.isArray(val)) return val.map(safeStr).join("; ");
  }
  return String(val);
};

/**
 * Step 1: Run esearch to get a list of PubMed IDs for a query
 * @param {string} query   - Expanded search query
 * @param {number} maxIds  - Max IDs to retrieve (default 100)
 * @returns {string[]}     - Array of PubMed IDs
 */
const fetchPubMedIds = async (query, maxIds = 100) => {
  console.log(`[PubMed] esearch: "${query}" (max ${maxIds})`);

  const params = {
    db: "pubmed",
    term: query,
    retmax: maxIds,
    retmode: "json",
    sort: "relevance",
    usehistory: "y",
  };

  // Include API key if provided (increases rate limits)
  if (process.env.NCBI_API_KEY) params.api_key = process.env.NCBI_API_KEY;

  const response = await axios.get(ESEARCH_URL, { params, timeout: 15000 });
  const ids = response.data?.esearchresult?.idlist || [];

  console.log(`[PubMed] esearch returned ${ids.length} IDs`);
  return ids;
};

/**
 * Step 2: Batch-fetch full article details via efetch (XML format)
 * @param {string[]} ids  - PubMed IDs
 * @returns {Object[]}    - Parsed article array
 */
const fetchArticleDetails = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const articles = [];

  // Process in batches to avoid oversized requests
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    console.log(`[PubMed] efetch batch ${Math.floor(i / BATCH_SIZE) + 1}: IDs ${i + 1}–${i + batchIds.length}`);

    try {
      const params = {
        db: "pubmed",
        id: batchIds.join(","),
        retmode: "xml",
        rettype: "abstract",
      };
      if (process.env.NCBI_API_KEY) params.api_key = process.env.NCBI_API_KEY;

      const response = await axios.get(EFETCH_URL, { params, timeout: 30000 });
      const parsed = await parseXML(response.data);

      const articleSet = parsed?.PubmedArticleSet?.PubmedArticle;
      if (!articleSet) continue;

      const articleArray = Array.isArray(articleSet) ? articleSet : [articleSet];

      for (const item of articleArray) {
        try {
          const citation = item?.MedlineCitation;
          const article  = citation?.Article;

          if (!article) continue;

          // --- Title ---
          const title = safeStr(article?.ArticleTitle) || "Untitled";

          // --- Abstract ---
          const abstractNode = article?.Abstract?.AbstractText;
          let abstract = "";
          if (Array.isArray(abstractNode)) {
            abstract = abstractNode.map(safeStr).join(" ");
          } else {
            abstract = safeStr(abstractNode);
          }

          // --- Authors ---
          const authorList = article?.AuthorList?.Author;
          let authors = [];
          if (authorList) {
            const authorArr = Array.isArray(authorList) ? authorList : [authorList];
            authors = authorArr.map((a) => {
              const last  = safeStr(a?.LastName);
              const first = safeStr(a?.ForeName || a?.Initials);
              return [last, first].filter(Boolean).join(", ");
            });
          }

          // --- Year ---
          const pubDate = article?.Journal?.JournalIssue?.PubDate;
          const year    = safeStr(pubDate?.Year || pubDate?.MedlineDate || "").slice(0, 4);

          // --- PMID ---
          const pmid = safeStr(citation?.PMID);

          articles.push({
            title,
            abstract: abstract || "Abstract not available.",
            authors,
            year: parseInt(year, 10) || 0,
            source: "PubMed",
            url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "",
            pmid,
          });
        } catch (parseErr) {
          console.warn("[PubMed] Skipped one article due to parse error:", parseErr.message);
        }
      }
    } catch (batchErr) {
      console.error(`[PubMed] Batch fetch error:`, batchErr.message);
    }

    // Respect NCBI rate limit: 3 req/sec without key, 10/sec with key
    await new Promise((r) => setTimeout(r, process.env.NCBI_API_KEY ? 120 : 350));
  }

  console.log(`[PubMed] Parsed ${articles.length} articles total`);
  return articles;
};

/**
 * Main entry point: fetch PubMed articles for an expanded query
 * Results are cached to avoid redundant API calls
 *
 * @param {string} expandedQuery  - The expanded search string
 * @param {number} maxResults     - How many results to aim for (default 100)
 * @returns {Object[]}            - Normalized article objects
 */
const fetchPubMedArticles = async (expandedQuery, maxResults = 100) => {
  const cacheKey = `pubmed:${expandedQuery}:${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log("[PubMed] Cache hit");
    return cached;
  }

  const ids      = await fetchPubMedIds(expandedQuery, maxResults);
  const articles = await fetchArticleDetails(ids);

  cache.set(cacheKey, articles);
  return articles;
};

module.exports = { fetchPubMedArticles };
