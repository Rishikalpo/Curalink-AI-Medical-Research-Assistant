// chatModel.js
// models/chatModel.js
// Mongoose schema for storing conversation history per user

const mongoose = require("mongoose");

/**
 * Individual message schema (user or assistant turn)
 */
const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Optional metadata stored alongside each message
    meta: {
      disease: String,
      query: String,
      timestamp: { type: Date, default: Date.now },
    },
  },
  { _id: false }
);

/**
 * Chat session schema — one document per userId
 * Messages are appended on each request, giving the LLM conversation context
 */
const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

module.exports = mongoose.model("Chat", ChatSchema);
