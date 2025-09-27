import { AICampaignProcessor } from '../data-services/ai-processor';

interface CampaignGeneratorConfig {
  weatherApiKey?: string;
  trendsApiKey?: string;
  twitterToken?: string;
  instagramToken?: string;
  openrouterApiKey?: string; // Changed to OpenRouter API key
  region: string;
}

export class CampaignGenerator {
  private processor: AICampaignProcessor;

  constructor(config: CampaignGeneratorConfig) {
    this.processor = new AICampaignProcessor({
      weatherApiKey: config.weatherApiKey,
      trendsApiKey: config.trendsApiKey,
      twitterToken: config.twitterToken,
      instagramToken: config.instagramToken,
      openrouterApiKey: config.openrouterApiKey, // Added OpenRouter API key
      region: config.region
    });
  }

  async generateCampaign(prompt: string) {
    try {
      const analysis = await this.processor.processCampaignData(prompt);
      
      return {
        success: true,
        data: analysis,
        message: 'Campaign generated successfully'
      };
    } catch (error) {
      console.error('Error generating campaign:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to generate campaign',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCampaignComponents(prompt: string) {
    try {
      const analysis = await this.processor.processCampaignData(prompt);
      
      return {
        success: true,
        components: analysis.components,
        insights: analysis.insights,
        recommendations: analysis.recommendations
      };
    } catch (error) {
      console.error('Error getting campaign components:', error);
      return {
        success: false,
        components: [],
        insights: [],
        recommendations: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance for easy use
let campaignGenerator: CampaignGenerator | null = null;

export function getCampaignGenerator(): CampaignGenerator {
  if (!campaignGenerator) {
    campaignGenerator = new CampaignGenerator({
      weatherApiKey: process.env.OPENWEATHER_API_KEY,
      trendsApiKey: process.env.GOOGLE_TRENDS_API_KEY,
      twitterToken: process.env.TWITTER_BEARER_TOKEN,
      instagramToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      openrouterApiKey: process.env.OPENROUTER_API_KEY, // Changed to OpenRouter API key
      region: 'Malaysia'
    });
  }
  return campaignGenerator;
}
