interface SalesData {
  month: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  categories: {
    beverages: {
      coffee: number;
      tea: number;
      smoothies: number;
      other: number;
    };
    food: {
      pastries: number;
      sandwiches: number;
      salads: number;
      other: number;
    };
  };
  topItems: Array<{
    name: string;
    sales: number;
    revenue: number;
    category: string;
  }>;
  weatherCorrelation?: {
    temperature: number;
    humidity: number;
    condition: string;
  };
  trendsCorrelation?: {
    trendingKeywords: string[];
    socialMediaMentions: number;
  };
}

interface SalesServiceConfig {
  dataSource: 'mock' | 'api' | 'database';
  apiKey?: string;
  databaseUrl?: string;
}

export class SalesService {
  private config: SalesServiceConfig;

  constructor(config: SalesServiceConfig) {
    this.config = config;
  }

  async getSalesData(month: string): Promise<SalesData> {
    switch (this.config.dataSource) {
      case 'mock':
        return this.getMockSalesData(month);
      case 'api':
        return this.getAPISalesData(month);
      case 'database':
        return this.getDatabaseSalesData(month);
      default:
        return this.getMockSalesData(month);
    }
  }

  async getSalesHistory(months: number = 12): Promise<SalesData[]> {
    const history: SalesData[] = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthString = targetDate.toISOString().slice(0, 7); // YYYY-MM format
      const salesData = await this.getSalesData(monthString);
      history.push(salesData);
    }

