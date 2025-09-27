'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Linkedin, Twitter, Grid3X3 } from 'lucide-react';

interface Post {
  id: string;
  platform: 'linkedin' | 'x';
  caption: string | null;
  image: string | null;
  postId: string;
  dateTime: string;
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'linkedin' | 'x'>('all');
  const [totalCount, setTotalCount] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('platform', filter);
      }
      params.set('limit', '50');

      console.log('🔍 Fetching posts with filter:', filter);
      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      console.log('📊 Posts API response:', data);

      if (data.success) {
        // Sort posts by dateTime in descending order (newest first)
        const sortedPosts = [...data.posts].sort((a, b) => {
          const dateA = new Date(a.dateTime).getTime();
          const dateB = new Date(b.dateTime).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log('📋 Sorted posts:', sortedPosts.map(p => ({
          platform: p.platform,
          dateTime: p.dateTime,
          caption: p.caption?.substring(0, 50) + '...'
        })));
        
        setPosts(sortedPosts);
        setTotalCount(data.totalCount);
      } else {
        console.error('Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Filter changed to:', filter);
    fetchPosts();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kuala_Lumpur'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      case 'x':
        return 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-sm';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="w-3 h-3 mr-1" />;
      case 'x':
        return <Twitter className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Posted Content Dashboard</h1>
          <p className="text-muted-foreground">Track all your successful posts to LinkedIn and X (Twitter)</p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Filter by platform:</span>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' : ''}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  All Platforms
                </Button>
                <Button
                  variant={filter === 'linkedin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('linkedin')}
                  className={filter === 'linkedin' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white' : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant={filter === 'x' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('x')}
                  className={filter === 'x' ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white' : 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  X (Twitter)
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Total: {totalCount} posts
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchPosts}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center bg-card/95 backdrop-blur-sm">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No posts found</p>
              <p>
                {filter !== 'all' 
                  ? `No ${filter === 'x' ? 'X (Twitter)' : 'LinkedIn'} posts found. Try switching to "All Platforms".`
                  : 'Start creating campaigns and posting to see your content here!'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts
              .filter(post => {
                // Additional client-side filtering as fallback
                if (filter === 'all') return true;
                return post.platform === filter;
              })
              .map((post) => (
                <Card key={post.id} className="p-4 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    {/* Platform Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={`${getPlatformColor(post.platform)} flex items-center px-2 py-1`}>
                        {getPlatformIcon(post.platform)}
                        {post.platform === 'x' ? 'X (Twitter)' : 'LinkedIn'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.dateTime)}
                      </span>
                    </div>

                    {/* Image */}
                    {post.image && (
                      <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Caption */}
                    {post.caption && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Caption:</p>
                        <div className="text-sm bg-muted/50 p-3 rounded-lg max-h-24 overflow-y-auto no-scrollbar">
                          <div className="whitespace-pre-wrap break-words">
                            {post.caption}
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Post ID */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Post ID:</p>
                      <p className="text-xs font-mono bg-muted/50 p-1 rounded truncate">
                        {post.postId}
                      </p>
                    </div>

                    {/* View Link */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        let url = '';
                        if (post.platform === 'x') {
                          url = `https://x.com/user/status/${post.postId}`;
                        } else if (post.platform === 'linkedin') {
                          // LinkedIn URNs don't have direct URLs, but we can try
                          url = `https://linkedin.com/posts/activity-${post.postId.split(':').pop()}`;
                        }
                        if (url) {
                          window.open(url, '_blank');
                        }
                      }}
                    >
                      View Post 📱
                    </Button>
                  </div>
                </Card>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}