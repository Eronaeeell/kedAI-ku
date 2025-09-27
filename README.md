# KedAI-ku, Smarter Campaign For Kedai
kedAI-ku is an AI-powered marketing assistant designed to help Malaysian SMEs run smarter, more personalized, and cost-efficient digital campaigns. By combining open data (e.g., weather, events, holidays, trends) with GenAI-driven content creation, kedAI-ku enables businesses to plan, forecast, and auto-generate campaigns with just a few clicks.

## Our Mission

to empower SMEs with affordable, automated, and data-driven marketing, so they can compete effectively in today’s digital economy.

## Key Feature

1. **Campaign Planner + Predictor**: Users enter a prompt. KedAI-ku suggests campaign components, builds a visual “bubble plan,” and predicts campaign performance.
2. **AI Content Creator**: Generates ready-to-post captions and visuals. Supports multiple platforms (X, LinkedIn, etc.).
3. **Performance Forecasting**: Predict ROI and evaluate campaign effectiveness using algorithm.
4. **One-Click Posting**: Auto-publish campaigns to multiple channels.


## Tech Stack

1. AI Models: OpenRouter (GPT-3.5 Turbo), Stability AI
2. Data Sources: Weather API, Eventbrite API, SME POS/Sales data, online trends
3. Visualization: Recharts
4. Integrations: X Developer Portal, LinkedIn Developer Portal
5. Backend: Firebase


## Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm package manager
- API keys for:
  - OpenRouter API (for AI processing)
  - Stability AI (for image generation)
  - Weather API keys
  - Social media API credentials (LinkedIn, X/Twitter)
 
## User Guide
### 1. Clone the Repository
```bash
git clone https://github.com/Eronaeeell/kedAI-ku.git
cd kedAI-ku
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# AI Services
OPENROUTER_API_KEY=your_openrouter_api_key
STABILITY_API_KEY=your_stability_ai_key

# Weather APIs
OPENWEATHER_API_KEY=your_openweather_key
WEATHER_API_KEY=your_weatherapi_key

# Social Media - LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin-callback

# Social Media - X (Twitter)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Firebase (optional - for data persistence)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
# ... other Firebase config

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

### 1. **Create Campaign Brief**
Enter a description of your marketing campaign goals and target audience.

### 2. **AI Analysis**
The system automatically analyzes:
- Current weather patterns in Malaysia
- Trending topics on social media
- Historical sales data patterns
- Upcoming local events and festivals

### 3. **Component Generation**
AI generates relevant campaign components categorized as:
- **Local Data**: Weather-based and sales-driven insights
- **Online Trends**: Social media and search trending topics
- **Campaign Types**: Recommended promotion strategies

### 4. **Campaign Canvas**
- Drag components onto the campaign canvas
- Remove or modify components as needed

### 5. **Generate Marketing Materials**
- Create professional promotional posters
- Generate engaging social media captions

### 6. **Social Media Publishing**
- Direct post to LinkedIn and X (Twitter)
- Automatic hashtag suggestions

## Teams
**BlockDee**

- **Kenneth Jonathan Mardiyo** - Researcher
- **Angelina Leanore** - Full Stack Developer
- **Bryan Christoper Pradibta** - Full Stack Developer
- **Kelvin Vallian Guinawa** - Full Stack Developer

Developed with ❤️ for **Innojam 2025**
