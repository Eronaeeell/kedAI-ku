import { WeatherService } from './weather-service';
import { TrendsService, SocialMediaTrendsService } from './trends-service';
import { GoogleTrendsService } from './google-trends-service';
import { MalaysiaGovService } from './malaysia-gov-service';
import { SalesService } from './sales-service';
import { KaggleSalesService } from './kaggle-sales-service';
import { OpenAIService } from './openai-service';
import { EventsService, CampaignTypeService } from './events-service';

interface CampaignComponent {
  id: string;
  type: 'local_data' | 'online_trend' | 'campaign_type';
  title: string;
  description: string;
  data: any;
  relevanceScore: number;
  category: string;
  keywords: string[];
  impact: 'high' | 'medium' | 'low';
}

interface CampaignAnalysis {
  components: CampaignComponent[];
  insights: string[];
  recommendations: string[];
  weatherImpact: string;
  trendImpact: string;
  salesImpact: string;
  eventImpact: string;
}

interface AIConfig {
  weatherApiKey?: string;
  trendsApiKey?: string;
  twitterToken?: string;
  instagramToken?: string;
  openrouterApiKey?: string; // Changed to OpenRouter API key
  region: string;
}

export class AICampaignProcessor {
  private weatherService: WeatherService;
  private trendsService: TrendsService;
  private googleTrendsService: GoogleTrendsService;
  private malaysiaGovService: MalaysiaGovService;
  private socialTrendsService: SocialMediaTrendsService;
  private salesService: SalesService;
  private kaggleSalesService: KaggleSalesService;
  private openaiService: OpenAIService;
  private eventsService: EventsService;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.weatherService = new WeatherService(config.weatherApiKey || '');
    this.trendsService = new TrendsService(config.trendsApiKey);
    this.googleTrendsService = new GoogleTrendsService(config.region);
    this.malaysiaGovService = new MalaysiaGovService();
    this.socialTrendsService = new SocialMediaTrendsService(config.twitterToken, config.instagramToken);
    this.salesService = new SalesService({ dataSource: 'mock' });
    this.kaggleSalesService = new KaggleSalesService();
    this.openaiService = new OpenAIService({ 
      apiKey: config.openrouterApiKey || '',
      baseURL: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-3.5-turbo'
    });
    
