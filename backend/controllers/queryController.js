const { expandQuery } = require("../utils/queryExpansion");
const { fetchPubMedArticles } = require("../services/pubmedService");
const { fetchOpenAlexArticles } = require("../services/openalexService");
const { fetchClinicalTrials } = require("../services/clinicalTrialsService");
const { rankResults } = require("../services/rankingService");
const { generateInsights } = require("../services/llmService");
const Chat = require("../models/chatModel");

// ─────────────────────────────────────────
// Helper: infer disease from history
// ─────────────────────────────────────────
const inferDiseaseFromHistory = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.meta?.disease) {
      return messages[i].meta.disease;
    }
  }
  return null;
};

// ─────────────────────────────────────────
// MAIN QUERY HANDLER (FINAL)
// ─────────────────────────────────────────
const handleQuery = async (req, res) => {
  const startTime = Date.now();

  const { userId, query, limit = 8 } = req.body;
  let disease = (req.body.disease || "").trim();

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId required" });
  }

  if (!query) {
    return res.status(400).json({ success: false, error: "query required" });
  }

  try {
    // ── Load or create chat
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
      await chat.save();
    }

    const history = chat.messages;

    // 🔥 Detect follow-up
    const isFollowUp = !disease;

    // ── Infer disease from history
    if (!disease) {
      disease = inferDiseaseFromHistory(history) || "general medicine";
    }

    // ── Query expansion
    const { expandedQuery, pubmedQuery, keywords } =
      expandQuery({ disease, query });

    // ── Parallel data fetch (optimized)
    const [pubmedRes, openalexRes, trialsRes] =
      await Promise.allSettled([
        fetchPubMedArticles(pubmedQuery, 60),
        fetchOpenAlexArticles(expandedQuery, 60),
        fetchClinicalTrials(disease, query, 15, keywords),
      ]);

    const pubmed = pubmedRes.status === "fulfilled" ? pubmedRes.value : [];
    const openalex = openalexRes.status === "fulfilled" ? openalexRes.value : [];
    const trials = trialsRes.status === "fulfilled" ? trialsRes.value : [];

    const dataSourcesStatus = {
      pubmed: pubmedRes.status,
      openalex: openalexRes.status,
      trials: trialsRes.status,
    };

    // ── Ranking
    let topPublications = [];
    try {
      topPublications = await rankResults(
        pubmed,
        openalex,
        disease,
        query,
        Math.min(limit, 8),
        keywords
      );
    } catch (err) {
      console.error("[Ranking error]", err.message);
      topPublications = [...pubmed, ...openalex].slice(0, 8);
    }

    // 🔥 Reduce LLM load (fast + relevant)
    const llmPubs = topPublications.slice(0, 3);
    const topTrials = trials.slice(0, 2);

    let insights;
    try {
      insights = await generateInsights(
        disease,
        query,
        llmPubs,
        topTrials,
        history.slice(-4) // ✅ CONTEXT PASSED
      );
    } catch (err) {
      console.warn("[LLM fallback]", err.message);
      insights = {
        overview: "LLM unavailable.",
        research_insights: [],
        clinical_trials: [],
        sources: [],
      };
    }

    // ── Save chat history
    chat.messages.push(
      {
        role: "user",
        content: query,
        meta: {
          disease,
          query,
          timestamp: new Date(),
        },
      },
      {
        role: "assistant",
        content: insights.overview || "Response generated",
        meta: {
          disease,
          query,
          timestamp: new Date(),
        },
      }
    );

    // Keep last 60 messages
    if (chat.messages.length > 60) {
      chat.messages = chat.messages.slice(-60);
    }

    await chat.save();

    const elapsed = Date.now() - startTime;

    // ── Final response
    return res.json({
      success: true,
      meta: {
        disease,
        query,
        diseaseInferredFromHistory: isFollowUp, // 🔥 UI + context flag
        totalPublicationsFetched: pubmed.length + openalex.length,
        totalTrialsFetched: trials.length,
        processingTimeMs: elapsed,
        data_sources_status: dataSourcesStatus,
      },
      topPublications,
      clinicalTrials: topTrials,
      insights,
      conversationLength: chat.messages.length,
    });

  } catch (err) {
    console.error("[Controller Fatal]", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────
// GET CHAT HISTORY
// ─────────────────────────────────────────
const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.params.userId });
    res.json({ success: true, history: chat?.messages || [] });
  } catch (err) {
    console.error("[History error]", err);
    res.status(500).json({ success: false });
  }
};

// ─────────────────────────────────────────
// CLEAR CHAT HISTORY
// ─────────────────────────────────────────
const clearChatHistory = async (req, res) => {
  try {
    await Chat.deleteOne({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    console.error("[Clear history error]", err);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  handleQuery,
  getChatHistory,
  clearChatHistory,
};