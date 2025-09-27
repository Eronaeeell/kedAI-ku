interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIAnalysis {
  insights: string[];
  recommendations: string[];
  campaignStrategy: string;
  targetAudience: string;
  keyMessages: string[];
  successMetrics: string[];
}

export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      baseURL: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7,
      ...config
    };
    
    console.log('OpenAIService initialized with config:', {
      baseURL: this.config.baseURL,
      model: this.config.model,
      hasApiKey: !!this.config.apiKey
    });
  }

  async analyzeCampaignData(data: {
    weather: any[];
    trends: any[];
    googleTrends: any[];
    malaysiaGov: any[];
    socialTrends: any[];
    sales: any;
    kaggleSales: any;
    events: any[];
    prompt: string;
  }): Promise<AIAnalysis> {
    try {
      // Prepare context data for AI
      const contextData = this.prepareContextData(data);
      
      // Create AI prompt
      const aiPrompt = this.createAIPrompt(data.prompt, contextData);
      
      // Call OpenAI API
      const response = await this.callOpenAI(aiPrompt);
      
      // Parse AI response
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error analyzing campaign data with OpenAI:', error);
      // Fallback to mock analysis
      return this.getMockAnalysis(data);
    }
  }

  private prepareContextData(data: any): string {
    const context = [];

    // Weather context
    if (data.weather && data.weather.length > 0) {
      const avgTemp = data.weather.reduce((sum: number, w: any) => sum + w.temperature, 0) / data.weather.length;
      const conditions = [...new Set(data.weather.map((w: any) => w.condition))];
      context.push(`Weather: Average temperature ${avgTemp.toFixed(1)}°C, conditions: ${conditions.join(', ')}`);
    }

    // Trends context
    if (data.googleTrends && data.googleTrends.length > 0) {
      const topTrends = data.googleTrends.slice(0, 5).map((t: any) => t.keyword);
      context.push(`Google Trends: ${topTrends.join(', ')}`);
    }

    // Sales context
    if (data.kaggleSales && data.kaggleSales.salesAnalysis) {
      const sales = data.kaggleSales.salesAnalysis;
      context.push(`Sales Performance: RM${sales.totalRevenue.toLocaleString()} revenue, ${sales.totalTransactions} transactions, AOV RM${sales.averageOrderValue}`);
      
      if (sales.topCategories.length > 0) {
        const topCategory = sales.topCategories[0];
        context.push(`Top Category: ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of revenue)`);
      }
    }

    // Events context
    if (data.events && data.events.length > 0) {
      const upcomingEvents = data.events.slice(0, 3).map((e: any) => e.name);
      context.push(`Upcoming Events: ${upcomingEvents.join(', ')}`);
    }

    // Malaysia Government data
    if (data.malaysiaGov && data.malaysiaGov.length > 0) {
      const highRelevanceData = data.malaysiaGov.filter((d: any) => d.relevanceScore > 80);
      if (highRelevanceData.length > 0) {
        const categories = [...new Set(highRelevanceData.map((d: any) => d.category))];
        context.push(`Malaysian Data: ${categories.join(', ')} trends from government sources`);
      }
    }

    return context.join('\n');
  }

  private createAIPrompt(userPrompt: string, contextData: string): string {
    return `You are an expert AI Campaign Planner specializing in Malaysian food and beverage businesses. 

User's Campaign Request: "${userPrompt}"

Context Data:
${contextData}

Please analyze this data and provide a comprehensive campaign strategy. Focus on:

1. Key Insights: What are the most important trends and data points for this campaign?
2. Recommendations: Specific actionable recommendations for the campaign
3. Campaign Strategy: Overall approach and positioning
4. Target Audience: Who should this campaign target based on the data?
5. Key Messages: What are the main messages to communicate?
6. Success Metrics: How to measure campaign success?

Please provide your analysis in a structured format that can be easily parsed. Be specific about Malaysian market context and food/beverage industry insights.`;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    try {
      console.log('Calling OpenRouter API with model:', this.config.model);
      console.log('API Key present:', !!this.config.apiKey);
      
      const response = await fetch(this.config.baseURL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'kedAI-ku Campaign Planner'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI campaign strategist specializing in Malaysian market analysis. Analyze the provided data and generate actionable insights and recommendations for campaign planning.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      console.log('OpenRouter response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error response:', errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenRouter API success, response received');
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      console.log('Falling back to mock response');
      return this.getMockAIResponse(prompt);
    }
  }

  private parseAIResponse(response: string): AIAnalysis {
    // Parse the AI response into structured format
    // This is a simplified parser - in production, you'd want more robust parsing
    const lines = response.split('\n');
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    let campaignStrategy = '';
    let targetAudience = '';
    const keyMessages: string[] = [];
    const successMetrics: string[] = [];

    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('Key Insights:') || trimmedLine.includes('Insights:')) {
        currentSection = 'insights';
        continue;
      } else if (trimmedLine.includes('Recommendations:') || trimmedLine.includes('Recommendations')) {
        currentSection = 'recommendations';
        continue;
      } else if (trimmedLine.includes('Campaign Strategy:') || trimmedLine.includes('Strategy:')) {
        currentSection = 'strategy';
        continue;
      } else if (trimmedLine.includes('Target Audience:') || trimmedLine.includes('Audience:')) {
        currentSection = 'audience';
        continue;
      } else if (trimmedLine.includes('Key Messages:') || trimmedLine.includes('Messages:')) {
        currentSection = 'messages';
        continue;
      } else if (trimmedLine.includes('Success Metrics:') || trimmedLine.includes('Metrics:')) {
        currentSection = 'metrics';
        continue;
      }

      if (trimmedLine && !trimmedLine.startsWith('#')) {
        if (currentSection === 'insights') {
          insights.push(trimmedLine.replace(/^[-•]\s*/, ''));
        } else if (currentSection === 'recommendations') {
          recommendations.push(trimmedLine.replace(/^[-•]\s*/, ''));
        } else if (currentSection === 'strategy') {
          campaignStrategy += trimmedLine + ' ';
        } else if (currentSection === 'audience') {
          targetAudience += trimmedLine + ' ';
        } else if (currentSection === 'messages') {
          keyMessages.push(trimmedLine.replace(/^[-•]\s*/, ''));
        } else if (currentSection === 'metrics') {
          successMetrics.push(trimmedLine.replace(/^[-•]\s*/, ''));
        }
      }
    }

    return {
      insights: insights.filter(i => i.length > 0),
      recommendations: recommendations.filter(r => r.length > 0),
      campaignStrategy: campaignStrategy.trim(),
      targetAudience: targetAudience.trim(),
      keyMessages: keyMessages.filter(m => m.length > 0),
      successMetrics: successMetrics.filter(m => m.length > 0)
    };
  }

  private getMockAIResponse(prompt: string): string {
    return `# AI Campaign Analysis

## Key Insights:
- Weather patterns show seasonal trends affecting beverage preferences
- Google Trends indicate strong interest in local Malaysian cuisine
- Sales data reveals high-performing product categories
- Upcoming events provide opportunities for themed campaigns
- Government data shows positive economic indicators

## Recommendations:
- Focus on seasonal menu items based on weather patterns
- Leverage trending Malaysian food keywords in marketing
- Target high-performing product categories for promotion
- Create event-themed campaigns for upcoming festivals
- Use demographic data to refine target audience

## Campaign Strategy:
Develop a multi-channel campaign that combines seasonal trends with local cultural events, targeting specific demographic segments identified in the sales data.

## Target Audience:
Young adults (18-35) with interest in local cuisine and seasonal trends, based on demographic analysis and trend data.

## Key Messages:
- Authentic Malaysian flavors with modern presentation
- Seasonal ingredients and weather-appropriate offerings
- Limited-time event-themed specials
- Quality and value proposition

## Success Metrics:
- 20% increase in sales for targeted categories
- 15% growth in customer engagement
- 25% improvement in seasonal product performance
- 30% increase in event-themed campaign participation`;
  }

  private getMockAnalysis(data: any): AIAnalysis {
    return {
      insights: [
        'Weather patterns indicate seasonal beverage preferences',
        'Google Trends show strong interest in local Malaysian cuisine',
        'Sales data reveals high-performing product categories',
        'Upcoming events provide campaign opportunities'
      ],
      recommendations: [
        'Focus on seasonal menu items based on weather',
        'Leverage trending keywords in marketing',
        'Target high-performing categories',
        'Create event-themed campaigns'
      ],
      campaignStrategy: 'Develop a multi-channel campaign combining seasonal trends with local cultural events',
      targetAudience: 'Young adults (18-35) interested in local cuisine and seasonal trends',
      keyMessages: [
        'Authentic Malaysian flavors with modern presentation',
        'Seasonal ingredients and weather-appropriate offerings',
        'Limited-time event-themed specials'
      ],
      successMetrics: [
        '20% increase in targeted category sales',
        '15% growth in customer engagement',
        '25% improvement in seasonal performance'
      ]
    };
  }
}
