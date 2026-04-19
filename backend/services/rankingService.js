// services/rankingService.js — FINAL OPTIMIZED VERSION

const CURRENT_YEAR = new Date().getFullYear();
const crypto = require("crypto");

// ─────────────────────────────────────────────────────────────────────────────
// Embedding cache (LRU-style)
// ─────────────────────────────────────────────────────────────────────────────
const embeddingCache = new Map();
const CACHE_MAX_SIZE = 500;

const cacheSet = (key, value) => {
  if (embeddingCache.size >= CACHE_MAX_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }
  embeddingCache.set(key, value);
};

// ─────────────────────────────────────────────────────────────────────────────
// Lazy embedder (with fallback)
// ─────────────────────────────────────────────────────────────────────────────
let _pipelinePromise = null;
let _pipelineReady = false;

const getEmbedder = async () => {
  if (_pipelineReady) return _pipelinePromise;
  if (_pipelinePromise) return _pipelinePromise;

  _pipelinePromise = (async () => {
    try {
      const { pipeline, env } = await import("@xenova/transformers");
      env.cacheDir = "./.model_cache";
      const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      _pipelineReady = true;
      console.log("[Ranking] Semantic model ready ✓");
      return embedder;
    } catch {
      console.warn("[Ranking] Using TF-IDF fallback");
      return null;
    }
  })();

  return _pipelinePromise;
};

// ─────────────────────────────────────────────────────────────────────────────
// Math utils
// ─────────────────────────────────────────────────────────────────────────────
const cosineSimilarity = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

// ─────────────────────────────────────────────────────────────────────────────
// TF-IDF fallback
// ─────────────────────────────────────────────────────────────────────────────
const tokenise = (t) =>
  (t || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1);

const tfVector = (tokens) => {
  const f = {};
  tokens.forEach(t => f[t] = (f[t] || 0) + 1);
  const total = tokens.length || 1;
  Object.keys(f).forEach(k => f[k] /= total);
  return f;
};

const sparseCosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (const k in a) {
    if (b[k]) dot += a[k] * b[k];
    na += a[k] * a[k];
  }
  for (const k in b) nb += b[k] * b[k];
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

const tfidfSimilarity = (q, a) =>
  sparseCosine(tfVector(tokenise(q)), tfVector(tokenise(a)));

// ─────────────────────────────────────────────────────────────────────────────
// Embedding helper (FIXED cache key)
// ─────────────────────────────────────────────────────────────────────────────
const getEmbedding = async (embedder, text) => {
  const key = crypto.createHash("md5").update(text).digest("hex");
  if (embeddingCache.has(key)) return embeddingCache.get(key);

  const out = await embedder(text, { pooling: "mean", normalize: true });
  const vec = Array.from(out.data);
  cacheSet(key, vec);
  return vec;
};

// ─────────────────────────────────────────────────────────────────────────────
// Scoring helpers
// ─────────────────────────────────────────────────────────────────────────────
const keywordScore = (a, keywords) => {
  const t = (a.title || "").toLowerCase();
  const ab = (a.abstract || "").toLowerCase();

  let score = 0;
  keywords.forEach(k => {
    if (t.includes(k)) score += 3;
    else if (ab.includes(k)) score += 1;
  });

  return Math.min(1, score / (keywords.length * 3));
};

const recencyScore = (year) => {
  if (!year) return 0;
  const age = CURRENT_YEAR - year;
  return Math.exp(-0.15 * age);
};

const deduplicateByTitle = (arr) => {
  const map = new Map();
  for (const a of arr) {
    const key = (a.title || "").toLowerCase().slice(0, 120);
    if (!map.has(key) || (a.abstract || "").length > (map.get(key).abstract || "").length) {
      map.set(key, a);
    }
  }
  return Array.from(map.values());
};

const buildExplanation = (s) => {
  const t = [];
  if (s.semantic > 0.7) t.push("High semantic relevance");
  if (s.keyword > 0.5) t.push("Strong keyword match");
  if (s.recency > 0.7) t.push("Recent publication");
  return t.length ? t : ["Relevant match"];
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
const rankResults = async (
  pubmed,
  openalex,
  disease,
  query,
  topN = 8,
  keywords = []
) => {
  const all = deduplicateByTitle([...pubmed, ...openalex]);

  // 🔥 FIX 1: limit candidates
  const candidates = all.slice(0, 40);

  console.log(`[Ranking] Candidates: ${candidates.length}`);

  // 🔥 FIX 2: timeout embedder
  const embedder = await Promise.race([
    getEmbedder(),
    new Promise(res => setTimeout(() => res(null), 3000))
  ]);

  const queryText = `${query} ${disease}`;
  let queryEmb = null;

  if (embedder) {
    try {
      queryEmb = await getEmbedding(embedder, queryText);
    } catch {}
  }

  const SEMANTIC_LIMIT = 20;

  const scored = await Promise.all(
    candidates.map(async (a, idx) => {
      const text = `${a.title} ${a.abstract}`.slice(0, 500);

      let sem = 0;

      // 🔥 FIX 3: limit embeddings
      if (embedder && queryEmb && idx < SEMANTIC_LIMIT) {
        try {
          const emb = await getEmbedding(embedder, text);
          sem = cosineSimilarity(queryEmb, emb);
        } catch {
          sem = tfidfSimilarity(queryText, text);
        }
      } else {
        sem = tfidfSimilarity(queryText, text);
      }

      const kw = keywordScore(a, keywords);
      const rec = recencyScore(a.year);
      const cit = (a.citedByCount || 0) / 100;

      // 🔥 FIX 4: correct weights
      const final =
        (0.48 * sem) +
        (0.27 * kw) +
        (0.20 * rec) +
        (0.05 * cit);

      return {
        ...a,
        _scores: { semantic: sem, keyword: kw, recency: rec, final }
      };
    })
  );

  scored.sort((a, b) => b._scores.final - a._scores.final);

  return scored.slice(0, topN).map(a => ({
    ...a,
    ranking_explanation: buildExplanation(a._scores),
    _debugScores: {
      semantic: +a._scores.semantic.toFixed(3),
      keyword: +a._scores.keyword.toFixed(3),
      recency: +a._scores.recency.toFixed(3),
      final: +a._scores.final.toFixed(3)
    }
  }));
};

module.exports = { rankResults };