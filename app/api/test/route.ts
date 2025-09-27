import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      environment: {
        hasOpenRouterKey: !!openrouterKey,
        openrouterKeyLength: openrouterKey?.length || 0,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
