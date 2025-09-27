interface GoogleTrendsData {
  keyword: string;
  interest: number;
  region: string;
  timeRange: string;
  relatedQueries: string[];
  risingQueries: string[];
  interestOverTime: Array<{
    date: string;
    value: number;
  }>;
}

interface GoogleTrendsConfig {
  region: string;
  timeRange: string;
  category: number;
}

export class GoogleTrendsService {
  private config: GoogleTrendsConfig;

  constructor(region: string = 'MY', timeRange: string = 'today 3-m') {
    this.config = {
      region,
      timeRange,
      category: 0 // General category
    };
  }

  async getTrendingKeywords(keywords: string[]): Promise<GoogleTrendsData[]> {
    try {
      // For now, return mock data that simulates Google Trends
      // In a real implementation, you would use pytrends or direct API calls
      return this.getMockTrendsData(keywords);
    } catch (error) {
      console.error('Error fetching Google Trends data:', error);
      return this.getMockTrendsData(keywords);
    }
  }

  async getFoodTrends(): Promise<GoogleTrendsData[]> {
    const foodKeywords = [
      'matcha latte',
      'bubble tea',
      'cold brew coffee',
      'avocado toast',
      'acai bowl',
      'sourdough bread',
      'artisanal coffee',
      'plant based milk',
      'korean food',
      'japanese cuisine',
      'thai food',
      'local cafe',
      'coffee shop',
      'brunch',
      'healthy food'
    ];

    return this.getTrendingKeywords(foodKeywords);
  }

  async getBeverageTrends(): Promise<GoogleTrendsData[]> {
    const beverageKeywords = [
      'oat milk',
      'almond milk',
      'coconut milk',
      'dirty matcha',
      'dirty chai',
      'golden milk',
      'turmeric latte',
      'mushroom coffee',
      'nitro coffee',
      'cold brew',
      'iced coffee',
      'smoothie',
      'fresh juice',
      'kombucha',
      'herbal tea'
    ];

    return this.getTrendingKeywords(beverageKeywords);
  }

  async getMalaysianTrends(): Promise<GoogleTrendsData[]> {
    const malaysianKeywords = [
      'nasi lemak',
      'char kway teow',
      'laksa',
      'roti canai',
      'teh tarik',
      'kopi o',
      'cendol',
      'durian',
      'ramly burger',
      'mamak food',
      'penang food',
      'kl food',
      'malaysian cuisine',
      'local food',
      'street food malaysia'
    ];

    return this.getTrendingKeywords(malaysianKeywords);
  }

  async getSeasonalTrends(): Promise<GoogleTrendsData[]> {
    const currentMonth = new Date().getMonth() + 1;
    let seasonalKeywords: string[] = [];

    if (currentMonth >= 3 && currentMonth <= 5) {
      // Spring
      seasonalKeywords = [
        'spring menu',
        'fresh ingredients',
        'light meals',
        'healthy options',
        'green smoothie',
        'fresh salad'
      ];
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      // Summer
      seasonalKeywords = [
        'summer drinks',
        'cold beverages',
        'iced coffee',
        'cold brew',
        'refreshing drinks',
        'smoothie bowl',
        'frozen treats'
      ];
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      // Autumn
      seasonalKeywords = [
        'autumn flavors',
        'pumpkin spice',
        'warm drinks',
        'comfort food',
        'hot chocolate',
        'spiced latte'
      ];
    } else {
      // Winter
      seasonalKeywords = [
        'winter drinks',
        'hot beverages',
        'warm coffee',
        'comfort food',
        'cozy drinks',
        'hot soup'
      ];
    }

    return this.getTrendingKeywords(seasonalKeywords);
  }

  private getMockTrendsData(keywords: string[]): GoogleTrendsData[] {
    return keywords.map(keyword => {
      // Generate realistic interest scores based on keyword popularity
      const baseInterest = this.getBaseInterest(keyword);
      const variation = Math.random() * 20 - 10; // ±10 variation
      const interest = Math.max(0, Math.min(100, baseInterest + variation));

      return {
        keyword,
        interest: Math.round(interest),
        region: this.config.region,
        timeRange: this.config.timeRange,
        relatedQueries: this.getRelatedQueries(keyword),
        risingQueries: this.getRisingQueries(keyword),
        interestOverTime: this.generateInterestOverTime(keyword, interest)
      };
    });
  }

