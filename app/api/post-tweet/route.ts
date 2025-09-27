import { NextRequest, NextResponse } from 'next/server';
import { XTokenManager } from '@/lib/x-tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageUrl, imageData } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { ok: false, error: 'Tweet text exceeds 280 characters' },
        { status: 400 }
      );
    }

    // Get valid access token (will refresh if needed)
    let accessToken: string;
    try {
      accessToken = await XTokenManager.getValidAccessToken();
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: 'Authentication failed. Please re-authorize the app.' },
        { status: 401 }
      );
    }

    let mediaIds: string[] = [];

    // Handle image upload if provided
    if (imageUrl || imageData) {
      try {
        let imageBuffer: Buffer;
        
        if (imageData) {
          // Use provided base64 data
          imageBuffer = Buffer.from(imageData, 'base64');
        } else if (imageUrl) {
          // Use image proxy to fetch and convert image
          const proxyResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/image-proxy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl })
          });

          if (!proxyResponse.ok) {
            throw new Error(`Image proxy failed: ${proxyResponse.status}`);
          }

          const proxyData = await proxyResponse.json();
          if (!proxyData.success) {
            throw new Error(proxyData.error || 'Failed to process image');
          }

          imageBuffer = Buffer.from(proxyData.base64, 'base64');
        } else {
          throw new Error('No image data provided');
        }

        // Upload media to X API v1.1 (required for media uploads)  
        // Convert Buffer to base64 for X API
        const base64Image = imageBuffer.toString('base64');
        
        const mediaResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'media_data': base64Image
          })
        });

        if (!mediaResponse.ok) {
          const mediaError = await mediaResponse.text();
          console.error('Media upload failed:', mediaError);
          // Continue without image if upload fails
        } else {
          const mediaResult = await mediaResponse.json();
          if (mediaResult.media_id_string) {
            mediaIds.push(mediaResult.media_id_string);
          }
        }
      } catch (error) {
        console.error('Image processing error:', error);
        // Continue without image if processing fails
      }
    }

    // Prepare tweet data
    const tweetData: any = { text };
    if (mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }

    // Post the tweet to X API v2
    const tweetResponse = await fetch('https://api.x.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData)
    });

    const responseData = await tweetResponse.json();

    // Handle rate limiting
    if (tweetResponse.status === 429) {
      const retryAfter = tweetResponse.headers.get('x-rate-limit-reset');
      const retryAfterSec = retryAfter ? Math.max(0, parseInt(retryAfter) - Math.floor(Date.now() / 1000)) : null;
      
      return NextResponse.json({
        ok: false,
        error: 'Rate limit exceeded',
        rate: {
          retryAfterSec,
          resetEpochSec: retryAfter ? parseInt(retryAfter) : null,
          remaining: parseInt(tweetResponse.headers.get('x-rate-limit-remaining') || '0')
        }
      }, { status: 429 });
    }

    if (!tweetResponse.ok) {
      console.error('X API Error:', responseData);
      return NextResponse.json({
        ok: false,
        error: responseData.detail || responseData.title || 'Failed to post tweet',
        details: responseData
      }, { status: tweetResponse.status });
    }

    // Success - return the tweet data
    return NextResponse.json({
      ok: true,
      tweetId: responseData.data?.id,
      id: responseData.data?.id,
      text: responseData.data?.text,
      data: responseData.data
    });

  } catch (error) {
    console.error('Tweet posting error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}