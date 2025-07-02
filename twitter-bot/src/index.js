import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";
import dotenv from "dotenv";
import { TweetHandler } from "./handlers/tweetHandler.js";
import { TwitterService } from "./services/twitterService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const tweetHandler = new TweetHandler();
const twitterService = new TwitterService();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "mindvault-twitter-bot",
  });
});

// Webhook endpoint for Twitter
app.post("/webhook", (req, res) => {
  try {
    const event = req.body;
    console.log("Received webhook event:", JSON.stringify(event, null, 2));

    // Handle the webhook event asynchronously
    tweetHandler.handleWebhookEvent(event).catch((error) => {
      console.error("Error processing webhook:", error);
    });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Error in webhook endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Manual trigger endpoint for testing
app.post("/trigger-mention-check", async (req, res) => {
  try {
    console.log("Manually triggering mention check...");
    await checkForNewMentions();
    res.json({ status: "success", message: "Mention check completed" });
  } catch (error) {
    console.error("Error in manual trigger:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to check for new mentions
async function checkForNewMentions() {
  try {
    console.log("Checking for new mentions...");

    const mentions = await twitterService.getRecentMentions();
    console.log(`Found ${mentions.length} mentions`);

    if (mentions.length > 0) {
      await tweetHandler.processMentions(mentions);
    }
  } catch (error) {
    console.error("Error checking mentions:", error);
  }
}

// Schedule mention checking every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running scheduled mention check...");
  await checkForNewMentions();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MindVault Twitter Bot running on port ${PORT}`);
  console.log(
    `📡 Webhook URL: ${process.env.BOT_WEBHOOK_URL || "Not configured"}`
  );
  console.log(`🤖 Bot username: @${process.env.BOT_USERNAME || "mindvault"}`);
  console.log(`⏰ Mention checking scheduled every 5 minutes`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
