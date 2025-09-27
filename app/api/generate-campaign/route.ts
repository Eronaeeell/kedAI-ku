import { NextRequest, NextResponse } from 'next/server';
import { getCampaignGenerator } from '@/lib/api/campaign-generator';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: 'Prompt is required' },
        { status: 400 }
      );
    }

    const generator = getCampaignGenerator();
    const result = await generator.generateCampaign(prompt);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Campaign Generator API',
    endpoints: {
      POST: '/api/generate-campaign - Generate campaign based on prompt'
    }
  });
}
