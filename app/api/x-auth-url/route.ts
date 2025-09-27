import { NextRequest, NextResponse } from 'next/server';
import { XTokenManager } from '@/lib/x-tokens';

export async function GET(request: NextRequest) {
  try {
    const { codeChallenge, codeVerifier } = XTokenManager.generatePKCE();
    const authUrl = XTokenManager.generateAuthUrl(codeChallenge);
    
    // In a real app, you'd want to store codeVerifier in a secure session/database
    // For now, we'll include it in the response (not recommended for production)
    
    return NextResponse.json({
      url: authUrl,
      codeVerifier, // Store this securely in your app
      message: 'Open the URL to authorize the app'
    });

  } catch (error) {
    console.error('Auth URL generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate auth URL' 
      },
      { status: 500 }
    );
  }
}