'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { XService } from '@/lib/x-service';
import { 
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Twitter,
  ArrowLeft,
  Image as ImageIcon,
  X,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

export default function TestImagePostPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postResult, setPostResult] = useState<{
    success: boolean;
    message: string;
    tweetId?: string;
  } | null>(null);

  // Sample generated images from the public folder
  const sampleImages = [
    '/generated-images/campaign-poster-1758958163474-sjsfzl.jpg',
    '/generated-images/campaign-poster-1758958728004-oxgl2g.jpg',
    '/generated-images/campaign-poster-1758959708647-cue9hb.jpg',
    '/ai-generated-campaign-poster.jpg'
  ];

  const handleImageSelect = (imagePath: string) => {
    setSelectedImage(imagePath);
    setImageFile(null);
    setPostResult(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setPostResult(null);
    }
  };

  const handlePostImageOnly = async () => {
    if (!selectedImage) {
      setPostResult({ success: false, message: 'Please select an image to post' });
      return;
    }

    setIsPosting(true);
    setPostResult(null);

    try {
      // Post with empty text to test image-only posting
      const result = await XService.postTweetWithImage({
        text: '', // Empty text for image-only post
        imageUrl: selectedImage
      });
      
      if (result.ok && result.tweetId) {
        setPostResult({ 
          success: true, 
          message: `Successfully posted image-only tweet to X!`,
          tweetId: result.tweetId
        });
      } else {
        const errorMessage = result.error || 'Failed to post image to X';
        setPostResult({ success: false, message: errorMessage });
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while posting image';
      setPostResult({ success: false, message: errorMessage });
      console.error('Image post error:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleSimpleTest = async () => {
    setIsPosting(true);
    setPostResult(null);

    try {
      console.log('🧪 Running simple API test...');
      
      const response = await fetch('/api/test-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testText: '🧪 Simple test from image-only test page'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPostResult({
          success: true,
          message: `Simple Test Successful! ${result.message}`,
          tweetId: result.tweetId
        });
      } else {
        setPostResult({
          success: false,
          message: `Simple Test Failed: ${result.error || result.message || 'Unknown error'}`
        });
      }

      console.log('🧪 Simple Test Result:', result);
    } catch (error) {
      console.error('Simple test error:', error);
      setPostResult({
        success: false,
        message: 'Simple test execution failed'
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleMediaWorkflowTest = async () => {
    setIsPosting(true);
    setPostResult(null);

    try {
      console.log('🧪 Running X API Media Workflow Test...');
      
      const response = await fetch('/api/test-media-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPostResult({
          success: true,
          message: `Media Workflow Test Successful! ${result.message}`,
          tweetId: result.results?.tweetCreation?.tweetId
        });
      } else {
        setPostResult({
          success: false,
          message: `Media Workflow Test Failed: ${result.error || result.message || 'Unknown error'}`
        });
      }

      console.log('🧪 Media Workflow Test Result:', result);
    } catch (error) {
      console.error('Media workflow test error:', error);
      setPostResult({
        success: false,
        message: 'Media workflow test execution failed'
      });
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

  const clearSelection = () => {
    setSelectedImage(null);
    setImageFile(null);
    setPostResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Image-Only Post Test</h1>
              <p className="text-muted-foreground">Test posting images to X (Twitter) without any text</p>
            </div>
          </div>

          <Badge variant="outline" className="mb-6">
            <Twitter className="w-3 h-3 mr-1" />
            Image Test Environment
          </Badge>
        </div>

        {/* Instructions */}
        <Card className="p-6 mb-8 bg-purple-50/50 border-purple-200/50 dark:bg-purple-950/20 dark:border-purple-800/50">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Image-Only Posting Test</h3>
              <div className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
                <p><strong>Purpose:</strong> Test if X API allows posting images without accompanying text</p>
                <p><strong>Workflow:</strong> Following official X API documentation steps</p>
                <p><strong>Expected:</strong> Either successful image-only post or error indicating text is required</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Selection Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Select Image to Post
              </h3>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Custom Image</label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-4 hover:border-border transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs">(JPG, PNG, GIF up to 5MB)</span>
                  </label>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Sample Images */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Or Select Sample Image</label>
                <div className="grid grid-cols-2 gap-3">
                  {sampleImages.map((imagePath, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(imagePath)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === imagePath 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <img 
                        src={imagePath} 
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      {selectedImage === imagePath && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Selected Image Preview */}
            {selectedImage && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Selected Image</h4>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img 
                    src={selectedImage} 
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Actions and Status Panel */}
          <div className="space-y-6">
            {/* Post Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Twitter className="w-5 h-5" />
                Post to X
              </h3>

              {/* Post Result */}
              {postResult && (
                <Card className={`p-4 mb-4 ${postResult.success 
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
                            onClick={() => window.open(`https://twitter.com/user/status/${postResult.tweetId}`, '_blank')}
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

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-lg"
                  onClick={handlePostImageOnly}
                  disabled={isPosting || !selectedImage}
                >
                  {isPosting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  {isPosting ? 'Posting Image...' : 'Post Image Only (No Text)'}
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/20"
                  onClick={handleSimpleTest}
                  disabled={isPosting}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Simple API Test (Text Only)
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950/20"
                  onClick={handleMediaWorkflowTest}
                  disabled={isPosting}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  X API Media Workflow Test
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshTokens}
                    disabled={isRefreshing}
                    size="sm"
                  >
                    {isRefreshing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Refresh
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleGetAuthUrl}
                    size="sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Authorize
                  </Button>
                </div>
              </div>
            </Card>

            {/* Test Information */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Test Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Simple Test: Direct token authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Workflow Test: Official X API media upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span>Image Test: Empty text + media upload</span>
                </div>
              </div>
            </Card>

            {/* API Status */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">API Endpoints</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-muted/50 rounded">
                  POST /api/test-simple
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  POST /api/test-media-workflow
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  POST /api/post-tweet
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Image-Only Post Test • Following Official X API Documentation • Fixed Media Upload Workflow</p>
        </div>
      </div>
    </div>
  );
}