    return history;
  }

  async getTopPerformingItems(month: string, limit: number = 10): Promise<SalesData['topItems']> {
    const salesData = await this.getSalesData(month);
    return salesData.topItems.slice(0, limit);
  }

  async getCategoryPerformance(month: string): Promise<SalesData['categories']> {
    const salesData = await this.getSalesData(month);
    return salesData.categories;
  }

  private async getMockSalesData(month: string): Promise<SalesData> {
    // Generate realistic mock data based on month and season
    const monthNum = parseInt(month.split('-')[1]);
    const isRainySeason = monthNum >= 10 || monthNum <= 3; // Oct-Mar in Malaysia
    const isFestivalSeason = monthNum === 12 || monthNum === 1 || monthNum === 2; // Dec-Feb festivals

    // Base revenue with seasonal adjustments
    let baseRevenue = 45000;
    if (isFestivalSeason) baseRevenue *= 1.3; // 30% increase during festivals
    if (isRainySeason) baseRevenue *= 0.9; // 10% decrease during rainy season

    // Add some randomness
    const revenueVariation = 0.8 + Math.random() * 0.4; // ±20% variation
    const totalRevenue = Math.round(baseRevenue * revenueVariation);
    const totalOrders = Math.round(totalRevenue / (25 + Math.random() * 10)); // AOV between 25-35

    // Generate category data
    const beverageRatio = isRainySeason ? 0.6 : 0.7; // More hot drinks in rainy season
    const beverageRevenue = Math.round(totalRevenue * beverageRatio);
    const foodRevenue = totalRevenue - beverageRevenue;

    const coffeeRatio = isRainySeason ? 0.5 : 0.4; // More coffee in rainy season
    const teaRatio = isRainySeason ? 0.3 : 0.4; // More tea in hot season

    const categories = {
      beverages: {
        coffee: Math.round(beverageRevenue * coffeeRatio),
        tea: Math.round(beverageRevenue * teaRatio),
        smoothies: Math.round(beverageRevenue * 0.15),
        other: beverageRevenue - Math.round(beverageRevenue * (coffeeRatio + teaRatio + 0.15))
      },
      food: {
        pastries: Math.round(foodRevenue * 0.4),
        sandwiches: Math.round(foodRevenue * 0.35),
        salads: Math.round(foodRevenue * 0.15),
        other: foodRevenue - Math.round(foodRevenue * 0.9)
      }
    };

    // Generate top items
    const topItems = this.generateTopItems(categories, isRainySeason, isFestivalSeason);

    return {
      month,
      totalRevenue,
      totalOrders,
      averageOrderValue: Math.round(totalRevenue / totalOrders),
      categories,
      topItems,
      weatherCorrelation: {
        temperature: isRainySeason ? 25 + Math.random() * 5 : 28 + Math.random() * 7,
        humidity: isRainySeason ? 80 + Math.random() * 15 : 70 + Math.random() * 20,
        condition: isRainySeason ? 'Rainy' : 'Sunny'
      },
      trendsCorrelation: {
        trendingKeywords: this.getTrendingKeywords(month),
        socialMediaMentions: Math.floor(Math.random() * 1000) + 100
      }
    };
  }

  private generateTopItems(categories: SalesData['categories'], isRainySeason: boolean, isFestivalSeason: boolean): SalesData['topItems'] {
    const items = [];

    // Coffee items
    if (isRainySeason) {
      items.push(
        { name: 'Hot Latte', sales: 450, revenue: 2250, category: 'beverages' },
        { name: 'Cappuccino', sales: 380, revenue: 1900, category: 'beverages' },
        { name: 'Americano', sales: 320, revenue: 1600, category: 'beverages' }
      );
    } else {
      items.push(
        { name: 'Iced Latte', sales: 520, revenue: 2600, category: 'beverages' },
        { name: 'Cold Brew', sales: 450, revenue: 2250, category: 'beverages' },
        { name: 'Iced Americano', sales: 380, revenue: 1900, category: 'beverages' }
      );
    }

    // Tea items
    if (isRainySeason) {
      items.push(
        { name: 'Hot Matcha Latte', sales: 400, revenue: 2000, category: 'beverages' },
        { name: 'Chai Latte', sales: 350, revenue: 1750, category: 'beverages' }
      );
    } else {
      items.push(
        { name: 'Iced Matcha Latte', sales: 480, revenue: 2400, category: 'beverages' },
        { name: 'Bubble Tea', sales: 420, revenue: 2100, category: 'beverages' }
      );
    }

    // Food items
    items.push(
      { name: 'Chocolate Croissant', sales: 320, revenue: 1600, category: 'food' },
      { name: 'Avocado Toast', sales: 280, revenue: 1400, category: 'food' },
      { name: 'Chicken Sandwich', sales: 250, revenue: 1250, category: 'food' }
    );

    // Festival specials
    if (isFestivalSeason) {
      items.push(
        { name: 'Festival Special Drink', sales: 300, revenue: 1500, category: 'beverages' },
        { name: 'Holiday Pastry', sales: 200, revenue: 1000, category: 'food' }
      );
    }

    return items.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  private getTrendingKeywords(month: string): string[] {
    const monthNum = parseInt(month.split('-')[1]);
    const keywords = [];

    if (monthNum === 12 || monthNum === 1) {
      keywords.push('holiday drinks', 'festive menu', 'christmas special');
    } else if (monthNum >= 3 && monthNum <= 5) {
      keywords.push('spring menu', 'fresh ingredients', 'light meals');
    } else if (monthNum >= 6 && monthNum <= 8) {
      keywords.push('summer drinks', 'cold beverages', 'refreshing');
    } else if (monthNum >= 9 && monthNum <= 11) {
      keywords.push('autumn flavors', 'pumpkin spice', 'warm drinks');
    }

    // Add some general trending keywords
    keywords.push('artisanal coffee', 'plant based', 'sustainable', 'local ingredients');

    return keywords;
  }

  private async getAPISalesData(month: string): Promise<SalesData> {
    // This would integrate with your actual sales API
    // For now, return mock data
    return this.getMockSalesData(month);
  }

  private async getDatabaseSalesData(month: string): Promise<SalesData> {
    // This would query your database
    // For now, return mock data
    return this.getMockSalesData(month);
  }
}

// Mock data generator for testing
export class MockSalesDataGenerator {
  static generateSalesData(month: string): SalesData {
    const service = new SalesService({ dataSource: 'mock' });
    return service.getMockSalesData(month);
  }

  static generateSalesHistory(months: number = 12): SalesData[] {
    const service = new SalesService({ dataSource: 'mock' });
    return service.getSalesHistory(months);
  }
}
