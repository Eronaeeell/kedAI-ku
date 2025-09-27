// lib/x-tokens.ts
import crypto from 'crypto';

export interface XTokens {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  scope?: string;
}

export interface XAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
}

export class XTokenManager {
  private static tokens: XTokens | null = null;
  
  static getConfig(): XAuthConfig {
    return {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET || undefined,
      redirectUri: process.env.X_REDIRECT_URI || 'http://127.0.0.1:3000/api/x-callback',
      scope: 'tweet.write tweet.read users.read offline.access'
    };
  }

  static generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    
    return {
      codeVerifier,
      codeChallenge
    };
  }

  static generateAuthUrl(codeChallenge: string): string {
    const config = this.getConfig();
    const state = crypto.randomBytes(16).toString('hex');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return `https://x.com/i/oauth2/authorize?${params.toString()}`;
  }

  static async exchangeCodeForTokens(
    code: string, 
    codeVerifier: string
  ): Promise<XTokens> {
    const config = this.getConfig();
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Use Basic Auth if client secret is available (confidential client)
    if (config.clientSecret) {
      const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else {
      // Public client - include client_id in body
      body.set('client_id', config.clientId);
    }

    const response = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokens: XTokens = await response.json();
    
    // Calculate expiry time
    if (tokens.expires_in) {
      tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
    }

    this.tokens = tokens;
    return tokens;
  }

  static async refreshAccessToken(refreshToken?: string): Promise<XTokens> {
    const config = this.getConfig();
    const tokenToUse = refreshToken || process.env.TWITTER_REFRESH_TOKEN || this.tokens?.refresh_token;
    
    if (!tokenToUse) {
      throw new Error('No refresh token available');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenToUse
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Use Basic Auth if client secret is available
    if (config.clientSecret) {
      const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else {
      body.set('client_id', config.clientId);
    }

    const response = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const newTokens: XTokens = await response.json();
    
    // Calculate expiry time
    if (newTokens.expires_in) {
      newTokens.expires_at = Date.now() + (newTokens.expires_in * 1000);
    }

    this.tokens = newTokens;
    return newTokens;
  }

  static async getValidAccessToken(): Promise<string> {
    // Check if we have tokens and they're still valid
    if (this.tokens?.access_token && this.tokens.expires_at) {
      if (Date.now() < this.tokens.expires_at - 60000) { // 1 minute buffer
        return this.tokens.access_token;
      }
    }

    // Try to refresh tokens
    try {
      const newTokens = await this.refreshAccessToken();
      return newTokens.access_token;
    } catch (error) {
      throw new Error(`Unable to get valid access token: ${error}`);
    }
  }

  static setTokens(tokens: XTokens) {
    this.tokens = tokens;
  }

  static getStoredTokens(): XTokens | null {
    return this.tokens;
  }
}