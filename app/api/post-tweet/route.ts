import { NextRequest, NextResponse } from 'next/server';
import { XTokenManager } from '@/lib/x-tokens';
import { FirebasePostService } from '@/lib/firebase-post-service';

// X API v2 configuration
const X_API_BASE_URL = 'https://api.twitter.com/2';
const X_UPLOAD_URL = 'https://upload.twitter.com/1.1';

// Helper function to upload media to X (following X API documentation)
async function uploadMedia(imageUrl: string, accessToken: string): Promise<string | null> {
  try {
    console.log('📤 Uploading media to X using correct X API workflow...');
    console.log('🔑 Using access token:', accessToken ? 'Present' : 'Missing');
    
    // Download and prepare the image
    let imageBuffer: Buffer;
    if (imageUrl.startsWith('data:')) {
      // Handle base64 data URLs
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
      console.log('🖼️ Processing base64 image, size:', imageBuffer.length, 'bytes');
    } else {
      console.log('🌐 Fetching image from URL:', imageUrl);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error('❌ Failed to fetch image:', imageResponse.status, imageResponse.statusText);
        return null;
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      console.log('🖼️ Downloaded image, size:', imageBuffer.length, 'bytes');
    }

    // Check authentication
    if (!accessToken) {
      console.error('❌ No access token provided for media upload');
      return null;
    }

    // 🔹 Step 1: Upload the image using X API Media Upload endpoint
    console.log('🚀 Step 1: Uploading media using FormData (as per X API docs)...');
    
    const formData = new FormData();
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    formData.append('media', blob);

    const uploadResponse = await fetch(`${X_UPLOAD_URL}/media/upload.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Note: Don't set Content-Type header when using FormData, let the browser set it
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => 'Unknown error');
      console.error('❌ Media upload failed:', uploadResponse.status, uploadResponse.statusText);
      console.error('❌ Error details:', errorText);
      
      // Detailed error diagnostics
      if (uploadResponse.status === 403) {
        console.error('❌ 403 Forbidden - Possible causes:');
        console.error('   1. Access token is invalid or expired');
        console.error('   2. App lacks media upload permissions');
        console.error('   3. User hasn\'t authorized app with proper scopes');
        console.error('   4. Rate limit exceeded');
      } else if (uploadResponse.status === 401) {
        console.error('❌ 401 Unauthorized - Token authentication failed');
      } else if (uploadResponse.status === 413) {
        console.error('❌ 413 Payload Too Large - Image file too big');
      }
      
      return null;
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ Step 1 Success - Media uploaded, response:', uploadData);
    
    // Extract media_id (can be media_id or media_id_string)
    const mediaId = uploadData.media_id_string || uploadData.media_id?.toString();
    
    if (!mediaId) {
      console.error('❌ No media_id returned from upload response');
      console.error('Upload response:', uploadData);
      return null;
    }

    console.log('✅ Media uploaded successfully, media_id:', mediaId);
    return mediaId;
    
  } catch (error) {
    console.error('❌ Error uploading media:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, imageUrl } = await request.json();

    console.log('🐦 X Posting Request:');
    console.log('📝 Text:', text ? `"${text}"` : '(empty - image-only post)');
    console.log('🖼️ Image:', imageUrl ? 'Yes' : 'No');

    // Validate request
    if (!text && !imageUrl) {
      return NextResponse.json(
        { error: 'Either text or image is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.TWITTER_CLIENT_ID) {
      return NextResponse.json(
        { error: 'X API credentials not configured' },
        { status: 500 }
      );
    }

    // Get valid access token (this handles refresh automatically)
    let accessToken: string;
    try {
      accessToken = await XTokenManager.getValidAccessToken();
      console.log('✅ Got access token for X API');
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      
      // Check if we have any tokens stored
      const storedTokens = XTokenManager.getStoredTokens();
      console.log('🔍 Stored tokens status:', storedTokens ? 'Present' : 'None');
      
      // Also check environment variables as fallback
      const envToken = process.env.TWITTER_ACCESS_TOKEN || process.env.X_ACCESS_TOKEN;
      if (envToken) {
        console.log('🔄 Falling back to environment token');
        accessToken = envToken;
      } else {
        return NextResponse.json(
          { 
            error: 'No valid X authentication tokens. Please authorize the app first.',
            details: 'Run the authorization flow or set TWITTER_ACCESS_TOKEN in environment'
          },
          { status: 401 }
        );
      }
    }

    // 🔹 Step 1: Upload media first (if image is provided)
    let mediaId: string | null = null;
    if (imageUrl) {
      console.log('🖼️ Image provided, uploading media first...');
      mediaId = await uploadMedia(imageUrl, accessToken);
      if (!mediaId) {
        return NextResponse.json(
          { error: 'Failed to upload image to X. Check authentication and permissions.' },
          { status: 500 }
        );
      }
      console.log('✅ Media upload completed, media_id:', mediaId);
    }

    // 🔹 Step 2: Create the post with the media (following X API docs format)
    const tweetData: any = {};
    
    // Add text (required for tweets, but can be empty string for image-only posts)
    tweetData.text = text || '';
    
    // Add media if we have it
    if (mediaId) {
      tweetData.media = {
        media_ids: [mediaId]
      };
    }

    console.log('🚀 Step 2: Creating tweet with data:', tweetData);

    // Post the tweet using the exact format from X API documentation
    const postResponse = await fetch(`${X_API_BASE_URL}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tweetData)
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json().catch(() => ({}));
      console.error('X API error:', postResponse.status, errorData);
      
      // Handle specific X API errors
      if (postResponse.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed. Please re-authorize the app.' },
          { status: 401 }
        );
      } else if (postResponse.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else if (postResponse.status === 403) {
        return NextResponse.json(
          { error: 'Forbidden. Check your app permissions or account status.' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { 
            error: errorData.detail || errorData.message || `X API error: ${postResponse.status}`,
            details: errorData
          },
          { status: postResponse.status }
        );
      }
    }

    const responseData = await postResponse.json();
    const tweetId = responseData.data?.id;

    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet posted but no ID returned' },
        { status: 500 }
      );
    }

    console.log('✅ Tweet posted successfully!');
    console.log('🆔 Tweet ID:', tweetId);
    console.log('🔗 Tweet URL: https://x.com/user/status/' + tweetId);

    // Log to Firebase (best-effort)
    try {
      const postData = {
        platform: 'x' as const,
        caption: text ?? null,
        image: imageUrl ?? null,
        postId: tweetId, // Store the Twitter ID
        dateTime: new Date()
      };
      
      console.log('📝 Saving post to Firebase (X):', postData);
      
      // Check if post already exists to prevent duplicates
      const exists = await FirebasePostService.postExists(tweetId, 'x');
      
      if (exists) {
        console.log('ℹ️ Post already exists in Firebase, skipping save');
      } else {
        const firebaseId = await FirebasePostService.savePost(postData);
        
        if (firebaseId) {
          console.log('✅ Post saved to Firebase successfully with ID:', firebaseId);
        } else {
          console.log('❌ Failed to save post to Firebase');
        }
      }
    } catch (e) {
      console.error('❌ Firebase logging failed (X):', e);
    }

    return NextResponse.json({
      success: true,
      tweetId: tweetId,
      url: `https://x.com/user/status/${tweetId}`,
      message: imageUrl && !text 
        ? 'Image-only tweet posted successfully!' 
        : 'Tweet posted successfully!'
    });

  } catch (error) {
    console.error('Error posting to X:', error);
    return NextResponse.json(
      { error: 'Internal server error while posting to X' },
      { status: 500 }
    );
  }
}

// Handle GET request for testing
export async function GET() {
  return NextResponse.json({
    message: 'X Post API endpoint',
    endpoints: {
      'POST /api/post-tweet': 'Post a tweet with optional image',
      'Required body': {
        text: 'string (optional if image provided)',
        imageUrl: 'string (optional - base64 data URL or public URL)'
      }
    },
    test: {
      imageOnly: 'Send empty text with imageUrl to test image-only posting',
      textOnly: 'Send text without imageUrl for text-only posting',
      both: 'Send both text and imageUrl for combined posting'
    }
  });
}
