# MindVault - AI-Powered Notes Application

MindVault is a sophisticated, AI-powered note-taking application that helps you organize, analyze, and connect your thoughts. Built with React, TypeScript, and Supabase, it features advanced AI capabilities for mood analysis, content categorization, and knowledge graph visualization.

## 🌟 Features

### Core Functionality
- **Rich Note Editor**: Markdown support with real-time preview
- **Voice-to-Text**: Record voice notes with automatic transcription
- **AI-Powered Analysis**: Automatic mood detection using Plutchik's Wheel of Emotions
- **Smart Categorization**: AI automatically categorizes your notes
- **Knowledge Graph**: Visualize connections between your notes
- **Advanced Search**: Full-text search with filtering
- **Analytics Dashboard**: Insights into your writing patterns and productivity

### AI & Machine Learning
- **Emotion Analysis**: 48 different emotions from Plutchik's Wheel
- **Content Insights**: AI-generated summaries and key points
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
  - ElevenLabs for voice transcription
- **Visualization**: D3.js for knowledge graphs
- **Monetization**: RevenueCat for subscription management
- **Deployment**: Netlify

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

# Monetization (Optional)
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key_here
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

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🎁 Sponsor Benefits & Integrations

This project leverages several sponsor benefits from the Bolt.new hackathon:

### 💰 **RevenueCat** - Monetization ⭐ READY TO INTEGRATE
- **Benefit**: 100% free for Bolt participants
- **Integration**: Monetization panel with subscription plans
- **Setup**: Visit rev.cat/bolt → Get API key → Add to `.env`
- **Features**:
  - Subscription management
  - Payment processing
  - Revenue analytics
  - Cross-platform support

### 🌍 **Lingo** - Internationalization
- **Benefit**: $50 in credits with code `LINGODOTDEV4461484`
- **Potential Use**: Localize MindVault in 85+ languages
- **Setup**: Create account → Add credits → Integrate i18n

### 🎥 **Tavus** - Video Features
- **Benefit**: $150 in free credits for conversational video
- **Potential Use**: Video note-taking and AI avatar assistants
- **Setup**: Sign up → Get 250 free video minutes

### 🎨 **Pica** - Image Processing
- **Benefit**: 2 months free Pro access ($200 value)
- **Potential Use**: Advanced image processing for note attachments
- **Setup**: Use code `GO-BOLT-fe060339` at checkout

### 🔧 **21st.dev** - UI Enhancement
- **Benefit**: 50% off for one year with code `BOLT-AZQW3SXA`
- **Potential Use**: AI-powered UI component generation
- **Setup**: Create account → Use promo code

### 🔗 **Additional Sponsors Available**
- **Expo**: 1 month free Production plan ($99 value)
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
2. **Knowledge Graph**: D3.js visualizes note relationships
3. **Insights Generation**: AI identifies patterns and connections

### Security
- Row Level Security (RLS) on all tables
- JWT-based authentication via Supabase
- API key encryption and secure storage

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

### Environment Configuration
Ensure all environment variables are set in Netlify:
- Supabase credentials
- AI service API keys
- RevenueCat settings

## 📈 Analytics & Monitoring

### Built-in Analytics
- Note creation patterns
- Mood analysis trends
- Category distribution
- Knowledge graph metrics
- User engagement insights

## 💰 Monetization Strategy

### Subscription Tiers (via RevenueCat)
- **Free**: Basic features, limited AI analysis
- **Pro ($9.99/month)**: Unlimited notes, advanced AI, premium features
- **Enterprise ($29.99/month)**: Team features, admin dashboard, API access

### Premium Features
- Advanced AI insights and analysis
- Unlimited voice transcription
- Custom themes and branding
- Priority support
- Team collaboration
- API access

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
  - **RevenueCat** for monetization infrastructure
  - **Lingo** for internationalization capabilities
  - **Tavus** for video processing potential
  - **Pica** for image optimization
  - **21st.dev** for UI enhancement tools
  - Supabase for backend infrastructure
  - Google for AI services
  - ElevenLabs for voice processing

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **RevenueCat Setup**: Ready for subscription monetization
- **API Documentation**: [Link to API docs]

---

Built with ❤️ using Bolt.new and powered by cutting-edge AI technology from our amazing sponsors.