    console.log('AICampaignProcessor initialized with OpenRouter API key:', !!config.openrouterApiKey);
    this.eventsService = new EventsService({ 
      region: config.region,
      apiKey: config.trendsApiKey 
    });
  }

  async processCampaignData(prompt: string): Promise<CampaignAnalysis> {
    try {
      // Extract information from prompt
      const promptAnalysis = this.analyzePrompt(prompt);
      
      // Fetch all data sources in parallel
      const [
        weatherData,
        trendsData,
        googleTrendsData,
        malaysiaGovData,
        socialTrendsData,
        salesData,
        kaggleSalesData,
        eventsData
      ] = await Promise.all([
        this.fetchWeatherData(promptAnalysis.location),
        this.fetchTrendsData(promptAnalysis.categories),
        this.fetchGoogleTrendsData(promptAnalysis.categories),
        this.fetchMalaysiaGovData(promptAnalysis.categories),
        this.fetchSocialTrendsData(),
        this.fetchSalesData(promptAnalysis.timeframe),
        this.fetchKaggleSalesData(),
        this.fetchEventsData(promptAnalysis.timeframe)
      ]);

      // Generate campaign components
      const components = await this.generateCampaignComponents({
        weather: weatherData,
        trends: trendsData,
        googleTrends: googleTrendsData,
        malaysiaGov: malaysiaGovData,
        socialTrends: socialTrendsData,
        sales: salesData,
        kaggleSales: kaggleSalesData,
        events: eventsData,
        prompt: promptAnalysis
      });

      // Generate AI-powered insights and recommendations
      const aiAnalysis = await this.openaiService.analyzeCampaignData({
        weather: weatherData,
        trends: trendsData,
        googleTrends: googleTrendsData,
        malaysiaGov: malaysiaGovData,
        socialTrends: socialTrendsData,
        sales: salesData,
        kaggleSales: kaggleSalesData,
        events: eventsData,
        prompt
      });

      const insights = aiAnalysis.insights;
      const recommendations = aiAnalysis.recommendations;

      return {
        components,
        insights,
        recommendations,
        weatherImpact: this.analyzeWeatherImpact(weatherData, salesData),
        trendImpact: this.analyzeTrendImpact(trendsData, googleTrendsData, socialTrendsData),
        salesImpact: this.analyzeSalesImpact(salesData),
        eventImpact: this.analyzeEventImpact(eventsData)
      };
    } catch (error) {
      console.error('Error processing campaign data:', error);
      throw error;
    }
  }

  private analyzePrompt(prompt: string): {
    location: string;
    timeframe: string;
    categories: string[];
    businessType: string;
  } {
    // Simple prompt analysis - in a real implementation, you'd use NLP
    const location = prompt.includes('Malaysia') ? 'Malaysia' : 'Malaysia';
    const timeframe = prompt.includes('October') ? '2024-10' : 
                     prompt.includes('September') ? '2024-09' : 
                     new Date().toISOString().slice(0, 7);
    
    const categories = [];
    if (prompt.includes('food') || prompt.includes('cafe')) categories.push('food');
    if (prompt.includes('beverage') || prompt.includes('drink')) categories.push('beverage');
    if (prompt.includes('coffee')) categories.push('coffee');
    if (prompt.includes('tea')) categories.push('tea');
    
    const businessType = prompt.includes('cafe') ? 'cafe' : 'restaurant';
    
    return { location, timeframe, categories, businessType };
  }

  private async fetchWeatherData(location: string) {
    try {
      if (location === 'Malaysia') {
        return await this.weatherService.getMalaysiaWeatherData();
      } else {
        return [await this.weatherService.getCurrentWeather(location)];
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  }

  private async fetchTrendsData(categories: string[]) {
    try {
      const [foodTrends, beverageTrends] = await Promise.all([
        this.trendsService.getFoodTrends(this.config.region),
        this.trendsService.getBeverageTrends(this.config.region)
      ]);
      
      return [...foodTrends, ...beverageTrends];
    } catch (error) {
      console.error('Error fetching trends data:', error);
      return [];
    }
  }

  private async fetchGoogleTrendsData(categories: string[]) {
    try {
      const [foodTrends, beverageTrends, malaysianTrends, seasonalTrends] = await Promise.all([
        this.googleTrendsService.getFoodTrends(),
        this.googleTrendsService.getBeverageTrends(),
        this.googleTrendsService.getMalaysianTrends(),
        this.googleTrendsService.getSeasonalTrends()
      ]);
      
      return [...foodTrends, ...beverageTrends, ...malaysianTrends, ...seasonalTrends];
    } catch (error) {
      console.error('Error fetching Google Trends data:', error);
      return [];
    }
  }

  private async fetchMalaysiaGovData(categories: string[]) {
    try {
      const [economicData, demographicData, businessData, healthData, weatherData] = await Promise.all([
        this.malaysiaGovService.getEconomicData(),
        this.malaysiaGovService.getDemographicData(),
        this.malaysiaGovService.getBusinessData(),
        this.malaysiaGovService.getHealthData(),
        this.malaysiaGovService.getWeatherData()
      ]);
      
      return [...economicData, ...demographicData, ...businessData, ...healthData, ...weatherData];
    } catch (error) {
      console.error('Error fetching Malaysia government data:', error);
      return [];
    }
  }

  private async fetchKaggleSalesData() {
    try {
      const [salesAnalysis, customerSegments, timeSeriesData] = await Promise.all([
        this.kaggleSalesService.getSalesAnalysis(),
        this.kaggleSalesService.getCustomerSegments(),
        this.kaggleSalesService.getTimeSeriesData('monthly')
      ]);
      
      return {
        salesAnalysis,
        customerSegments,
        timeSeriesData
      };
    } catch (error) {
      console.error('Error fetching Kaggle sales data:', error);
      return null;
    }
  }

  private async fetchSocialTrendsData() {
    try {
      const [twitterTrends, instagramTrends] = await Promise.all([
        this.socialTrendsService.getTwitterTrends(this.config.region),
        this.socialTrendsService.getInstagramTrends()
      ]);
      
      return [...twitterTrends, ...instagramTrends];
    } catch (error) {
      console.error('Error fetching social trends data:', error);
      return [];
    }
  }

  private async fetchSalesData(timeframe: string) {
    try {
      return await this.salesService.getSalesData(timeframe);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return null;
    }
  }

  private async fetchEventsData(timeframe: string) {
    try {
      const days = 30; // Next 30 days
      return await this.eventsService.getUpcomingEvents(days);
    } catch (error) {
      console.error('Error fetching events data:', error);
      return [];
    }
  }

  private async generateCampaignComponents(data: {
    weather: any[];
    trends: any[];
    googleTrends: any[];
    malaysiaGov: any[];
    socialTrends: any[];
    sales: any;
    kaggleSales: any;
    events: any[];
    prompt: any;
  }): Promise<CampaignComponent[]> {
    const components: CampaignComponent[] = [];

    // Generate local data components from sales data
    if (data.sales) {
      components.push(...this.generateLocalDataComponents(data.sales));
    }

    // Generate Kaggle sales data components
    if (data.kaggleSales) {
      components.push(...this.generateKaggleSalesComponents(data.kaggleSales));
    }

    // Generate Malaysia government data components
    components.push(...this.generateMalaysiaGovComponents(data.malaysiaGov));

    // Generate online trend components
    components.push(...this.generateOnlineTrendComponents(data.trends, data.googleTrends, data.socialTrends));

    // Generate campaign type components
    components.push(...this.generateCampaignTypeComponents(data.events, data.trends));

    // Sort by relevance score
    return components.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private generateLocalDataComponents(salesData: any): CampaignComponent[] {
    const components: CampaignComponent[] = [];

    // Top performing items
    salesData.topItems.slice(0, 3).forEach((item: any) => {
      components.push({
        id: `local-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'local_data',
        title: item.name,
        description: `Top performer with ${item.sales} sales and RM${item.revenue} revenue`,
        data: item,
        relevanceScore: 90,
        category: item.category,
        keywords: [item.name.toLowerCase(), item.category],
        impact: 'high'
      });
    });

    // Weather correlation
    if (salesData.weatherCorrelation) {
      const weather = salesData.weatherCorrelation;
      components.push({
        id: 'local-weather',
        type: 'local_data',
        title: `${weather.condition} Weather`,
        description: `Current weather: ${weather.temperature}°C, ${weather.humidity}% humidity`,
        data: weather,
        relevanceScore: 75,
        category: 'weather',
        keywords: [weather.condition.toLowerCase(), 'temperature', 'humidity'],
        impact: 'medium'
      });
    }

    // Seasonal trends
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 8) {
      components.push({
        id: 'local-summer',
        type: 'local_data',
        title: 'Summer Season',
        description: 'Hot weather season - perfect for cold beverages',
        data: { season: 'summer', month },
        relevanceScore: 80,
        category: 'seasonal',
        keywords: ['summer', 'hot weather', 'cold drinks'],
        impact: 'high'
      });
    }

    return components;
  }

  private generateKaggleSalesComponents(kaggleSalesData: any): CampaignComponent[] {
    const components: CampaignComponent[] = [];

    if (!kaggleSalesData) return components;

    const { salesAnalysis, customerSegments, timeSeriesData } = kaggleSalesData;

    // Top performing categories
    salesAnalysis.topCategories.slice(0, 3).forEach((category: any) => {
      components.push({
        id: `kaggle-category-${category.category.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'local_data',
        title: `${category.category} Performance`,
        description: `RM${category.revenue.toLocaleString()} revenue (${category.percentage.toFixed(1)}% of total)`,
        data: category,
        relevanceScore: Math.min(95, 70 + category.percentage),
        category: 'sales_performance',
        keywords: [category.category.toLowerCase(), 'revenue', 'performance'],
        impact: category.percentage > 20 ? 'high' : category.percentage > 10 ? 'medium' : 'low'
      });
    });

    // Customer segments
    customerSegments.slice(0, 2).forEach((segment: any) => {
      components.push({
        id: `kaggle-segment-${segment.segment.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'local_data',
        title: `${segment.segment} Customers`,
        description: `${segment.customerCount} customers, RM${segment.totalRevenue.toLocaleString()} revenue`,
        data: segment,
        relevanceScore: Math.min(90, 60 + (segment.customerCount / 10)),
        category: 'customer_analysis',
        keywords: [segment.segment.toLowerCase(), 'customers', 'demographics'],
        impact: segment.customerCount > 50 ? 'high' : segment.customerCount > 20 ? 'medium' : 'low'
      });
    });

    // Sales trends
    if (timeSeriesData && timeSeriesData.length > 0) {
      const latestMonth = timeSeriesData[timeSeriesData.length - 1];
      const previousMonth = timeSeriesData[timeSeriesData.length - 2];
      
      if (previousMonth) {
        const growthRate = ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
        
        components.push({
          id: 'kaggle-sales-trend',
          type: 'local_data',
          title: 'Sales Growth Trend',
          description: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}% growth from last month`,
          data: { growthRate, latestMonth, previousMonth },
          relevanceScore: Math.min(95, 70 + Math.abs(growthRate)),
          category: 'sales_trend',
          keywords: ['growth', 'trend', 'sales'],
          impact: Math.abs(growthRate) > 10 ? 'high' : Math.abs(growthRate) > 5 ? 'medium' : 'low'
        });
      }
    }

    // Overall performance
    components.push({
      id: 'kaggle-overall-performance',
      type: 'local_data',
      title: 'Overall Sales Performance',
      description: `RM${salesAnalysis.totalRevenue.toLocaleString()} total revenue, ${salesAnalysis.totalTransactions} transactions`,
      data: salesAnalysis,
      relevanceScore: 85,
      category: 'sales_overview',
      keywords: ['total revenue', 'transactions', 'performance'],
      impact: 'high'
    });

    return components;
  }

  private generateMalaysiaGovComponents(malaysiaGovData: any[]): CampaignComponent[] {
    const components: CampaignComponent[] = [];

    malaysiaGovData.slice(0, 5).forEach((data: any) => {
      components.push({
        id: `malaysia-gov-${data.id}`,
        type: 'local_data',
        title: data.title,
        description: `${data.description} (${data.source})`,
        data: data,
        relevanceScore: data.relevanceScore,
        category: data.category,
        keywords: [data.category, data.source.toLowerCase()],
        impact: data.relevanceScore > 85 ? 'high' : data.relevanceScore > 70 ? 'medium' : 'low'
      });
    });

    return components;
  }

  private generateOnlineTrendComponents(trends: any[], googleTrends: any[], socialTrends: any[]): CampaignComponent[] {
    const components: CampaignComponent[] = [];

    // Google Trends (prioritize these as they're more accurate)
    googleTrends.slice(0, 6).forEach((trend: any) => {
      components.push({
        id: `google-trend-${trend.keyword.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'online_trend',
        title: trend.keyword,
        description: `Google Trends: ${trend.interest}% interest in ${trend.region} (${trend.timeRange})`,
        data: trend,
        relevanceScore: trend.interest,
        category: 'google_trend',
        keywords: trend.relatedQueries || [],
        impact: trend.interest > 80 ? 'high' : trend.interest > 60 ? 'medium' : 'low'
      });
    });

    // Regular trends
    trends.slice(0, 3).forEach((trend: any) => {
      components.push({
        id: `trend-${trend.keyword.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'online_trend',
        title: trend.keyword,
        description: `Trending with ${trend.interest}% interest in ${trend.region}`,
        data: trend,
        relevanceScore: trend.interest,
        category: 'trend',
        keywords: trend.relatedQueries || [],
        impact: trend.interest > 80 ? 'high' : trend.interest > 60 ? 'medium' : 'low'
      });
    });

    // Social media trends
    socialTrends.slice(0, 3).forEach((trend: any) => {
      components.push({
        id: `social-${trend.keyword.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'online_trend',
        title: trend.keyword,
        description: `Social media trending with ${trend.interest} mentions`,
        data: trend,
        relevanceScore: trend.interest,
        category: 'social',
        keywords: trend.relatedQueries || [],
        impact: trend.interest > 80 ? 'high' : trend.interest > 60 ? 'medium' : 'low'
      });
    });

    return components;
  }

  private generateCampaignTypeComponents(events: any[], trends: any[]): CampaignComponent[] {
    const components: CampaignComponent[] = [];
    const campaignTypes = CampaignTypeService.getCampaignTypes();
    const trendingKeywords = trends.map(t => t.keyword);

    // Get recommended campaign types
    const recommendations = CampaignTypeService.getRecommendedCampaignTypes(events, trendingKeywords);

    recommendations.slice(0, 4).forEach((rec: any) => {
      components.push({
        id: `campaign-${rec.campaignType.id}`,
        type: 'campaign_type',
        title: rec.campaignType.name,
        description: rec.campaignType.description,
        data: rec.campaignType,
        relevanceScore: rec.relevanceScore,
        category: rec.campaignType.category,
        keywords: rec.campaignType.keywords,
        impact: rec.campaignType.effectiveness
      });
    });

    return components;
  }

  private generateInsights(weather: any[], trends: any[], googleTrends: any[], malaysiaGov: any[], sales: any, events: any[]): string[] {
    const insights: string[] = [];

    // Weather insights
    if (weather.length > 0) {
      const avgTemp = weather.reduce((sum, w) => sum + w.temperature, 0) / weather.length;
      if (avgTemp > 30) {
        insights.push('Hot weather detected - focus on cold beverages and refreshing items');
      } else if (avgTemp < 25) {
        insights.push('Cooler weather - promote warm drinks and comfort food');
      }
    }

    // Sales insights
    if (sales) {
      const topCategory = sales.categories.beverages.coffee > sales.categories.beverages.tea ? 'coffee' : 'tea';
      insights.push(`${topCategory} is your top-performing beverage category`);
      
      if (sales.averageOrderValue > 30) {
        insights.push('High average order value - customers are willing to spend more');
      }
    }

    // Google Trends insights (prioritize these)
    const topGoogleTrends = googleTrends.slice(0, 3).map(t => t.keyword);
    if (topGoogleTrends.length > 0) {
      insights.push(`Top Google Trends: ${topGoogleTrends.join(', ')}`);
    }

    // Regular trend insights
    const topTrends = trends.slice(0, 3).map(t => t.keyword);
    if (topTrends.length > 0) {
      insights.push(`Other trending keywords: ${topTrends.join(', ')}`);
    }

    // Malaysia Government data insights
    const highRelevanceGovData = malaysiaGov.filter(d => d.relevanceScore > 80);
    if (highRelevanceGovData.length > 0) {
      const categories = [...new Set(highRelevanceGovData.map(d => d.category))];
      insights.push(`Key Malaysian data: ${categories.join(', ')} trends from government sources`);
    }

    // Event insights
    const highImpactEvents = events.filter(e => e.impact === 'high');
    if (highImpactEvents.length > 0) {
      insights.push(`Upcoming high-impact events: ${highImpactEvents.map(e => e.name).join(', ')}`);
    }

    return insights;
  }

  private generateRecommendations(components: CampaignComponent[], insights: string[]): string[] {
    const recommendations: string[] = [];

    // Component-based recommendations
    const highImpactComponents = components.filter(c => c.impact === 'high');
    if (highImpactComponents.length > 0) {
      recommendations.push(`Focus on high-impact components: ${highImpactComponents.map(c => c.title).join(', ')}`);
    }

    // Weather-based recommendations
    const weatherComponents = components.filter(c => c.category === 'weather');
    if (weatherComponents.length > 0) {
      recommendations.push('Adjust menu and promotions based on current weather conditions');
    }

    // Trend-based recommendations
    const trendComponents = components.filter(c => c.type === 'online_trend');
    if (trendComponents.length > 0) {
      recommendations.push('Incorporate trending items into your menu and marketing');
    }

    // Event-based recommendations
    const eventComponents = components.filter(c => c.type === 'campaign_type' && c.category === 'event_based');
    if (eventComponents.length > 0) {
      recommendations.push('Create event-themed campaigns to capitalize on upcoming events');
    }

    return recommendations;
  }

  private analyzeWeatherImpact(weather: any[], sales: any): string {
    if (weather.length === 0 || !sales) return 'No weather data available';
    
    const avgTemp = weather.reduce((sum, w) => sum + w.temperature, 0) / weather.length;
    const condition = weather[0].condition;
    
    return `Weather impact: ${condition} weather at ${avgTemp.toFixed(1)}°C affecting beverage preferences`;
  }

  private analyzeTrendImpact(trends: any[], googleTrends: any[], socialTrends: any[]): string {
    const totalTrends = trends.length + googleTrends.length + socialTrends.length;
    const highInterestTrends = [...trends, ...googleTrends, ...socialTrends].filter(t => t.interest > 80).length;
    const googleHighTrends = googleTrends.filter(t => t.interest > 80).length;
    
    return `Trend impact: ${highInterestTrends} high-interest trends (${googleHighTrends} from Google Trends) out of ${totalTrends} total trends`;
  }

  private analyzeSalesImpact(sales: any): string {
    if (!sales) return 'No sales data available';
    
    const growth = sales.totalRevenue > 40000 ? 'positive' : 'negative';
    return `Sales impact: ${growth} revenue trend with RM${sales.totalRevenue.toLocaleString()} total revenue`;
  }

  private analyzeEventImpact(events: any[]): string {
    const highImpactEvents = events.filter(e => e.impact === 'high').length;
    const upcomingEvents = events.length;
    
    return `Event impact: ${highImpactEvents} high-impact events out of ${upcomingEvents} upcoming events`;
  }
}
