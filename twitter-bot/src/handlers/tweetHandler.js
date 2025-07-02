import { TwitterService } from "../services/twitterService.js";
import { db } from "../config/database.js";

export class TweetHandler {
  constructor() {
    this.twitterService = new TwitterService();
  }

  // Main handler for processing mentions
  async handleMention(tweetId, tweetText, authorUsername) {
    try {
      console.log(`Processing mention from @${authorUsername}: ${tweetText}`);

      // Check if it's a valid save command
      if (!this.twitterService.isValidSaveCommand(tweetText)) {
        console.log("Not a valid save command, ignoring");
        return;
      }

      // Extract description from the command
      const description = this.twitterService.extractDescription(tweetText);

      // Get the original tweet that was replied to
      const originalTweet = await this.twitterService.getOriginalTweet(tweetId);

      if (!originalTweet) {
        await this.twitterService.replyToUser(
          tweetId,
          `@${authorUsername} I couldn't find the tweet you want to save. Please make sure you're replying to the tweet you want to save.`
        );
        return;
      }

      // Find user in database
      const user = await db.findUserByTwitterUsername(authorUsername);

      if (!user) {
        await this.twitterService.replyToUser(
          tweetId,
          `@${authorUsername} I don't recognize your Twitter username. Please link your Twitter account in your MindVault settings first.`
        );
        return;
      }

      // Generate simple note content
      const noteContent = this.contentService.generateNoteContent(
        originalTweet.text,
        originalTweet.author_username,
        description
      );

      // Create note in database
      const noteData = {
        user_id: user.id,
        title: `Tweet: ${originalTweet.author_username}`,
        content: noteContent.content.replace("[TWEET_ID]", originalTweet.id),
        content_type: "markdown",
        category: "twitter",
        tags: noteContent.tags,
        importance: 3,
        word_count: originalTweet.text.split(" ").length,
        is_favorite: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const savedNote = await db.createNoteFromTweet(
        user.id,
        originalTweet,
        description
      );

      // Reply with confirmation
      const replyMessage = `@${authorUsername} ✅ Tweet saved to MindVault! 

📝 **${originalTweet.author_username}**: "${originalTweet.text.substring(
        0,
        100
      )}${originalTweet.text.length > 100 ? "..." : ""}"

🏷️ Category: twitter
${description ? `📋 Your note: "${description}"` : ""}

View it at: https://mindvault.app/notes/${savedNote.id}`;

      await this.twitterService.replyToUser(tweetId, replyMessage);

      console.log(
        `Successfully saved tweet ${originalTweet.id} for user ${user.id}`
      );
    } catch (error) {
      console.error("Error handling mention:", error);

      // Try to reply with error message
      try {
        await this.twitterService.replyToUser(
          tweetId,
          `@${authorUsername} Sorry, I encountered an error while saving your tweet. Please try again later.`
        );
      } catch (replyError) {
        console.error("Error sending error reply:", replyError);
      }
    }
  }

  // Process multiple mentions
  async processMentions(mentions) {
    const promises = mentions.map((mention) =>
      this.handleMention(mention.id, mention.text, mention.author_id)
    );

    await Promise.allSettled(promises);
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    try {
      if (event.tweet_create_events) {
        for (const tweetEvent of event.tweet_create_events) {
          // Check if this is a mention of our bot
          if (tweetEvent.text.includes(`@${this.twitterService.botUsername}`)) {
            await this.handleMention(
              tweetEvent.id_str,
              tweetEvent.text,
              tweetEvent.user.screen_name
            );
          }
        }
      }
    } catch (error) {
      console.error("Error handling webhook event:", error);
    }
  }
}
