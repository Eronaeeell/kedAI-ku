interface TrendData {
  keyword: string;
  interest: number;
  region: string;
  timeRange: string;
  relatedQueries?: string[];
  risingQueries?: string[];
}

interface GoogleTrendsConfig {
  apiKey?: string;
  baseUrl: string;
}

export class TrendsService {
  private config: GoogleTrendsConfig;

  constructor(apiKey?: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://trends.google.com/trends/api'
    };
  }

  // Note: Google Trends doesn't have an official API, so we'll use alternative methods
  async getTrendingKeywords(region: string = 'MY', category: string = 'food'): Promise<TrendData[]> {
    try {
      // This would typically use a service like RapidAPI or similar
      // For now, we'll return mock data structure
      const mockTrends: TrendData[] = [
        {
          keyword: 'matcha latte',
          interest: 85,
          region: region,
          timeRange: 'past 30 days',
          relatedQueries: ['iced matcha', 'matcha boba', 'green tea'],
          risingQueries: ['ceremony grade matcha', 'matcha smoothie']
        },
        {
          keyword: 'bubble tea',
          interest: 92,
          region: region,
          timeRange: 'past 30 days',
          relatedQueries: ['boba tea', 'pearl milk tea', 'tapioca'],
          risingQueries: ['brown sugar boba', 'cheese foam tea']
        },
        {
          keyword: 'cold brew coffee',
          interest: 78,
          region: region,
          timeRange: 'past 30 days',
          relatedQueries: ['iced coffee', 'nitro coffee', 'cold drip'],
          risingQueries: ['oat milk cold brew', 'vanilla cold brew']
        }
      ];

      return mockTrends;
    } catch (error) {
      console.error('Error fetching trending keywords:', error);
      throw error;
    }
  }

  async getFoodTrends(region: string = 'MY'): Promise<TrendData[]> {
    const foodKeywords = [
      'avocado toast',
      'acai bowl',
      'sourdough bread',
      'artisanal coffee',
      'plant based milk',
      'korean food',
      'japanese cuisine',
      'thai food'
    ];

    const trends: TrendData[] = [];

    for (const keyword of foodKeywords) {
      // In a real implementation, you would call the actual trends API
      trends.push({
        keyword,
        interest: Math.floor(Math.random() * 100),
        region,
        timeRange: 'past 30 days',
        relatedQueries: [`${keyword} recipe`, `${keyword} near me`],
        risingQueries: [`healthy ${keyword}`, `vegan ${keyword}`]
      });
    }

    return trends;
  }

  async getBeverageTrends(region: string = 'MY'): Promise<TrendData[]> {
    const beverageKeywords = [
      'oat milk',
      'almond milk',
      'coconut milk',
      'dirty matcha',
      'dirty chai',
      'golden milk',
      'turmeric latte',
      'mushroom coffee'
    ];

    const trends: TrendData[] = [];

    for (const keyword of beverageKeywords) {
      trends.push({
        keyword,
        interest: Math.floor(Math.random() * 100),
        region,
        timeRange: 'past 30 days',
        relatedQueries: [`${keyword} benefits`, `${keyword} recipe`],
        risingQueries: [`${keyword} alternative`, `best ${keyword}`]
      });
    }

    return trends;
  }
}

// Social Media Trends Service
export class SocialMediaTrendsService {
  private twitterToken?: string;
  private instagramToken?: string;

  constructor(twitterToken?: string, instagramToken?: string) {
    this.twitterToken = twitterToken;
    this.instagramToken = instagramToken;
  }

  async getTwitterTrends(region: string = 'Malaysia'): Promise<TrendData[]> {
    if (!this.twitterToken) {
      console.warn('Twitter token not provided, returning mock data');
      return this.getMockSocialTrends('Twitter');
    }

    try {
      // Twitter API v2 implementation would go here
      const response = await fetch(
        `https://api.twitter.com/2/trends/by/woeid/${this.getWOEID(region)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.twitterToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseTwitterTrends(data);
    } catch (error) {
      console.error('Error fetching Twitter trends:', error);
      return this.getMockSocialTrends('Twitter');
    }
  }

  async getInstagramTrends(): Promise<TrendData[]> {
    if (!this.instagramToken) {
      console.warn('Instagram token not provided, returning mock data');
      return this.getMockSocialTrends('Instagram');
    }

    try {
      // Instagram Basic Display API implementation would go here
      // This is a simplified version
      return this.getMockSocialTrends('Instagram');
    } catch (error) {
      console.error('Error fetching Instagram trends:', error);
      return this.getMockSocialTrends('Instagram');
    }
  }

  private getWOEID(region: string): string {
    const woeidMap: { [key: string]: string } = {
      'Malaysia': '23424901',
      'Kuala Lumpur': '1154781',
      'Singapore': '23424948',
      'Thailand': '23424960',
      'Indonesia': '23424846'
    };
    return woeidMap[region] || '23424901';
  }

  private parseTwitterTrends(data: any): TrendData[] {
    // Parse Twitter trends API response
    return data.trends?.map((trend: any) => ({
      keyword: trend.name,
      interest: trend.tweet_volume || 0,
      region: 'Malaysia',
      timeRange: 'past 24 hours',
      relatedQueries: [],
      risingQueries: []
    })) || [];
  }

  private getMockSocialTrends(platform: string): TrendData[] {
    const mockTrends = [
      {
        keyword: '#matcha',
        interest: 85,
        region: 'Malaysia',
        timeRange: 'past 24 hours',
        relatedQueries: ['#matchalatte', '#greentea', '#healthy'],
        risingQueries: ['#ceremonymatcha', '#matchasmoothie']
      },
      {
        keyword: '#bubbletea',
        interest: 92,
        region: 'Malaysia',
        timeRange: 'past 24 hours',
        relatedQueries: ['#boba', '#pearlmilktea', '#tapioca'],
        risingQueries: ['#brownsugarboba', '#cheesefoam']
      },
      {
        keyword: '#coffee',
        interest: 88,
        region: 'Malaysia',
        timeRange: 'past 24 hours',
        relatedQueries: ['#latte', '#cappuccino', '#espresso'],
        risingQueries: ['#coldbrew', '#oatmilkcoffee']
      }
    ];

    return mockTrends.map(trend => ({
      ...trend,
      keyword: `${trend.keyword} (${platform})`
    }));
  }
}
