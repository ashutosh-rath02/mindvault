# MindVault Twitter Bot

A Twitter bot that allows users to save tweets to their MindVault notes by mentioning `@mindvault save <description>`.

## 🚀 Features

- **Tweet Saving**: Reply to any tweet with `@mindvault save <description>` to save it
- **Simple Content**: Direct tweet saving without AI analysis
- **Clean Formatting**: Creates well-formatted markdown notes
- **Basic Categorization**: Standard twitter category and tags
- **Real-time Processing**: Webhook-based real-time tweet processing
- **User Authentication**: Links Twitter usernames to MindVault accounts

## 🛠️ Setup

### Prerequisites

1. **Twitter Developer Account**

   - Apply for Twitter API access at [developer.twitter.com](https://developer.twitter.com)
   - Create a new app and get API credentials
   - Enable OAuth 1.0a and OAuth 2.0

2. **MindVault Database**

   - Ensure your Supabase database is set up with the required tables
   - You'll need the service role key for admin operations

3. **Optional Services**
   - No additional API keys required

### Installation

1. **Clone and Install Dependencies**

   ```bash
   cd twitter-bot
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Fill in your environment variables:

   ```env
   # Twitter API Configuration
   TWITTER_API_KEY=your_twitter_api_key_here
   TWITTER_API_SECRET=your_twitter_api_secret_here
   TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
   TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # Bot Configuration
   BOT_USERNAME=mindvault
   BOT_WEBHOOK_URL=https://your-domain.com/webhook
   PORT=3001


   ```

3. **Database Setup**

   You'll need to add a new table to your Supabase database for Twitter username mappings:

   ```sql
   -- Create table for Twitter username mappings
   CREATE TABLE user_twitter_mappings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     twitter_username TEXT NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Add RLS policies
   ALTER TABLE user_twitter_mappings ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view their own Twitter mappings" ON user_twitter_mappings
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own Twitter mappings" ON user_twitter_mappings
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own Twitter mappings" ON user_twitter_mappings
     FOR UPDATE USING (auth.uid() = user_id);

   -- Add twitter_username column to profiles table if not exists
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_username TEXT;
   ```

4. **Twitter Webhook Setup**

   Configure your Twitter app webhook:

   - Go to your Twitter Developer Portal
   - Navigate to your app settings
   - Set the webhook URL to: `https://your-domain.com/webhook`
   - Subscribe to tweet events

### Running the Bot

1. **Development Mode**

   ```bash
   npm run dev
   ```

2. **Production Mode**

   ```bash
   npm start
   ```

3. **Manual Testing**
   ```bash
   # Trigger a mention check manually
   curl -X POST http://localhost:3001/trigger-mention-check
   ```

## 📱 Usage

### How It Works

1. **User Setup**: Users link their Twitter username in MindVault settings
2. **Tweet Saving**: Reply to any tweet with `@mindvault save <description>`
3. **AI Processing**: Bot analyzes the tweet content and creates enhanced notes
4. **Confirmation**: Bot replies with confirmation and note details

### Example Usage

```
User replies to a tweet:
@mindvault save This is a great insight about AI development

Bot response:
@username ✅ Tweet saved to MindVault!

📝 **original_author**: "AI is transforming how we think about software development..."

🏷️ Category: twitter
📋 Your note: "This is a great insight about AI development"

View it at: https://mindvault.app/notes/note-id
```

### Supported Commands

- `@mindvault save <description>` - Save the replied tweet with a description
- `@mindvault save` - Save the replied tweet without description

## 🔧 Configuration

### Environment Variables

| Variable                    | Description               | Required                |
| --------------------------- | ------------------------- | ----------------------- |
| `TWITTER_API_KEY`           | Twitter API key           | Yes                     |
| `TWITTER_API_SECRET`        | Twitter API secret        | Yes                     |
| `TWITTER_ACCESS_TOKEN`      | Twitter access token      | Yes                     |
| `TWITTER_ACCESS_SECRET`     | Twitter access secret     | Yes                     |
| `TWITTER_BEARER_TOKEN`      | Twitter bearer token      | Yes                     |
| `SUPABASE_URL`              | Supabase project URL      | Yes                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes                     |
| `BOT_USERNAME`              | Bot's Twitter username    | No (default: mindvault) |
| `BOT_WEBHOOK_URL`           | Webhook URL for Twitter   | Yes                     |

| `PORT` | Server port | No (default: 3001) |

### Cron Schedule

The bot checks for new mentions every 5 minutes by default. You can modify this in `src/index.js`:

```javascript
// Change from every 5 minutes to every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  await checkForNewMentions();
});
```

## 🏗️ Architecture

### File Structure

```
twitter-bot/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase database configuration
│   │   └── config.js            # Configuration settings
│   ├── services/
│   │   ├── twitterService.js    # Twitter API interactions
│   │   └── aiService.js         # AI content analysis
│   ├── handlers/
│   │   └── tweetHandler.js      # Main tweet processing logic
│   └── index.js                 # Express server and main entry point
├── package.json
├── env.example
└── README.md
```

### Data Flow

1. **Tweet Mention** → Twitter API → Webhook → Express Server
2. **Tweet Processing** → Extract original tweet → Find user → Generate content
3. **Note Creation** → Simple content → Database storage → Confirmation reply

### Content Features

- **Simple Formatting**: Clean markdown structure
- **Basic Categorization**: Standard twitter category
- **Tag Generation**: twitter and bot-saved tags
- **Metadata Preservation**: Original tweet links and user descriptions

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku App**

   ```bash
   heroku create mindvault-twitter-bot
   ```

2. **Set Environment Variables**

   ```bash
   heroku config:set TWITTER_API_KEY=your_key
   heroku config:set SUPABASE_URL=your_url
   # ... set all other variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect Repository**

   - Connect your GitHub repository to Railway
   - Set environment variables in Railway dashboard

2. **Deploy**
   - Railway will automatically deploy on push

### Vercel Deployment

1. **Create `vercel.json`**

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.js"
       }
     ]
   }
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔍 Monitoring

### Health Check

```bash
curl https://your-domain.com/health
```

### Logs

The bot logs all activities including:

- Mention processing
- Tweet saving
- AI analysis
- Error handling

### Error Handling

- Graceful error handling for API failures
- Fallback responses for users
- Comprehensive logging for debugging

## 🔒 Security

- **API Key Protection**: All API keys stored in environment variables
- **Webhook Validation**: Twitter webhook signature validation (recommended)
- **Rate Limiting**: Built-in rate limiting for API calls
- **Error Sanitization**: No sensitive data in error responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the logs for error details
2. Verify your environment variables
3. Test the webhook endpoint manually
4. Check Twitter API rate limits

---

**Built with ❤️ for MindVault**
