import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface LinkedInTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
}

interface LinkedInPersonInfo {
  sub: string; // LinkedIn person ID
}

interface LinkedInPostData {
  text?: string;
  imageUrl?: string;
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

async function getLinkedInPersonId(accessToken: string): Promise<string> {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get person info: ${response.status}`);
  }

  const data: LinkedInPersonInfo = await response.json();
  return data.sub;
}

async function uploadImageToLinkedIn(accessToken: string, personId: string, imageUrl: string): Promise<string> {
  console.log('🔧 Starting LinkedIn image upload process...');
  console.log('📸 Image URL type:', imageUrl.startsWith('data:') ? 'base64' : imageUrl.startsWith('http') ? 'remote URL' : 'local path');
  
  try {
    // Step 1: Register upload
    console.log('📝 Step 1: Registering upload with LinkedIn...');
    const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${personId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      })
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('❌ Register upload failed:', registerResponse.status, errorText);
      throw new Error(`Failed to register image upload: ${registerResponse.status} - ${errorText}`);
    }

    const registerData = await registerResponse.json();
    console.log('✅ Upload registered successfully');
    
    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerData.value.asset;
    
    console.log('🔗 Upload URL received:', uploadUrl ? 'Yes' : 'No');
    console.log('🏷️ Asset URN:', asset);

    // Step 2: Prepare the image data
    console.log('📦 Step 2: Preparing image data...');
    let imageBuffer: ArrayBuffer;
    
    if (imageUrl.startsWith('data:')) {
      // Handle base64 data URLs (most common case from file uploads)
      console.log('🖼️ Processing base64 data URL...');
      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 data URL format');
      }
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBuffer = bytes.buffer;
      console.log('📏 Base64 image size:', imageBuffer.byteLength, 'bytes');
    } else if (imageUrl.startsWith('http')) {
      // Handle remote URLs
      console.log('🌐 Fetching remote image...');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      imageBuffer = await imageResponse.arrayBuffer();
      console.log('📏 Remote image size:', imageBuffer.byteLength, 'bytes');
    } else {
      // Handle local file paths
      console.log('📁 Reading local file...');
      const imagePath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
      const imageFile = await fs.readFile(imagePath);
      imageBuffer = new ArrayBuffer(imageFile.byteLength);
      new Uint8Array(imageBuffer).set(new Uint8Array(imageFile));
      console.log('📏 Local file size:', imageBuffer.byteLength, 'bytes');
    }

    // Step 3: Upload the image
    console.log('⬆️ Step 3: Uploading image to LinkedIn...');
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Image upload failed:', uploadResponse.status, errorText);
      throw new Error(`Failed to upload image: ${uploadResponse.status} - ${errorText}`);
    }

    console.log('✅ Image uploaded successfully to LinkedIn!');
    return asset;
    
  } catch (error) {
    console.error('❌ LinkedIn image upload error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, imageUrl }: LinkedInPostData = await request.json();

    // Validate input
    if (!text?.trim() && !imageUrl) {
      return NextResponse.json({
        error: 'Either text or image is required'
      }, { status: 400 });
    }

    // Get stored tokens
    const tokens = await getStoredTokens();
    if (!tokens) {
      return NextResponse.json({
        error: 'No LinkedIn tokens found. Please authorize the application first.'
      }, { status: 401 });
    }

    // Check if token is expired
    if (tokens.expires_at <= Date.now()) {
      return NextResponse.json({
        error: 'Access token has expired. Please re-authorize the application.'
      }, { status: 401 });
    }

    // Get person ID
    const personId = await getLinkedInPersonId(tokens.access_token);

    // Prepare post data
    let postData: any = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text || ''
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'CONNECTIONS'
      }
    };

    // Handle image upload if provided
    if (imageUrl) {
      console.log('🖼️ Image provided, starting upload process...');
      try {
        const assetUrn = await uploadImageToLinkedIn(tokens.access_token, personId, imageUrl);
        
        console.log('✅ Image upload completed, adding to post data...');
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: text || 'Campaign image'
            },
            media: assetUrn,
            title: {
              text: 'Campaign Image'
            }
          }
        ];
        console.log('🎯 Post data prepared with image media');
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return NextResponse.json({
          error: `Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`,
          details: 'Please try again or post without an image'
        }, { status: 500 });
      }
    }

    // Create the post
    console.log('📤 Creating LinkedIn post...');
    console.log('📝 Post data:', JSON.stringify(postData, null, 2));
    
    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error('❌ LinkedIn API error:', postResponse.status, errorText);
      return NextResponse.json({
        error: `Failed to post to LinkedIn: ${postResponse.status} - ${errorText}`,
        details: 'Check console logs for more details'
      }, { status: postResponse.status });
    }

    const responseData = await postResponse.json();
    console.log('✅ LinkedIn post created successfully!');

    return NextResponse.json({
      success: true,
      postId: responseData.id,
      urn: responseData.id
    });

  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    
    if (error instanceof Error && error.message.includes('Failed to get person info')) {
      return NextResponse.json({
        error: 'Invalid or expired access token. Please re-authorize the application.'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to post to LinkedIn'
    }, { status: 500 });
  }
}