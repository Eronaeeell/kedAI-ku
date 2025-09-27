import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { FirebasePostService } from '@/lib/firebase-post-service';

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
    // Step 1: Register upload (following LinkedIn's exact specification)
    console.log('📝 Step 1: Registering upload with LinkedIn...');
    const registerRequestBody = {
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
    };
    
    console.log('📋 Register request body:', JSON.stringify(registerRequestBody, null, 2));
    
    const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(registerRequestBody)
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('❌ Register upload failed:', registerResponse.status, errorText);
      throw new Error(`Failed to register image upload: ${registerResponse.status} - ${errorText}`);
    }

    const registerData = await registerResponse.json();
    console.log('✅ Upload registered successfully');
    console.log('📋 Full register response:', JSON.stringify(registerData, null, 2));
    
    // Extract upload URL and asset URN
    const uploadMechanism = registerData.value.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
    const uploadUrl = uploadMechanism?.uploadUrl;
    const asset = registerData.value.asset;
    
    if (!uploadUrl || !asset) {
      console.error('❌ Missing upload URL or asset in response:', { uploadUrl: !!uploadUrl, asset: !!asset });
      throw new Error('Invalid response from LinkedIn register upload API');
    }
    
    console.log('🔗 Upload URL received:', uploadUrl ? 'Yes' : 'No');
    console.log('🏷️ Asset URN:', asset);

    // Step 2: Prepare the image data
    console.log('📦 Step 2: Preparing image data...');
    let imageBuffer: ArrayBuffer;
    let contentType = 'image/jpeg'; // Default content type
    
    if (imageUrl.startsWith('data:')) {
      // Handle base64 data URLs (most common case from file uploads)
      console.log('🖼️ Processing base64 data URL...');
      
      // Extract content type from data URL
      const mimeMatch = imageUrl.match(/^data:([^;]+);base64,/);
      if (mimeMatch) {
        contentType = mimeMatch[1];
      }
      
      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 data URL format');
      }
      
      // More robust base64 to binary conversion
      try {
        // Use Buffer for more reliable base64 decoding in Node.js
        const buffer = Buffer.from(base64Data, 'base64');
        imageBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        console.log('📏 Base64 image size:', imageBuffer.byteLength, 'bytes');
        console.log('🎨 Image content type:', contentType);
        
        // Validate image size (LinkedIn has limits)
        if (imageBuffer.byteLength > 20 * 1024 * 1024) { // 20MB limit
          throw new Error('Image too large. Maximum size is 20MB.');
        }
        if (imageBuffer.byteLength < 100) { // Minimum reasonable size
          throw new Error('Image too small or corrupted.');
        }
      } catch (error) {
        throw new Error(`Failed to process base64 image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (imageUrl.startsWith('http')) {
      // Handle remote URLs
      console.log('🌐 Fetching remote image...');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      // Get content type from response headers
      const responseContentType = imageResponse.headers.get('content-type');
      if (responseContentType && responseContentType.startsWith('image/')) {
        contentType = responseContentType;
      }
      
      imageBuffer = await imageResponse.arrayBuffer();
      console.log('📏 Remote image size:', imageBuffer.byteLength, 'bytes');
      console.log('🎨 Remote image content type:', contentType);
    } else {
      // Handle local file paths (from public folder)
      console.log('📁 Reading local file...');
      
      // Clean up the image URL - remove leading slash and resolve path
      const cleanImageUrl = imageUrl.replace(/^\/+/, '');
      const imagePath = path.join(process.cwd(), 'public', cleanImageUrl);
      
      console.log('🔍 Resolved file path:', imagePath);
      console.log('🔍 Original imageUrl:', imageUrl);
      console.log('🔍 Clean imageUrl:', cleanImageUrl);
      
      // Check if file exists
      try {
        await fs.access(imagePath);
        console.log('✅ File exists and is accessible');
      } catch (error) {
        console.error('❌ File not found or not accessible:', imagePath);
        throw new Error(`Image file not found: ${cleanImageUrl}. Please ensure the file exists in the public folder.`);
      }
      
      // Determine content type from file extension
      const ext = path.extname(imagePath).toLowerCase();
      switch (ext) {
        case '.png': contentType = 'image/png'; break;
        case '.jpg':
        case '.jpeg': contentType = 'image/jpeg'; break;
        case '.gif': contentType = 'image/gif'; break;
        case '.webp': contentType = 'image/webp'; break;
        default: contentType = 'image/jpeg'; // fallback
      }
      
      try {
        const imageFile = await fs.readFile(imagePath);
        imageBuffer = new ArrayBuffer(imageFile.byteLength);
        new Uint8Array(imageBuffer).set(new Uint8Array(imageFile));
        console.log('📏 Local file size:', imageBuffer.byteLength, 'bytes');
        console.log('🎨 Local file content type:', contentType);
        console.log('✅ Successfully read local file');
      } catch (readError) {
        console.error('❌ Error reading file:', readError);
        throw new Error(`Failed to read image file: ${readError instanceof Error ? readError.message : 'Unknown error'}`);
      }
    }

    // Step 3: Upload the image (binary upload to LinkedIn's S3-like storage)
    console.log('⬆️ Step 3: Uploading image to LinkedIn...');
    
    // Create headers for upload
    const uploadHeaders: Record<string, string> = {
      'Content-Type': contentType, // Use actual image content type
      'Content-Length': imageBuffer.byteLength.toString(),
    };
    
    // Some LinkedIn upload URLs require authorization, others don't
    // We'll try both approaches for maximum compatibility
    try {
      console.log('📤 Attempting upload with content type:', contentType);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: uploadHeaders,
        body: imageBuffer,
      });
      
      if (!uploadResponse.ok) {
        // If first attempt fails, try with authorization header
        console.log('📤 First upload attempt failed, trying with authorization...');
        uploadHeaders['Authorization'] = `Bearer ${accessToken}`;
        
        const retryResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: uploadHeaders,
          body: imageBuffer,
        });
        
        if (!retryResponse.ok) {
          const errorText = await retryResponse.text().catch(() => 'No error details');
          console.error('❌ Both upload attempts failed:', retryResponse.status, errorText);
          console.error('❌ Upload response headers:', Object.fromEntries(retryResponse.headers.entries()));
          throw new Error(`Failed to upload image: ${retryResponse.status} - ${errorText}`);
        }
        
        console.log('✅ Image uploaded successfully on retry!');
      } else {
        console.log('✅ Image uploaded successfully on first attempt!');
      }
    } catch (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }
    
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
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Add text if provided and no image
    if (text && !imageUrl) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareCommentary = {
        text: text
      };
    }

    // Handle image upload if provided
    if (imageUrl) {
      console.log('🖼️ Image provided, starting upload process...');
      console.log('📝 Image URL (first 100 chars):', imageUrl.substring(0, 100) + (imageUrl.length > 100 ? '...' : ''));
      
      try {
        const assetUrn = await uploadImageToLinkedIn(tokens.access_token, personId, imageUrl);
        
        console.log('✅ Image upload completed, adding to post data...');
        console.log('🏷️ Received asset URN:', assetUrn);
        
        // Validate asset URN format
        if (!assetUrn || !assetUrn.includes('urn:li:digitalmediaAsset:')) {
          throw new Error(`Invalid asset URN received: ${assetUrn}`);
        }
        
        // Update post data for image sharing (following LinkedIn specification exactly)
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: text || 'Campaign image'
            },
            media: assetUrn, // This should be the exact asset URN from registration
            title: {
              text: 'Campaign Image'
            }
          }
        ];
        
        // Add commentary for posts with images (LinkedIn allows both text and image)
        if (text && text.trim()) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareCommentary = {
            text: text.trim()
          };
        }
        
        console.log('📋 Final post data with image (media object):', JSON.stringify(postData.specificContent['com.linkedin.ugc.ShareContent'].media, null, 2));
        console.log('🎯 Post data prepared with image media successfully');
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        
        // Provide more specific error messages
        let errorMessage = 'Image upload failed';
        let statusCode = 500;
        
        if (uploadError instanceof Error) {
          errorMessage = uploadError.message;
          
          // Handle specific LinkedIn API errors
          if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
            statusCode = 401;
            errorMessage = 'LinkedIn authorization expired. Please re-authorize the application.';
          } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
            statusCode = 403;
            errorMessage = 'LinkedIn permissions insufficient for image upload. Check app permissions.';
          } else if (errorMessage.includes('413') || errorMessage.includes('too large')) {
            statusCode = 413;
            errorMessage = 'Image file is too large. LinkedIn supports images up to 20MB.';
          } else if (errorMessage.includes('415') || errorMessage.includes('unsupported')) {
            statusCode = 415;
            errorMessage = 'Image format not supported. Please use JPEG, PNG, or GIF format.';
          }
        }
        
        return NextResponse.json({
          error: errorMessage,
          details: 'Check console logs for detailed error information. You can try posting without an image.',
          platform: 'linkedin',
          step: 'image_upload'
        }, { status: statusCode });
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
      console.error('❌ LinkedIn API post creation error:', postResponse.status, errorText);
      
      // Parse error for more specific messages
      let errorMessage = `Failed to create LinkedIn post: ${postResponse.status}`;
      let details = errorText;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.details) {
          details = errorData.details;
        }
      } catch {
        // Use raw error text if JSON parsing fails
        details = errorText;
      }
      
      return NextResponse.json({
        error: errorMessage,
        details: `LinkedIn API response: ${details}`,
        platform: 'linkedin',
        step: 'post_creation'
      }, { status: postResponse.status });
    }

    const responseData = await postResponse.json();
    console.log('✅ LinkedIn post created successfully!');

    // Record post in Firebase (best-effort)
    try {
      const postData = {
        platform: 'linkedin' as const,
        caption: text ?? null,
        image: imageUrl ?? null,
        postId: responseData.id, // Store the full LinkedIn URN
        dateTime: new Date()
      };
      
      console.log('📝 Saving post to Firebase (LinkedIn):', postData);
      
      // Check if post already exists to prevent duplicates
      const exists = await FirebasePostService.postExists(responseData.id, 'linkedin');
      
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
      console.error('❌ Firebase logging failed (LinkedIn):', e);
    }

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