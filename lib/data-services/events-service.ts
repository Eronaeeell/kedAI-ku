interface EventData {
  id: string;
  name: string;
  date: string;
  type: 'festival' | 'holiday' | 'local_event' | 'seasonal';
  location: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'food' | 'beverage' | 'general' | 'cultural';
  relatedKeywords: string[];
}

interface EventsServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  region: string;
}

export class EventsService {
  private config: EventsServiceConfig;

  constructor(config: EventsServiceConfig) {
    this.config = config;
  }

  async getUpcomingEvents(days: number = 30): Promise<EventData[]> {
    try {
      // Try to fetch from API first, fallback to mock data
      if (this.config.apiKey) {
        return await this.getAPIEvents(days);
      } else {
        return this.getMockEvents(days);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      return this.getMockEvents(days);
    }
  }

  async getEventsByCategory(category: string, days: number = 30): Promise<EventData[]> {
    const allEvents = await this.getUpcomingEvents(days);
    return allEvents.filter(event => event.category === category);
  }

  async getHighImpactEvents(days: number = 30): Promise<EventData[]> {
    const allEvents = await this.getUpcomingEvents(days);
    return allEvents.filter(event => event.impact === 'high');
  }

  private async getAPIEvents(days: number): Promise<EventData[]> {
    // This would integrate with Eventbrite, Facebook Events, or other event APIs
    // For now, return mock data
    return this.getMockEvents(days);
  }

  private getMockEvents(days: number): EventData[] {
    const events: EventData[] = [];
    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    // Malaysian festivals and holidays
    const malaysianEvents = [
      {
        name: 'Hari Raya Aidilfitri',
        date: '2024-04-10',
        type: 'festival' as const,
        impact: 'high' as const,
        category: 'cultural' as const,
        description: 'End of Ramadan celebration',
        relatedKeywords: ['traditional food', 'ketupat', 'lemang', 'family gathering']
      },
      {
        name: 'Chinese New Year',
        date: '2024-02-10',
        type: 'festival' as const,
        impact: 'high' as const,
        category: 'cultural' as const,
        description: 'Lunar New Year celebration',
        relatedKeywords: ['yee sang', 'mandarin oranges', 'red packets', 'reunion dinner']
      },
      {
        name: 'Deepavali',
        date: '2024-11-01',
        type: 'festival' as const,
        impact: 'high' as const,
        category: 'cultural' as const,
        description: 'Festival of Lights',
        relatedKeywords: ['murukku', 'sweets', 'oil lamps', 'new clothes']
      },
      {
        name: 'Christmas',
        date: '2024-12-25',
        type: 'holiday' as const,
        impact: 'high' as const,
        category: 'general' as const,
        description: 'Christmas celebration',
        relatedKeywords: ['christmas cake', 'hot chocolate', 'gift giving', 'decorations']
      },
      {
        name: 'New Year',
        date: '2025-01-01',
        type: 'holiday' as const,
        impact: 'medium' as const,
        category: 'general' as const,
        description: 'New Year celebration',
        relatedKeywords: ['resolution', 'celebration', 'party', 'countdown']
      }
    ];

    // Add Malaysian events
    malaysianEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= currentDate && eventDate <= endDate) {
        events.push({
          id: `malaysia-${event.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: event.name,
          date: event.date,
          type: event.type,
          location: 'Malaysia',
          description: event.description,
          impact: event.impact,
          category: event.category,
          relatedKeywords: event.relatedKeywords
        });
      }
    });

    // Add seasonal events
    const month = currentDate.getMonth() + 1;
    if (month >= 3 && month <= 5) {
      events.push({
        id: 'spring-season',
        name: 'Spring Season',
        date: currentDate.toISOString().split('T')[0],
        type: 'seasonal',
        location: 'Malaysia',
        description: 'Spring season with fresh ingredients',
        impact: 'medium',
        category: 'food',
        relatedKeywords: ['fresh vegetables', 'light meals', 'spring menu', 'healthy options']
      });
    }

    if (month >= 6 && month <= 8) {
      events.push({
        id: 'summer-season',
        name: 'Summer Season',
        date: currentDate.toISOString().split('T')[0],
        type: 'seasonal',
        location: 'Malaysia',
        description: 'Hot summer season',
        impact: 'high',
        category: 'beverage',
        relatedKeywords: ['cold drinks', 'iced beverages', 'refreshing', 'smoothies']
      });
    }

    if (month >= 9 && month <= 11) {
      events.push({
        id: 'autumn-season',
        name: 'Autumn Season',
        date: currentDate.toISOString().split('T')[0],
        type: 'seasonal',
        location: 'Malaysia',
        description: 'Autumn with warm flavors',
        impact: 'medium',
        category: 'beverage',
        relatedKeywords: ['pumpkin spice', 'warm drinks', 'comfort food', 'cozy atmosphere']
      });
    }

    if (month === 12 || month === 1 || month === 2) {
      events.push({
        id: 'winter-season',
        name: 'Winter Season',
        date: currentDate.toISOString().split('T')[0],
        type: 'seasonal',
        location: 'Malaysia',
        description: 'Cooler weather season',
        impact: 'medium',
        category: 'beverage',
        relatedKeywords: ['hot drinks', 'warm beverages', 'comfort food', 'cozy drinks']
      });
    }

    // Add local events (mock)
    const localEvents = [
      {
        name: 'KL Food Festival',
        date: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'local_event',
        impact: 'high',
        category: 'food',
        description: 'Annual food festival in Kuala Lumpur',
        relatedKeywords: ['street food', 'local cuisine', 'food trucks', 'culinary experience']
      },
      {
        name: 'Coffee Week',
        date: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'local_event',
        impact: 'high',
        category: 'beverage',
        description: 'Week-long coffee celebration',
        relatedKeywords: ['specialty coffee', 'coffee tasting', 'barista competition', 'coffee culture']
      },
      {
        name: 'Artisan Market',
        date: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'local_event',
        impact: 'medium',
        category: 'general',
        description: 'Monthly artisan market',
        relatedKeywords: ['handmade', 'local products', 'artisan food', 'unique items']
      }
    ];

    localEvents.forEach(event => {
      events.push({
        id: `local-${event.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: event.name,
        date: event.date,
        type: event.type,
        location: 'Kuala Lumpur',
        description: event.description,
        impact: event.impact,
        category: event.category,
        relatedKeywords: event.relatedKeywords
      });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

// Campaign type service
export class CampaignTypeService {
  static getCampaignTypes(): Array<{
    id: string;
    name: string;
    description: string;
    category: 'discount' | 'promotion' | 'seasonal' | 'event_based';
    effectiveness: 'high' | 'medium' | 'low';
    keywords: string[];
  }> {
    return [
      {
        id: 'buy-one-get-one',
        name: 'Buy 1 Get 1',
        description: 'Buy one item, get another free',
        category: 'discount',
        effectiveness: 'high',
        keywords: ['bogo', 'buy one get one', 'free item', 'discount']
      },
      {
        id: 'free-upsize',
        name: 'Free Upsize',
        description: 'Free size upgrade for beverages',
        category: 'promotion',
        effectiveness: 'high',
        keywords: ['upsize', 'free upgrade', 'larger size', 'value']
      },
      {
        id: 'happy-hour',
        name: 'Happy Hour',
        description: 'Discounted prices during specific hours',
        category: 'promotion',
        effectiveness: 'medium',
        keywords: ['happy hour', 'time-based', 'discount hours', 'rush hour']
      },
      {
        id: 'seasonal-special',
        name: 'Seasonal Special',
        description: 'Limited-time seasonal menu items',
        category: 'seasonal',
        effectiveness: 'high',
        keywords: ['seasonal', 'limited time', 'special menu', 'exclusive']
      },
      {
        id: 'loyalty-program',
        name: 'Loyalty Program',
        description: 'Points-based rewards system',
        category: 'promotion',
        effectiveness: 'high',
        keywords: ['loyalty', 'points', 'rewards', 'member benefits']
      },
      {
        id: 'event-themed',
        name: 'Event Themed',
        description: 'Campaigns tied to specific events or festivals',
        category: 'event_based',
        effectiveness: 'high',
        keywords: ['festival', 'event', 'themed', 'celebration']
      }
    ];
  }

  static getRecommendedCampaignTypes(events: EventData[], trends: string[]): Array<{
    campaignType: any;
    relevanceScore: number;
    reason: string;
  }> {
    const campaignTypes = this.getCampaignTypes();
    const recommendations = [];

    for (const campaignType of campaignTypes) {
      let relevanceScore = 0;
      let reasons = [];

      // Check event relevance
      for (const event of events) {
        if (event.impact === 'high') {
          relevanceScore += 30;
          reasons.push(`High impact event: ${event.name}`);
        }
      }

      // Check trend relevance
      for (const trend of trends) {
        if (campaignType.keywords.some(keyword => 
          trend.toLowerCase().includes(keyword.toLowerCase())
        )) {
          relevanceScore += 20;
          reasons.push(`Trending keyword: ${trend}`);
        }
      }

      // Category-specific scoring
      if (campaignType.category === 'event_based' && events.length > 0) {
        relevanceScore += 25;
        reasons.push('Event-based campaign suitable for upcoming events');
      }

      if (campaignType.category === 'seasonal') {
        relevanceScore += 15;
        reasons.push('Seasonal campaign for current season');
      }

      if (relevanceScore > 0) {
        recommendations.push({
          campaignType,
          relevanceScore,
          reason: reasons.join('; ')
        });
      }
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
