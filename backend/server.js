// Entry point for backend
// server.js
// Express server entry point for the Medical Research Assistant Backend
// MERN-compatible: MongoDB + Express + Node.js

require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const connectDB   = require("./config/db");
const queryRoutes = require("./routes/queryRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
//  Middleware
// ─────────────────────────────────────────────

// CORS — allow requests from any origin in dev, configure for prod
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────
app.use("/api", queryRoutes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "Curalink API",
    version: "1.0.0",
    docs: "POST /api/query  |  GET /api/history/:userId  |  GET /api/health",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("[GlobalError]", err.stack);
  res.status(500).json({ success: false, error: err.message });
});

// ─────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log("\n==========================================");
    console.log(`  Curalink API`);
    console.log(`  Server running on http://localhost:${PORT}`);
    console.log(`  LLM: ${process.env.LLM_PROVIDER} (${process.env.LLM_MODEL})`);
    console.log(`  MongoDB: ${process.env.MONGO_URI}`);
    console.log("==========================================\n");
  });
};

startServer();
