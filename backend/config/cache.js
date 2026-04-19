// config/cache.js
// Simple in-memory cache using node-cache to avoid hammering external APIs

const NodeCache = require("node-cache");

// TTL from env (default 300 seconds = 5 minutes)
const TTL = parseInt(process.env.CACHE_TTL_SECONDS || "300", 10);

const cache = new NodeCache({ stdTTL: TTL, checkperiod: 60 });

module.exports = cache;