  private getBaseInterest(keyword: string): number {
    // Assign base interest scores based on keyword popularity
    const popularKeywords: { [key: string]: number } = {
      'matcha latte': 85,
      'bubble tea': 90,
      'cold brew coffee': 75,
      'avocado toast': 70,
      'nasi lemak': 95,
      'char kway teow': 88,
      'laksa': 85,
      'teh tarik': 80,
      'kopi o': 75,
      'oat milk': 60,
      'almond milk': 55,
      'dirty matcha': 40,
      'golden milk': 35,
      'mushroom coffee': 25,
      'kombucha': 45
    };

    return popularKeywords[keyword.toLowerCase()] || 50;
  }

  private getRelatedQueries(keyword: string): string[] {
    const relatedQueriesMap: { [key: string]: string[] } = {
      'matcha latte': ['iced matcha', 'matcha boba', 'green tea', 'ceremony matcha'],
      'bubble tea': ['boba tea', 'pearl milk tea', 'tapioca', 'brown sugar boba'],
      'cold brew coffee': ['iced coffee', 'nitro coffee', 'cold drip', 'iced americano'],
      'nasi lemak': ['malaysian food', 'coconut rice', 'sambal', 'local food'],
      'char kway teow': ['malaysian noodles', 'fried noodles', 'penang food', 'hawker food'],
      'laksa': ['curry laksa', 'asam laksa', 'malaysian soup', 'spicy noodles'],
      'oat milk': ['plant milk', 'dairy free', 'vegan milk', 'alternative milk'],
      'avocado toast': ['healthy breakfast', 'brunch', 'avocado', 'sourdough']
    };

    return relatedQueriesMap[keyword.toLowerCase()] || [
      `${keyword} recipe`,
      `${keyword} near me`,
      `best ${keyword}`,
      `how to make ${keyword}`
    ];
  }

  private getRisingQueries(keyword: string): string[] {
    const risingQueriesMap: { [key: string]: string[] } = {
      'matcha latte': ['ceremony grade matcha', 'matcha smoothie', 'dirty matcha'],
      'bubble tea': ['brown sugar boba', 'cheese foam tea', 'tiger sugar'],
      'cold brew coffee': ['oat milk cold brew', 'vanilla cold brew', 'nitro cold brew'],
      'nasi lemak': ['nasi lemak burger', 'nasi lemak pizza', 'fusion nasi lemak'],
      'oat milk': ['barista oat milk', 'oat milk latte', 'oat milk cappuccino']
    };

    return risingQueriesMap[keyword.toLowerCase()] || [
      `healthy ${keyword}`,
      `vegan ${keyword}`,
      `homemade ${keyword}`,
      `${keyword} 2024`
    ];
  }

  private generateInterestOverTime(keyword: string, baseInterest: number): Array<{date: string, value: number}> {
    const data: Array<{date: string, value: number}> = [];
    const today = new Date();
    
    // Generate 12 weeks of data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      
      // Add some variation to make it look realistic
      const variation = Math.random() * 30 - 15; // ±15 variation
      const value = Math.max(0, Math.min(100, baseInterest + variation));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      });
    }
    
    return data;
  }

  // Method to get trends by category
  async getTrendsByCategory(category: string): Promise<GoogleTrendsData[]> {
    switch (category.toLowerCase()) {
      case 'food':
        return this.getFoodTrends();
      case 'beverage':
        return this.getBeverageTrends();
      case 'malaysian':
        return this.getMalaysianTrends();
      case 'seasonal':
        return this.getSeasonalTrends();
      default:
        return this.getFoodTrends();
    }
  }

  // Method to get top trending keywords
  async getTopTrending(limit: number = 10): Promise<GoogleTrendsData[]> {
    const allTrends = await this.getFoodTrends();
    return allTrends
      .sort((a, b) => b.interest - a.interest)
      .slice(0, limit);
  }

  // Method to search for specific keywords
  async searchTrends(searchTerms: string[]): Promise<GoogleTrendsData[]> {
    return this.getTrendingKeywords(searchTerms);
  }
}
