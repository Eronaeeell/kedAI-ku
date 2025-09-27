import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface LinkedInTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
}

async function getStoredTokens(): Promise<LinkedInTokens | null> {
  try {
    const tokensPath = path.join(process.cwd(), 'linkedin_tokens.json');
    const data = await fs.readFile(tokensPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function saveTokens(tokens: LinkedInTokens): Promise<void> {
  const tokensPath = path.join(process.cwd(), 'linkedin_tokens.json');
  await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
}

export async function GET() {
  try {
    const tokens = await getStoredTokens();
    
    if (!tokens) {
      return NextResponse.json({ valid: false, error: 'No tokens found' }, { status: 404 });
    }

    const now = Date.now();
    const valid = tokens.expires_at > now;

    return NextResponse.json({ 
      valid,
      expires_at: tokens.expires_at,
      expires_in: Math.max(0, Math.floor((tokens.expires_at - now) / 1000))
    });
  } catch (error) {
    console.error('Error checking LinkedIn tokens:', error);
    return NextResponse.json({ valid: false, error: 'Failed to check tokens' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const tokens = await getStoredTokens();
    
    if (!tokens || !tokens.refresh_token) {
      return NextResponse.json({ 
        success: false, 
        error: 'No refresh token available. Please re-authorize the application.' 
      }, { status: 400 });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn credentials not configured' 
      }, { status: 500 });
    }

    // Note: LinkedIn doesn't currently provide refresh tokens in their OAuth 2.0 flow
    // This is a limitation of LinkedIn's API. Access tokens typically last 60 days.
    return NextResponse.json({
      success: false,
      error: 'LinkedIn does not support refresh tokens. Please re-authorize the application when the access token expires.'
    }, { status: 400 });

  } catch (error) {
    console.error('Error refreshing LinkedIn tokens:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to refresh tokens' 
    }, { status: 500 });
  }
}