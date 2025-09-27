import { NextRequest, NextResponse } from 'next/server';
import { XTokenManager } from '@/lib/x-tokens';

export async function POST(request: NextRequest) {
  try {
    const newTokens = await XTokenManager.refreshAccessToken();
    
    return NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      expires_at: newTokens.expires_at
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh tokens' 
      },
      { status: 400 }
    );
  }
}