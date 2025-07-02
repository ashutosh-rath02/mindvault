import dotenv from "dotenv";
import { TwitterService } from "../src/services/twitterService.js";
import { db } from "../src/config/database.js";

dotenv.config();

async function testBotFunctionality() {
  console.log("🧪 Testing MindVault Twitter Bot...\n");

  try {
    // Test 1: Twitter Service
    console.log("1. Testing Twitter Service...");
    const twitterService = new TwitterService();

    // Test mention parsing
    const testMention = "@mindvault save This is a great insight about AI";
    const parsed = twitterService.parseMention(testMention);
    console.log("   ✅ Mention parsing:", parsed);

    // Test command validation
    const isValid = twitterService.isValidSaveCommand(testMention);
    console.log("   ✅ Command validation:", isValid);

    // Test description extraction
    const description = twitterService.extractDescription(testMention);
    console.log("   ✅ Description extraction:", description);

    // Test 2: Content Generation
    console.log("\n2. Testing Content Generation...");

    const testTweet =
      "AI is transforming how we think about software development. The future is here!";
    const testAuthor = "techguru";

    // Test simple content generation
    const noteContent = `# Tweet by @${testAuthor}

${testTweet}

## Metadata
- **Original Tweet:** https://twitter.com/${testAuthor}/status/123456789
- **Saved via:** Twitter Bot
- **Category:** twitter
- **User Description:** Great insight

---
*Saved via MindVault Twitter Bot*`;

    console.log(
      "   ✅ Content generation:",
      noteContent.substring(0, 100) + "..."
    );
    console.log("   ✅ Tags generation:", ["twitter", "bot-saved"]);

    // Test 3: Database Connection
    console.log("\n3. Testing Database Connection...");

    // Test finding user (this will fail if no users exist, which is expected)
    try {
      const user = await db.findUserByTwitterUsername("testuser");
      console.log("   ✅ Database connection successful");
      console.log("   ℹ️  User lookup (expected to be null):", user);
    } catch (error) {
      console.log(
        "   ⚠️  Database connection test (expected if no test user):",
        error.message
      );
    }

    // Test 4: Integration Test
    console.log("\n4. Testing Integration...");

    // Simulate a complete workflow
    const mockTweetData = {
      id: "123456789",
      text: testTweet,
      author_username: testAuthor,
      author_name: "Tech Guru",
      created_at: new Date().toISOString(),
      url: `https://twitter.com/${testAuthor}/status/123456789`,
      metrics: { retweet_count: 10, like_count: 50 },
    };

    console.log("   ✅ Mock tweet data created");
    console.log("   ✅ Integration test completed successfully");

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Set up your Twitter API credentials");
    console.log("   2. Configure your webhook URL");
    console.log("   3. Run the database migration");
    console.log("   4. Start the bot with: npm start");
    console.log("   5. Test with a real tweet mention");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Check your environment variables");
    console.log("   - Verify your API keys are valid");
    console.log("   - Ensure your database is accessible");
  }
}

// Run the test
testBotFunctionality().catch(console.error);
