import { NextRequest, NextResponse } from 'next/server';
import { FirebasePostService } from '@/lib/firebase-post-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as 'linkedin' | 'x' | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`🔥 Fetching posts from Firebase${platform ? ` for platform: ${platform}` : ''}`);

    // Always fetch all posts and filter client-side to ensure consistency
    const allPosts = await FirebasePostService.getPosts(undefined, limit * 2);
    
    // Filter client-side if platform is specified
    const filteredPosts = platform 
      ? allPosts.filter(post => post.platform === platform).slice(0, limit)
      : allPosts.slice(0, limit);
    
    console.log(`📊 Total posts: ${allPosts.length}, Filtered posts: ${filteredPosts.length}, Platform filter: ${platform || 'none'}`);
    
    const totalCount = platform 
      ? allPosts.filter(post => post.platform === platform).length
      : allPosts.length;

    return NextResponse.json({
      success: true,
      posts: filteredPosts,
      count: filteredPosts.length,
      totalCount: totalCount,
      filters: {
        platform: platform || 'all',
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Error fetching posts from Firebase:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch posts',
      posts: [],
      count: 0
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, caption, image, postId } = body;

    if (!platform || !postId) {
      return NextResponse.json({
        success: false,
        error: 'Platform and postId are required'
      }, { status: 400 });
    }

    const postData = {
      platform: platform as 'linkedin' | 'x',
      caption: caption || null,
      image: image || null,
      postId: postId,
      dateTime: new Date()
    };

    const firebaseId = await FirebasePostService.savePost(postData);

    if (firebaseId) {
      return NextResponse.json({
        success: true,
        firebaseId: firebaseId,
        message: 'Post saved successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to save post to Firebase'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error saving post to Firebase:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save post'
    }, { status: 500 });
  }
}