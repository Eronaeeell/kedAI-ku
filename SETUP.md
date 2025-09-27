# AI Campaign Planner - Setup Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following API keys:

```env
# Weather APIs
OPENWEATHER_API_KEY=your_openweather_api_key_here
WEATHER_API_KEY=your_weather_api_key_here

# Google Trends (using pytrends - no API key needed)
# Google Trends is accessed through unofficial methods
# No API key required - uses pytrends library

# AI Services


# Social Media APIs (Optional - using mock data)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here

# News and Events APIs
NEWS_API_KEY=your_news_api_key_here
EVENTBRITE_API_KEY=your_eventbrite_api_key_here

# Google Services
GOOGLE_TRENDS_API_KEY=your_google_trends_api_key_here
GOOGLE_ADS_API_KEY=your_google_ads_api_key_here

# Facebook/Meta APIs (Not needed for this project)
# FACEBOOK_APP_ID=your_facebook_app_id_here
# FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Malaysian Government Data (FREE - No API key required)
# MALAYSIA_GOV_API_KEY=your_malaysia_gov_api_key_here

# Optional: Database for storing data
DATABASE_URL=your_database_url_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## API Keys Setup Instructions

### 1. Weather APIs

#### OpenWeatherMap (Recommended - FREE)

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. **Free tier: 1,000 calls/day** (Current Weather + 5-Day Forecast APIs)
5. **Note**: One Call API 3.0 requires payment, but Current Weather and 5-Day Forecast APIs are free

#### WeatherAPI (Alternative)

1. Go to [WeatherAPI](https://www.weatherapi.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 1 million calls/month

### 2. Google Trends (FREE - No API Key Required)

#### Google Trends via Pytrends

1. **No signup required**
2. **No API key needed**
3. **Completely free**
4. **Unlimited requests** (with rate limiting)
5. **Install pytrends**: `npm install pytrends`

### 3. Malaysia Government APIs (FREE)

#### Malaysia Open Data Portal

1. **No API key required** for most datasets
2. **Completely FREE**
3. **Economic data** - GDP, inflation, business trends
4. **Demographic data** - Population, age groups, income
5. **Business data** - F&B sector growth, retail sales
6. **Health data** - Public health trends, dietary patterns
7. **Weather data** - Malaysian Meteorological Department

#### Data Sources:

- **data.gov.my** - Main open data portal
- **developer.data.gov.my** - API documentation
- **met.gov.my** - Weather data
- **Department of Statistics Malaysia** - Economic data

### 4. AI Services

#### OpenRouter API (Recommended - More Affordable)

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Go to **Keys** section
4. Create a new API key
5. **Pricing**: More affordable than OpenAI directly
6. **Models**: GPT-3.5-turbo, GPT-4, Claude, and many others
7. **Your API Key**: `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`

### 5. Social Media APIs

#### Twitter API

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account
3. Create a new app
4. Generate Bearer Token

#### Instagram API

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Generate access token

### 3. News and Events APIs

#### NewsAPI

1. Go to [NewsAPI](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key
4. Free tier: 1,000 requests/day

#### Eventbrite API

1. Go to [Eventbrite API](https://www.eventbrite.com/platform/api-keys/)
2. Sign up for an account
3. Generate API key

### 4. Google Services

#### Google Trends (Unofficial)

- No official API key needed
- Uses pytrends library for data access
- Rate limited by Google

#### Google Ads API

1. Go to [Google Ads API](https://developers.google.com/google-ads/api)
2. Set up OAuth 2.0 credentials
3. Get API key

## Data Sources Available

### 1. Sales Data

- **Mock Data**: Realistic sales data generator included
- **Real Data**: Can be integrated with your existing sales system
- **Kaggle Datasets**: Can be connected to various retail datasets

### 2. Weather Data

- **Current Weather**: Real-time weather for Malaysian cities
- **Forecasts**: 5-day weather forecasts
- **Historical Data**: Past weather patterns for analysis

### 3. Trend Data

- **Google Trends**: Search trends for food and beverages
- **Social Media**: Twitter and Instagram trending topics
- **Food Trends**: Popular food and beverage keywords

### 4. Events Data

- **Malaysian Festivals**: Hari Raya, Chinese New Year, Deepavali, etc.
- **Local Events**: KL Food Festival, Coffee Week, etc.
- **Seasonal Events**: Weather-based seasonal patterns

### 5. Campaign Types

- **Discount Campaigns**: Buy 1 Get 1, percentage discounts
- **Promotional Campaigns**: Free upsize, happy hour
- **Seasonal Campaigns**: Limited-time seasonal items
- **Event-based Campaigns**: Festival and event-themed promotions

## Features

### AI Data Processing

- **Weather Analysis**: Correlates weather with sales performance
- **Trend Analysis**: Identifies trending keywords and topics
- **Sales Analysis**: Analyzes historical sales data
- **Event Analysis**: Considers upcoming events and festivals

### Campaign Component Generation

- **Local Data Components**: Based on sales performance and weather
- **Online Trend Components**: Based on trending keywords
- **Campaign Type Components**: Recommended promotion types

### Real-time Insights

- **Key Insights**: AI-generated insights from data analysis
- **Recommendations**: Actionable recommendations for campaigns
- **Impact Analysis**: Weather, trend, sales, and event impact

## Usage

1. **Enter Campaign Brief**: Describe your campaign goals
2. **AI Analysis**: System analyzes weather, trends, sales, and events
3. **Generated Components**: AI creates relevant campaign components
4. **Drag & Drop**: Use components to build your campaign
5. **Generate Campaign**: Create final campaign based on selected components

## Mock Data

The system includes comprehensive mock data for testing:

- **Sales Data**: Realistic cafe/restaurant sales patterns
- **Weather Data**: Malaysian weather patterns
- **Trend Data**: Food and beverage trends
- **Event Data**: Malaysian festivals and local events

## Development

### Running the Application

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### API Endpoints

- `POST /api/generate-campaign` - Generate campaign based on prompt
- `GET /api/generate-campaign` - API information

### Data Services

- `lib/data-services/weather-service.ts` - Weather data integration
- `lib/data-services/trends-service.ts` - Trends data integration
- `lib/data-services/sales-service.ts` - Sales data integration
- `lib/data-services/events-service.ts` - Events data integration
- `lib/data-services/ai-processor.ts` - AI data processing

## Troubleshooting

### Common Issues

1. **API Rate Limits**: Some APIs have rate limits, check your usage
2. **Missing API Keys**: Ensure all required API keys are set
3. **Network Errors**: Check your internet connection
4. **CORS Issues**: Ensure API endpoints allow your domain

### Debug Mode

Set `NODE_ENV=development` to enable debug logging and detailed error messages.

## Support

For issues or questions:

1. Check the console for error messages
2. Verify API keys are correctly set
3. Check network connectivity
4. Review API documentation for rate limits and usage
