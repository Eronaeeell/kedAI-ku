interface MalaysiaGovData {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  data: any;
  lastUpdated: string;
  relevanceScore: number;
}

interface MalaysiaGovConfig {
  baseUrl: string;
  apiKey?: string;
}

export class MalaysiaGovService {
  private config: MalaysiaGovConfig;

  constructor(apiKey?: string) {
    this.config = {
      baseUrl: 'https://api.data.gov.my',
      apiKey
    };
  }

  async getEconomicData(): Promise<MalaysiaGovData[]> {
    try {
      // Mock data for Malaysian economic indicators
      return [
        {
          id: 'gdp-growth',
          title: 'GDP Growth Rate',
          description: 'Malaysia GDP growth rate for current quarter',
          category: 'economic',
          source: 'Department of Statistics Malaysia',
          data: {
            value: 4.2,
            unit: 'percent',
            period: 'Q3 2024',
            trend: 'increasing'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 85
        },
        {
          id: 'inflation-rate',
          title: 'Inflation Rate',
          description: 'Consumer Price Index inflation rate',
          category: 'economic',
          source: 'Bank Negara Malaysia',
          data: {
            value: 2.1,
            unit: 'percent',
            period: 'October 2024',
            trend: 'stable'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 80
        },
        {
          id: 'unemployment-rate',
          title: 'Unemployment Rate',
          description: 'National unemployment rate',
          category: 'economic',
          source: 'Department of Statistics Malaysia',
          data: {
            value: 3.4,
            unit: 'percent',
            period: 'September 2024',
            trend: 'decreasing'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 75
        }
      ];
    } catch (error) {
      console.error('Error fetching economic data:', error);
      return [];
    }
  }

  async getDemographicData(): Promise<MalaysiaGovData[]> {
    try {
      return [
        {
          id: 'population-age',
          title: 'Population by Age Group',
          description: 'Malaysian population distribution by age groups',
          category: 'demographic',
          source: 'Department of Statistics Malaysia',
          data: {
            '18-25': 15.2,
            '26-35': 18.7,
            '36-45': 16.8,
            '46-55': 14.3,
            '55+': 35.0,
            unit: 'percent'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 90
        },
        {
          id: 'urban-rural',
          title: 'Urban vs Rural Population',
          description: 'Population distribution between urban and rural areas',
          category: 'demographic',
          source: 'Department of Statistics Malaysia',
          data: {
            urban: 75.1,
            rural: 24.9,
            unit: 'percent'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 85
        },
        {
          id: 'income-distribution',
          title: 'Household Income Distribution',
          description: 'Average household income by state',
          category: 'demographic',
          source: 'Department of Statistics Malaysia',
          data: {
            'Kuala Lumpur': 8500,
            'Selangor': 7200,
            'Penang': 6800,
            'Johor': 6500,
            'Perak': 4200,
            unit: 'MYR per month'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 88
        }
      ];
    } catch (error) {
      console.error('Error fetching demographic data:', error);
      return [];
    }
  }

  async getBusinessData(): Promise<MalaysiaGovData[]> {
    try {
      return [
        {
          id: 'f&b-sector',
          title: 'Food & Beverage Sector Growth',
          description: 'F&B sector growth rate and market size',
          category: 'business',
          source: 'Malaysian Investment Development Authority',
          data: {
            growthRate: 6.8,
            marketSize: 45.2,
            unit: 'billion MYR',
            period: '2024',
            trend: 'growing'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 95
        },
        {
          id: 'tourism-data',
          title: 'Tourism Statistics',
          description: 'Tourist arrivals and spending patterns',
          category: 'business',
          source: 'Tourism Malaysia',
          data: {
            arrivals: 12.5,
            spending: 8.2,
            unit: 'million visitors / billion MYR',
            period: 'Q3 2024',
            trend: 'increasing'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 82
        },
        {
          id: 'retail-sales',
          title: 'Retail Sales Index',
          description: 'Retail sales performance by category',
          category: 'business',
          source: 'Department of Statistics Malaysia',
          data: {
            'Food & Beverages': 8.5,
            'Clothing': 3.2,
            'Electronics': 5.8,
            'Home & Garden': 4.1,
            unit: 'percent growth',
            period: 'September 2024'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 90
        }
      ];
    } catch (error) {
      console.error('Error fetching business data:', error);
      return [];
    }
  }

  async getHealthData(): Promise<MalaysiaGovData[]> {
    try {
      return [
        {
          id: 'health-trends',
          title: 'Public Health Trends',
          description: 'Health awareness and wellness trends',
          category: 'health',
          source: 'Ministry of Health Malaysia',
          data: {
            'Healthy eating awareness': 78.5,
            'Exercise frequency': 65.2,
            'Mental health awareness': 72.8,
            'Organic food consumption': 45.3,
            unit: 'percent of population'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 85
        },
        {
          id: 'dietary-patterns',
          title: 'Dietary Patterns',
          description: 'Changing dietary preferences and habits',
          category: 'health',
          source: 'Ministry of Health Malaysia',
          data: {
            'Plant-based diet interest': 35.2,
            'Low-sugar preference': 68.7,
            'Local cuisine preference': 82.1,
            'Health food spending': 12.5,
            unit: 'percent / billion MYR'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 88
        }
      ];
    } catch (error) {
      console.error('Error fetching health data:', error);
      return [];
    }
  }

  async getWeatherData(): Promise<MalaysiaGovData[]> {
    try {
      return [
        {
          id: 'weather-patterns',
          title: 'Malaysian Weather Patterns',
          description: 'Seasonal weather patterns and climate data',
          category: 'weather',
          source: 'Malaysian Meteorological Department',
          data: {
            'Rainy season intensity': 'High',
            'Temperature range': '24-32°C',
            'Humidity average': '85%',
            'Monsoon period': 'October-March',
            'UV index': 'High'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 92
        },
        {
          id: 'climate-impact',
          title: 'Climate Impact on Business',
          description: 'How weather affects business operations',
          category: 'weather',
          source: 'Malaysian Meteorological Department',
          data: {
            'Outdoor dining impact': 'Seasonal',
            'Beverage preferences': 'Cold drinks in hot weather',
            'Food spoilage risk': 'High humidity',
            'Delivery challenges': 'Rainy season'
          },
          lastUpdated: new Date().toISOString(),
          relevanceScore: 87
        }
      ];
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  }

  async getAllData(): Promise<MalaysiaGovData[]> {
    try {
      const [economic, demographic, business, health, weather] = await Promise.all([
        this.getEconomicData(),
        this.getDemographicData(),
        this.getBusinessData(),
        this.getHealthData(),
        this.getWeatherData()
      ]);

      return [...economic, ...demographic, ...business, ...health, ...weather];
    } catch (error) {
      console.error('Error fetching all Malaysia government data:', error);
      return [];
    }
  }

  async getDataByCategory(category: string): Promise<MalaysiaGovData[]> {
    switch (category.toLowerCase()) {
      case 'economic':
        return this.getEconomicData();
      case 'demographic':
        return this.getDemographicData();
      case 'business':
        return this.getBusinessData();
      case 'health':
        return this.getHealthData();
      case 'weather':
        return this.getWeatherData();
      default:
        return this.getAllData();
    }
  }

  async getRelevantData(keywords: string[]): Promise<MalaysiaGovData[]> {
    const allData = await this.getAllData();
    
    return allData.filter(item => {
      const searchText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
      return keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });
  }
}
