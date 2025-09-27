// lib/x-service.ts
interface PostResponse {
  ok: boolean;
  tweetId?: string;
  id?: string;
  error?: string;
  text?: string;
  data?: any;
  rate?: { 
    retryAfterSec?: number | null; 
    resetEpochSec?: number | null; 
    remaining?: number | null; 
  };
  details?: any;
}

interface PostWithImageOptions {
  text: string;
  imageUrl?: string;
  imageData?: string; // base64 image data
}

interface XTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export class XService {
  private static inFlight = false;

  static async postTweet(text: string): Promise<PostResponse> {
    return this.postTweetWithImage({ text });
  }

  static async postTweetWithImage(options: PostWithImageOptions): Promise<PostResponse> {
    if (this.inFlight) {
      return { ok: false, error: "A post is already in progress. Please wait." };
    }
    
    this.inFlight = true;
    
    try {
      const response = await fetch('/api/post-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          imageUrl: options.imageUrl,
          imageData: options.imageData
        })
      });

      const result: PostResponse = await response.json().catch(() => ({ 
        ok: false, 
        error: "Invalid response from server" 
      }));

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryIn =
          result?.rate?.retryAfterSec ??
          (result?.rate?.resetEpochSec ? Math.max(0, result.rate.resetEpochSec - Math.floor(Date.now() / 1000)) : null);
        const friendly = retryIn ? `Rate-limited. Try again in ~${Math.ceil(retryIn)}s.` : "Rate-limited. Try later.";
        return { ok: false, error: friendly, rate: result.rate, details: result.details };
      }

      // If status is 200 (OK), ensure we return success
      if (response.status === 200 && response.ok) {
        return { 
          ok: true, 
          tweetId: result.tweetId || result.id || "posted",
          id: result.tweetId || result.id || "posted",
          text: result.text,
          data: result.data
        };
      }

      // For other status codes, return the error
      if (!response.ok) {
        return { 
          ok: false, 
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
          details: result 
        };
      }

      return result;
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Network error occurred"
      };
    } finally {
      this.inFlight = false;
    }
  }

  static async refreshTokens(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/x-refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to refresh tokens' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to refresh tokens" 
      };
    }
  }

  static async convertImageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      // Use our server-side proxy to avoid CORS issues
      const response = await fetch('/api/image-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process image');
      }

      return data.base64;
    } catch (error) {
      throw new Error(`Failed to convert image: ${error}`);
    }
  }

  static async getAuthUrl(): Promise<{ url?: string; error?: string }> {
    try {
      const response = await fetch('/api/x-auth-url');
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Failed to get auth URL' };
      }

      return { url: result.url };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : "Failed to get auth URL" 
      };
    }
  }
}