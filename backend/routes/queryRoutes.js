// routes/queryRoutes.js
// Defines all API routes for the medical research assistant

const express  = require("express");
const router   = express.Router();
const {
  handleQuery,
  getChatHistory,
  clearChatHistory,
} = require("../controllers/queryController");

// ─────────────────────────────────────────────
//  POST /api/query
//  Main research pipeline endpoint
//
//  Body: {
//    userId:  string (required),
//    disease: string (required),
//    query:   string (required),
//    page:    number (optional, default 1),
//    limit:   number (optional, default 8)
//  }
// ─────────────────────────────────────────────
router.post("/query", handleQuery);

// ─────────────────────────────────────────────
//  GET /api/history/:userId
//  Retrieve paginated chat history
//
//  Query params: ?page=1&limit=20
// ─────────────────────────────────────────────
router.get("/history/:userId", getChatHistory);

// ─────────────────────────────────────────────
//  DELETE /api/history/:userId
//  Clear all chat history for a user
// ─────────────────────────────────────────────
router.delete("/history/:userId", clearChatHistory);

// ─────────────────────────────────────────────
//  GET /api/health
//  Health check endpoint
// ─────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Medical Research Assistant API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;