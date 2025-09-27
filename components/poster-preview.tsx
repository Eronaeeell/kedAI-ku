"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sparkles, Share, Linkedin, CheckCircle, AlertCircle, Twitter } from "lucide-react"
import { LinkedInService } from "@/lib/linkedin-service"
import { XService } from "@/lib/x-service"

interface PosterPreviewProps {
  imageUrl: string
  onBack: () => void
  selectedComponents: Array<{
    id: string
    name: string
    category: string
    color: string
  }>
}

export function PosterPreview({ imageUrl, onBack, selectedComponents }: PosterPreviewProps) {
  const [caption, setCaption] = useState("")
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isPostingLinkedIn, setIsPostingLinkedIn] = useState(false)
  const [linkedInResult, setLinkedInResult] = useState<{
    success: boolean;
    message: string;
    postId?: string;
  } | null>(null)
  const [xResult, setXResult] = useState<{
    success: boolean;
    message: string;
    tweetId?: string;
  } | null>(null)

  const generateCaption = async () => {
    setIsGeneratingCaption(true)
    try {
      console.log('🎯 Generating social media caption based on AI marketing prompt...')
      
      // Use the same OpenRouter API to generate a social media caption
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          components: selectedComponents
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Generated social caption:', data.caption)
        setCaption(data.caption)
      } else {
        console.error('Caption generation failed:', response.status)
        // Fallback caption
        const componentNames = selectedComponents.map(c => c.name).join(', ')
        setCaption(`🎉 Check out our amazing ${componentNames}! ☕✨ #CafeLife #Coffee #Delicious`)
      }
    } catch (error) {
      console.error('Error generating caption:', error)
      // Fallback caption
      const componentNames = selectedComponents.map(c => c.name).join(', ')
      setCaption(`🎉 Check out our amazing ${componentNames}! ☕✨ #CafeLife #Coffee #Delicious`)
    } finally {
      setIsGeneratingCaption(false)
    }
  }



  const handlePostToX = async () => {
    if (!caption.trim()) {
      setXResult({ success: false, message: 'Please generate or enter a caption first' });
      return;
    }

    if (caption.length > 280) {
      setXResult({ success: false, message: 'Caption exceeds 280 character limit for X' });
      return;
    }

    setIsPosting(true);
    setXResult(null);

    try {
      // Post text-only to X (no image for now)
      const result = await XService.postTweet(caption);
      
      if (result.ok && result.tweetId) {
        setXResult({ 
          success: true, 
          message: `Successfully posted to X!`,
          tweetId: result.tweetId
        });
      } else {
        const errorMessage = result.error || 'Failed to post to X';
        setXResult({ success: false, message: errorMessage });
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while posting to X';
      setXResult({ success: false, message: errorMessage });
    } finally {
      setIsPosting(false);
    }
  }

  const handlePostToLinkedIn = async () => {
    if (!caption.trim()) {
      setLinkedInResult({ success: false, message: 'Please generate or enter a caption first' });
      return;
    }

    setIsPostingLinkedIn(true);
    setLinkedInResult(null);

    try {
      // Post with image to LinkedIn
      const result = await LinkedInService.postToLinkedInWithImage({
        text: caption,
        imageUrl: imageUrl // Use the generated image
      });
      
      if (result.ok && result.postId) {
        setLinkedInResult({ 
          success: true, 
          message: `Successfully posted to LinkedIn with image!`,
          postId: result.postId
        });
      } else {
        const errorMessage = result.error || 'Failed to post to LinkedIn';
        setLinkedInResult({ success: false, message: errorMessage });
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while posting to LinkedIn';
      setLinkedInResult({ success: false, message: errorMessage });
    } finally {
      setIsPostingLinkedIn(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200/100 via-blue-200/100 to-green-200/100 opacity-100"></div>
      
      {/* Soft glowing orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl transform -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-white/20 rounded-full blur-3xl transform translate-y-1/2 animate-pulse delay-700"></div>
      </div>

      {/* Back button */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="absolute top-6 left-6 text-black hover:bg-black/10 backdrop-blur-sm z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Canvas
      </Button>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Poster */}
        <div className="flex items-center justify-center">
          <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/40 shadow-2xl">
            <div className="aspect-video w-full max-w-lg">
              <img 
                src={imageUrl} 
                alt="Generated Marketing Poster" 
                className="w-full h-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </Card>
        </div>

        {/* Right side - Caption and actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Your Marketing Poster is Ready! 🎉
            </h2>
            <p className="text-gray-600">
              Generate a caption and share it on social media
            </p>
          </div>

          {/* Caption section */}
          <Card className="p-6 bg-white/60 backdrop-blur-xl border-white/40">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-800 font-medium">Social Media Caption</label>
                <Button
                  onClick={generateCaption}
                  disabled={isGeneratingCaption}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                >
                  {isGeneratingCaption ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Caption
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Click 'Generate Caption' to create a social media post, or write your own..."
                className="min-h-[120px] bg-white/80 border-gray-200 text-gray-800 placeholder:text-gray-500 resize-none shadow-inner"
              />
              
              <div className="text-gray-600 text-sm">
                {caption.length}/280 characters
              </div>
            </div>
          </Card>

          {/* Social Media Posting Buttons */}
          <div className="space-y-4">
            {/* X (Twitter) Post Button */}
            <Button
              onClick={handlePostToX}
              disabled={!caption.trim() || isPosting || caption.length > 280}
              className="w-full bg-black/90 hover:bg-black text-white py-4 text-lg font-semibold backdrop-blur-sm shadow-lg"
            >
              {isPosting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Posting to X...
                </>
              ) : (
                <>
                  <Twitter className="w-5 h-5 mr-3" />
                  Post to X (Twitter)
                </>
              )}
            </Button>

            {/* LinkedIn Post Button */}
            <Button
              onClick={handlePostToLinkedIn}
              disabled={!caption.trim() || isPostingLinkedIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
            >
              {isPostingLinkedIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Posting to LinkedIn...
                </>
              ) : (
                <>
                  <Linkedin className="w-5 h-5 mr-3" />
                  Post to LinkedIn (Private)
                </>
              )}
            </Button>
          </div>

          {/* Result Messages */}
          {xResult && (
            <Card className={`p-4 ${xResult.success 
              ? 'bg-green-500/10 border-green-400/30' 
              : 'bg-red-500/10 border-red-400/30'
            }`}>
              <div className="flex items-start gap-2">
                {xResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${xResult.success 
                    ? 'text-green-300' 
                    : 'text-red-300'
                  }`}>
                    {xResult.message}
                  </p>
                  {xResult.success && xResult.tweetId && (
                    <div className="mt-1">
                      <p className="text-xs text-green-400/70">
                        Tweet ID: {xResult.tweetId}
                      </p>
                      <button
                        onClick={() => window.open(`https://x.com/user/status/${xResult.tweetId}`, '_blank')}
                        className="text-xs text-green-400 hover:text-green-300 underline mt-1"
                      >
                        View on X →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {linkedInResult && (
            <Card className={`p-4 ${linkedInResult.success 
              ? 'bg-green-500/10 border-green-400/30' 
              : 'bg-red-500/10 border-red-400/30'
            }`}>
              <div className="flex items-start gap-2">
                {linkedInResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${linkedInResult.success 
                    ? 'text-green-300' 
                    : 'text-red-300'
                  }`}>
                    {linkedInResult.message}
                  </p>
                  {linkedInResult.success && linkedInResult.postId && (
                    <p className="text-xs text-green-400/70 mt-1">
                      Post ID: {linkedInResult.postId}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}