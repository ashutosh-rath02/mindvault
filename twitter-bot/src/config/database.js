import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase configuration. Please check your environment variables."
  );
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database operations for the Twitter bot
export const db = {
  // Find user by Twitter username
  async findUserByTwitterUsername(twitterUsername) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("twitter_username", twitterUsername)
      .single();

    if (error) {
      console.error("Error finding user by Twitter username:", error);
      return null;
    }

    return data;
  },

  // Create a new note from tweet
  async createNoteFromTweet(userId, tweetData, description = "") {
    const noteData = {
      user_id: userId,
      title: `Tweet: ${tweetData.author_username}`,
      content: `# Tweet by @${tweetData.author_username}\n\n${
        tweetData.text
      }\n\n## Metadata\n- **Original Tweet:** ${
        tweetData.url
      }\n- **Saved via:** Twitter Bot\n- **Category:** twitter\n${
        description ? `- **User Description:** ${description}` : ""
      }\n\n---\n*Saved via MindVault Twitter Bot*`,
      content_type: "markdown",
      category: "twitter",
      tags: ["twitter", "bot-saved"],
      importance: 3,
      word_count: tweetData.text.split(" ").length,
      is_favorite: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("notes")
      .insert(noteData)
      .select()
      .single();

    if (error) {
      console.error("Error creating note from tweet:", error);
      throw error;
    }

    return data;
  },

  // Get user's Twitter username mapping
  async getUserTwitterMapping(twitterUsername) {
    const { data, error } = await supabase
      .from("user_twitter_mappings")
      .select("*")
      .eq("twitter_username", twitterUsername)
      .single();

    if (error) {
      console.error("Error getting Twitter mapping:", error);
      return null;
    }

    return data;
  },

  // Create Twitter mapping for user
  async createTwitterMapping(userId, twitterUsername) {
    const { data, error } = await supabase
      .from("user_twitter_mappings")
      .insert({
        user_id: userId,
        twitter_username: twitterUsername,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating Twitter mapping:", error);
      throw error;
    }

    return data;
  },
};
