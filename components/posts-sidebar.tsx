'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Linkedin, Twitter, Grid3X3, X, Loader2, RefreshCw } from 'lucide-react';

interface Post {
  id: string;
  platform: 'linkedin' | 'x';
  caption: string | null;
  image: string | null;
  postId: string;
  dateTime: string;
  createdAt: string;
}

interface PostsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostsSidebar({ isOpen, onClose }: PostsSidebarProps) {
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
          return dateB - dateA;
        });
        
        setPosts(sortedPosts);
        setTotalCount(data.totalCount);
      } else {
        console.error('Failed to fetch posts:', data.error);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen, filter]);

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

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-sidebar/95 backdrop-blur-xl border-l border-border/50 h-full overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">📊</span>
          </div>
          <h2 className="text-lg font-semibold text-sidebar-foreground">Posts History</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="w-8 h-8 p-0 hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sidebar-foreground">Filter by platform:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchPosts}
              disabled={loading}
              className="h-7 px-2"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={`text-xs flex-1 ${filter === 'all' ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' : ''}`}
            >
              <Grid3X3 className="w-3 h-3 mr-1" />
              All
            </Button>
            <Button
              variant={filter === 'linkedin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('linkedin')}
              className={`text-xs flex-1 ${filter === 'linkedin' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white' : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'}`}
            >
              <Linkedin className="w-3 h-3 mr-1" />
              LinkedIn
            </Button>
            <Button
              variant={filter === 'x' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('x')}
              className={`text-xs flex-1 ${filter === 'x' ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white' : 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Twitter className="w-3 h-3 mr-1" />
              X
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              Total: {totalCount} posts
            </Badge>
            <Badge variant="outline" className="text-xs">
              Showing: {posts.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-sm font-semibold text-center">No posts found</h3>
            <p className="text-xs text-muted-foreground text-center">
              {filter !== 'all' 
                ? `No ${filter === 'x' ? 'X (Twitter)' : 'LinkedIn'} posts found.`
                : 'Start creating campaigns and posting to see your content here!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts
              .filter(post => {
                if (filter === 'all') return true;
                return post.platform === filter;
              })
              .map((post) => (
                <Card key={post.id} className="p-3 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow border border-border/30">
                  <div className="space-y-2">
                    {/* Platform Badge and Date */}
                    <div className="flex items-center justify-between">
                      <Badge className={`${getPlatformColor(post.platform)} flex items-center px-1.5 py-0.5 text-xs`}>
                        {getPlatformIcon(post.platform)}
                        {post.platform === 'x' ? 'X' : 'LinkedIn'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.dateTime)}
                      </span>
                    </div>

                    {/* Image */}
                    {post.image && (
                      <div className="relative w-full h-20 bg-muted rounded-md overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Caption */}
                    {post.caption && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Caption:</p>
                        <div className="text-xs bg-muted/50 p-2 rounded-md max-h-16 overflow-y-auto no-scrollbar">
                          <div className="whitespace-pre-wrap break-words">
                            {post.caption}
                          </div>
                        </div>
                      </div>
                    )}

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
                      className="w-full h-7 text-xs"
                      onClick={() => {
                        let url = '';
                        if (post.platform === 'x') {
                          url = `https://x.com/user/status/${post.postId}`;
                        } else if (post.platform === 'linkedin') {
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