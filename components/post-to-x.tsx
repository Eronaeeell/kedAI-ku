'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { XService } from '@/lib/x-service';
import { 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Twitter
} from 'lucide-react';

interface PostToXProps {
  initialText?: string;
  onPostSuccess?: (tweetId: string) => void;
  onPostError?: (error: string) => void;
  className?: string;
}

export const PostToX: React.FC<PostToXProps> = ({
  initialText = '',
  onPostSuccess,
  onPostError,
  className = ''
}) => {
  const [text, setText] = useState(initialText);
  const [isPosting, setIsPosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postResult, setPostResult] = useState<{
    success: boolean;
    message: string;
    tweetId?: string;
  } | null>(null);

  const handlePost = async () => {
    if (!text.trim()) {
      setPostResult({ success: false, message: 'Please enter some text to post' });
      return;
    }

    if (text.length > 280) {
      setPostResult({ success: false, message: 'Tweet exceeds 280 character limit' });
      return;
    }

    setIsPosting(true);
    setPostResult(null);

    try {
      const result = await XService.postTweet(text);
      
      if (result.ok && result.tweetId) {
        setPostResult({ 
          success: true, 
          message: `Successfully posted to X!`,
          tweetId: result.tweetId
        });
        
        // Clear text on successful post
        setText('');
        
        // Call success callback
        if (onPostSuccess) {
          onPostSuccess(result.tweetId);
        }
      } else {
        const errorMessage = result.error || 'Failed to post to X';
        setPostResult({ success: false, message: errorMessage });
        
        if (onPostError) {
          onPostError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while posting';
      setPostResult({ success: false, message: errorMessage });
      
      if (onPostError) {
        onPostError(errorMessage);
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleRefreshTokens = async () => {
    setIsRefreshing(true);
    try {
      const result = await XService.refreshTokens();
      if (result.success) {
        setPostResult({ success: true, message: 'Tokens refreshed successfully!' });
      } else {
        setPostResult({ success: false, message: result.error || 'Failed to refresh tokens' });
      }
    } catch (error) {
      setPostResult({ success: false, message: 'Failed to refresh tokens' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGetAuthUrl = async () => {
    try {
      const result = await XService.getAuthUrl();
      if (result.url) {
        window.open(result.url, '_blank');
        setPostResult({ success: true, message: 'Authorization URL opened. Please complete the authorization process.' });
      } else {
        setPostResult({ success: false, message: result.error || 'Failed to get authorization URL' });
      }
    } catch (error) {
      setPostResult({ success: false, message: 'Failed to get authorization URL' });
    }
  };

  const characterCount = text.length;
  const isOverLimit = characterCount > 280;
  const charactersRemaining = 280 - characterCount;

  return (
    <Card className={`p-6 bg-card/95 backdrop-blur-xl border-border/50 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Post to X</h3>
              <p className="text-sm text-muted-foreground">Share your content on X (Twitter)</p>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Text Input */}
        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            className="min-h-[120px] bg-background/50 backdrop-blur-sm border-border/30 resize-none"
            maxLength={300} // Allow a bit over the limit to show warning
          />
          
          {/* Character Count */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Badge 
                variant={isOverLimit ? "destructive" : "secondary"}
                className="text-xs"
              >
                {charactersRemaining} characters remaining
              </Badge>
            </div>
            <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {characterCount}/280
            </span>
          </div>
        </div>

        {/* Result Message */}
        {postResult && (
          <Card className={`p-3 ${postResult.success 
            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {postResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${postResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
                }`}>
                  {postResult.message}
                </p>
                {postResult.success && postResult.tweetId && (
                  <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Tweet ID: {postResult.tweetId}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      onClick={() => window.open(`https://x.com/user/status/${postResult.tweetId}`, '_blank')}
                    >
                      View on X
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        <Separator className="opacity-50" />

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25 border-0"
            onClick={handlePost}
            disabled={isPosting || !text.trim() || isOverLimit}
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isPosting ? 'Posting...' : 'Post to X'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleRefreshTokens}
            disabled={isRefreshing}
            className="border-primary/20 hover:border-primary/40"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh Tokens'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGetAuthUrl}
            className="border-primary/20 hover:border-primary/40"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Authorize App
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Make sure to authorize the app first if you haven't already</p>
          <p>• Use "Refresh Tokens" if you encounter authentication issues</p>
          <p>• Maximum 280 characters per post</p>
        </div>
      </div>
    </Card>
  );
};