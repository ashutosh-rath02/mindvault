import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twitter API client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const bearerClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export class TwitterService {
  constructor() {
    this.botUsername = process.env.BOT_USERNAME || "mindvault";
  }

  // Parse mentions and extract save commands
  parseMention(tweetText) {
    const mentionPattern = new RegExp(
      `@${this.botUsername}\\s+save\\s+(.+)`,
      "i"
    );
    const match = tweetText.match(mentionPattern);

    if (!match) return null;

    return {
      command: "save",
      description: match[1].trim(),
    };
  }

  // Extract tweet data from mention
  async extractTweetData(tweetId) {
    try {
      const tweet = await bearerClient.v2.singleTweet(tweetId, {
        expansions: ["author_id", "referenced_tweets"],
        "user.fields": ["username", "name"],
        "tweet.fields": ["created_at", "text", "public_metrics"],
      });

      if (!tweet.data) {
        throw new Error("Tweet not found");
      }

      const author = tweet.includes?.users?.find(
        (user) => user.id === tweet.data.author_id
      );

      return {
        id: tweet.data.id,
        text: tweet.data.text,
        author_id: tweet.data.author_id,
        author_username: author?.username || "unknown",
        author_name: author?.name || "Unknown User",
        created_at: tweet.data.created_at,
        url: `https://twitter.com/${author?.username || "unknown"}/status/${
          tweet.data.id
        }`,
        metrics: tweet.data.public_metrics,
      };
    } catch (error) {
      console.error("Error extracting tweet data:", error);
      throw error;
    }
  }

  // Get the original tweet that was replied to
  async getOriginalTweet(tweetId) {
    try {
      const tweet = await bearerClient.v2.singleTweet(tweetId, {
        expansions: ["referenced_tweets"],
        "tweet.fields": ["created_at", "text", "author_id"],
        "user.fields": ["username", "name"],
      });

      if (!tweet.data?.referenced_tweets?.length) {
        return null;
      }

      const referencedTweet = tweet.data.referenced_tweets[0];
      if (referencedTweet.type !== "replied_to") {
        return null;
      }

      return await this.extractTweetData(referencedTweet.id);
    } catch (error) {
      console.error("Error getting original tweet:", error);
      return null;
    }
  }

  // Reply to user with confirmation
  async replyToUser(tweetId, message) {
    try {
      const reply = await client.v2.reply(message, tweetId);
      console.log("Replied to tweet:", reply);
      return reply;
    } catch (error) {
      console.error("Error replying to tweet:", error);
      throw error;
    }
  }

  // Get recent mentions
  async getRecentMentions() {
    try {
      const mentions = await client.v2.mentionTimeline({
        "tweet.fields": ["created_at", "text", "author_id"],
        "user.fields": ["username", "name"],
        expansions: ["author_id"],
      });

      return mentions.data || [];
    } catch (error) {
      console.error("Error getting mentions:", error);
      return [];
    }
  }

  // Check if tweet is a valid save command
  isValidSaveCommand(tweetText) {
    const savePattern = new RegExp(`@${this.botUsername}\\s+save`, "i");
    return savePattern.test(tweetText);
  }

  // Extract description from save command
  extractDescription(tweetText) {
    const descriptionPattern = new RegExp(
      `@${this.botUsername}\\s+save\\s+(.+)`,
      "i"
    );
    const match = tweetText.match(descriptionPattern);
    return match ? match[1].trim() : "";
  }
}
