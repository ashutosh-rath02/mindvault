# MindVault - AI-Powered Notes Application

MindVault is a sophisticated, AI-powered note-taking application that helps you organize, analyze, and connect your thoughts. Built with React, TypeScript, and Supabase, it features advanced AI capabilities for mood analysis, content categorization, and knowledge graph visualization.

## 🌟 Features

### Core Functionality
- **Rich Note Editor**: Markdown support with real-time preview
- **Voice-to-Text**: Record voice notes with automatic transcription
- **AI-Powered Analysis**: Automatic mood detection using Plutchik's Wheel of Emotions
- **Smart Categorization**: AI automatically categorizes your notes
- **Knowledge Graph**: Visualize connections between your notes
- **Advanced Search**: Semantic search powered by AI
- **Analytics Dashboard**: Insights into your writing patterns and productivity

### AI & Machine Learning
- **Emotion Analysis**: 48 different emotions from Plutchik's Wheel
- **Content Insights**: AI-generated summaries and key points
- **Semantic Search**: Find notes by meaning, not just keywords
- **AI Copilot**: Ask questions about your notes and get intelligent responses
- **Pattern Recognition**: Discover connections and themes in your knowledge base

### Organization & Productivity
- **Hierarchical Folders**: Organize notes in nested folders
- **Tags & Categories**: Flexible tagging system
- **Favorites & Archives**: Quick access to important notes
- **Export Options**: JSON, Markdown, and CSV export formats
- **Real-time Sync**: All data synced across devices

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI Services**: 
  - Google Gemini for content analysis
  - Dappier for semantic search and AI copilot
  - ElevenLabs for voice transcription
- **Visualization**: D3.js for knowledge graphs
- **Monitoring**: Sentry for error tracking and performance
- **Deployment**: Netlify with custom domain

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- API keys for AI services (optional but recommended)

### Environment Variables
Create a `.env` file with the following variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Services (Optional but recommended)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_DAPPIER_API_KEY=your_dappier_api_key_here

# Monitoring (Optional)
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

### Installation Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd mindvault
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Copy your project URL and anon key to `.env`

3. **Configure AI Services** (Optional)
   - **Google Gemini**: Get API key from Google AI Studio
   - **ElevenLabs**: Sign up for voice transcription API
   - **Dappier**: Get API key for semantic search (see sponsor benefits below)

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🎁 Sponsor Benefits & Integrations

This project leverages several sponsor benefits from the Bolt.new hackathon:

### 🔍 **Dappier AI** - Enhanced Search & Copilot
- **Benefit**: $25 in API credits + 50% off with code `BOLT50`
- **Integration**: Semantic search and AI copilot features
- **Setup**: Sign up at Dappier → Get API key → Add to `.env`
- **Features**: 
  - AI-powered semantic search
  - Intelligent note recommendations
  - Conversational AI copilot

### 📊 **Sentry** - Error Monitoring
- **Benefit**: 6 months free Team Plan with code `bolt-sentry-wlh`
- **Integration**: Complete error tracking and performance monitoring
- **Setup**: Create Sentry project → Get DSN → Add to `.env`
- **Features**:
  - Real-time error tracking
  - Performance monitoring
  - Session replay
  - Release tracking

### 🌐 **Entri** - Free Domain
- **Benefit**: 1 year free custom domain
- **Setup**: Visit Entri with Bolt Pro credentials → Claim domain
- **Integration**: Custom domain for production deployment

### 🌍 **Lingo** - Internationalization
- **Benefit**: $50 in credits with code `LINGODOTDEV4461484`
- **Potential Use**: Localize MindVault in 85+ languages
- **Setup**: Create account → Add credits → Integrate i18n

### 🎥 **Tavus** - Video Features
- **Benefit**: $150 in free credits for conversational video
- **Potential Use**: Video note-taking and AI avatar assistants
- **Setup**: Sign up → Get 250 free video minutes

### 📱 **RevenueCat** - Monetization
- **Benefit**: 100% free for Bolt participants
- **Potential Use**: Premium features and subscriptions
- **Setup**: Visit rev.cat/bolt → Start for free

### 🔧 **Additional Sponsors Available**
- **Expo**: 1 month free Production plan ($99 value)
- **21st.dev**: 50% off for UI component generation
- **DEV++**: Free 1-year membership with exclusive offers
- **Algorand/IPFS**: $512 value in API credits

## 🏗️ Architecture

### Database Schema
- **profiles**: User preferences and metadata
- **notes**: Main content with AI analysis
- **folders**: Hierarchical organization
- **tags**: Flexible tagging system
- **note_connections**: Knowledge graph relationships
- **ai_insights**: AI-generated analysis and insights

### AI Pipeline
1. **Content Analysis**: Gemini analyzes mood and categorizes content
2. **Semantic Processing**: Dappier creates embeddings for search
3. **Knowledge Graph**: D3.js visualizes note relationships
4. **Insights Generation**: AI identifies patterns and connections

### Security
- Row Level Security (RLS) on all tables
- JWT-based authentication via Supabase
- API key encryption and secure storage
- Error monitoring with Sentry

## 🚀 Deployment

### Netlify Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Set environment variables
   - Deploy with automatic builds

3. **Custom Domain** (Free with Entri)
   - Claim free domain through Entri
   - Configure DNS settings
   - Enable HTTPS

### Environment Configuration
Ensure all environment variables are set in Netlify:
- Supabase credentials
- AI service API keys
- Sentry configuration
- Custom domain settings

## 📈 Analytics & Monitoring

### Built-in Analytics
- Note creation patterns
- Mood analysis trends
- Category distribution
- Knowledge graph metrics
- User engagement insights

### Sentry Monitoring
- Real-time error tracking
- Performance metrics
- User session replays
- Release health monitoring
- Custom alerts and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Bolt.new** for the amazing development platform
- **Sponsor Partners** for providing essential services:
  - Dappier for AI capabilities
  - Sentry for monitoring
  - Entri for domain services
  - Supabase for backend infrastructure
  - Google for AI services
  - ElevenLabs for voice processing

## 🔗 Links

- **Live Demo**: [Your custom domain]
- **Documentation**: [Link to detailed docs]
- **API Reference**: [Link to API docs]
- **Support**: [Support contact]

---

Built with ❤️ using Bolt.new and powered by cutting-edge AI technology.