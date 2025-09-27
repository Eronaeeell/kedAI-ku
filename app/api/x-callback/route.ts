import { NextRequest, NextResponse } from 'next/server';
import { XTokenManager } from '@/lib/x-tokens';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json(
        { error: `Authorization failed: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is missing' },
        { status: 400 }
      );
    }

    // In a real app, you'd retrieve the codeVerifier from secure storage
    // For now, we'll expect it as a query parameter (not recommended for production)
    const codeVerifier = searchParams.get('code_verifier');
    
    if (!codeVerifier) {
      return NextResponse.json(
        { error: 'Code verifier is missing. Please restart the authorization process.' },
        { status: 400 }
      );
    }

    try {
      const tokens = await XTokenManager.exchangeCodeForTokens(code, codeVerifier);
      
      // In a real app, you'd store these tokens securely
      console.log('Tokens received:', {
        access_token: tokens.access_token.substring(0, 20) + '...',
        refresh_token: tokens.refresh_token?.substring(0, 20) + '...',
        expires_at: tokens.expires_at ? new Date(tokens.expires_at).toISOString() : 'N/A'
      });

      return NextResponse.json({
        success: true,
        message: 'Authorization successful! Tokens have been received.',
        expires_at: tokens.expires_at
      });

    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError);
      return NextResponse.json(
        { error: `Token exchange failed: ${tokenError}` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Callback handling error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Callback processing failed' 
      },
      { status: 500 }
    );
  }
}