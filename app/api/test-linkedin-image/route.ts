import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple endpoint to test LinkedIn image upload functionality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, text } = body;

    console.log('🧪 Testing LinkedIn image upload...');
    console.log('📝 Text:', text || 'No text provided');
    console.log('🖼️ Image URL type:', 
      imageUrl ? 
        (imageUrl.startsWith('data:') ? 'base64 data URL' : 
         imageUrl.startsWith('http') ? 'remote URL' : 'local path') 
        : 'No image provided'
    );

    if (!imageUrl) {
      return NextResponse.json({
        error: 'No image provided for testing'
      }, { status: 400 });
    }

    // Test image processing without LinkedIn API
    let imageSize = 0;
    let contentType = 'unknown';
    
    if (imageUrl.startsWith('data:')) {
      // Test base64 processing
      const mimeMatch = imageUrl.match(/^data:([^;]+);base64,/);
      if (mimeMatch) {
        contentType = mimeMatch[1];
      }
      
      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 data URL format');
      }

      const buffer = Buffer.from(base64Data, 'base64');
      imageSize = buffer.byteLength;
      
      console.log('✅ Base64 processing successful');
      console.log('📏 Image size:', imageSize, 'bytes');
      console.log('🎨 Content type:', contentType);
    } else if (!imageUrl.startsWith('http')) {
      // Test local file processing
      const cleanImageUrl = imageUrl.replace(/^\/+/, '');
      const imagePath = path.join(process.cwd(), 'public', cleanImageUrl);
      
      console.log('🔍 Testing local file:', imagePath);
      
      try {
        await fs.access(imagePath);
        console.log('✅ File exists and is accessible');
        
        const stats = await fs.stat(imagePath);
        imageSize = stats.size;
        
        const ext = path.extname(imagePath).toLowerCase();
        switch (ext) {
          case '.png': contentType = 'image/png'; break;
          case '.jpg':
          case '.jpeg': contentType = 'image/jpeg'; break;
          case '.gif': contentType = 'image/gif'; break;
          case '.webp': contentType = 'image/webp'; break;
          default: contentType = 'image/jpeg';
        }
        
        console.log('📏 Local file size:', imageSize, 'bytes');
        console.log('🎨 Content type:', contentType);
        
      } catch (error) {
        return NextResponse.json({
          error: `Local file not found: ${cleanImageUrl}`,
          path: imagePath,
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 404 });
      }
    }
    
    // Validate size for any image type
    if (imageSize > 0) {
      if (imageSize > 20 * 1024 * 1024) {
        return NextResponse.json({
          error: 'Image too large',
          size: imageSize,
          maxSize: 20 * 1024 * 1024
        }, { status: 413 });
      }
      
      if (imageSize < 100) {
        return NextResponse.json({
          error: 'Image too small or corrupted',
          size: imageSize,
          minSize: 100
        }, { status: 400 });
      }
    }

    // Check if LinkedIn tokens exist
    const tokensPath = path.join(process.cwd(), 'linkedin_tokens.json');
    let hasTokens = false;
    let tokenStatus = '';
    
    try {
      const tokensData = await fs.readFile(tokensPath, 'utf-8');
      const tokens = JSON.parse(tokensData);
      hasTokens = true;
      
      if (tokens.expires_at <= Date.now()) {
        tokenStatus = 'expired';
      } else {
        tokenStatus = 'valid';
      }
    } catch {
      hasTokens = false;
      tokenStatus = 'missing';
    }

    return NextResponse.json({
      success: true,
      testResults: {
        imageProcessing: {
          success: true,
          size: imageSize,
          contentType: contentType,
          sizeCheck: imageSize > 100 && imageSize < 20 * 1024 * 1024 ? 'passed' : 'failed'
        },
        authentication: {
          hasTokens: hasTokens,
          tokenStatus: tokenStatus
        },
        recommendations: tokenStatus === 'expired' ? 
          ['Refresh LinkedIn tokens'] :
          tokenStatus === 'missing' ? 
          ['Authorize LinkedIn app'] :
          ['Ready to post to LinkedIn']
      }
    });

  } catch (error) {
    console.error('❌ LinkedIn image test error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Image processing test failed'
    }, { status: 500 });
  }
}