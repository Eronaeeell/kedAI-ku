"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Share, Twitter, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
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
  const [postResult, setPostResult] = useState<{
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
      setPostResult({ success: false, message: 'Please enter some text to post' });
      return;
    }

    if (caption.length > 280) {
      setPostResult({ success: false, message: 'Caption exceeds 280 character limit' });
      return;
    }

    setIsPosting(true);
    setPostResult(null);

    try {
      const result = await XService.postTweetWithImage({
        text: caption,
        imageUrl: imageUrl
      });
      
      if (result.ok && result.tweetId) {
        setPostResult({ 
          success: true, 
          message: 'Successfully posted to X!',
          tweetId: result.tweetId
        });
      } else {
        const errorMessage = result.error || 'Failed to post to X';
        setPostResult({ success: false, message: errorMessage });
      }
    } catch (error) {
      setPostResult({ success: false, message: 'An unexpected error occurred while posting' });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostToXIntent = () => {
    // Fallback: open Twitter intent URL
    const tweetText = encodeURIComponent(caption);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center p-6">
      {/* Back button */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="absolute top-6 left-6 text-white hover:bg-white/10 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Canvas
      </Button>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Poster */}
        <div className="flex items-center justify-center">
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
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
            <h2 className="text-3xl font-bold text-white mb-2">
              Your Marketing Poster is Ready! 🎉
            </h2>
            <p className="text-white/70">
              Generate a caption and share it on social media
            </p>
          </div>

          {/* Caption section */}
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Social Media Caption</label>
                <Button
                  onClick={generateCaption}
                  disabled={isGeneratingCaption}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
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
                className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
              />
              
              <div className="text-white/50 text-sm">
                {caption.length}/280 characters
              </div>
            </div>
          </Card>

          {/* Post Result */}
          {postResult && (
            <Card className={`p-4 ${postResult.success 
              ? 'bg-green-500/20 border-green-400/30' 
              : 'bg-red-500/20 border-red-400/30'
            } backdrop-blur-lg`}>
              <div className="flex items-start gap-3">
                {postResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    postResult.success ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {postResult.message}
                  </p>
                  {postResult.success && postResult.tweetId && (
                    <div className="mt-2 pt-2 border-t border-green-400/30">
                      <p className="text-xs text-green-300">
                        Tweet ID: {postResult.tweetId}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-green-300 hover:text-green-200"
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

          {/* Post buttons */}
          <div className="space-y-3">
            <Button
              onClick={handlePostToX}
              disabled={!caption.trim() || isPosting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white py-4 text-lg font-semibold border-0 shadow-lg shadow-blue-500/25"
            >
              {isPosting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Posting with Image...
                </>
              ) : (
                <>
                  <Twitter className="w-5 h-5 mr-3" />
                  Post to X with Image
                </>
              )}
            </Button>
            
            <Button
              onClick={handlePostToXIntent}
              disabled={!caption.trim()}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 py-3"
            >
              <Share className="w-4 h-4 mr-2" />
              Open X in Browser
            </Button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-white/60 text-sm">
              <Badge variant="secondary" className="mr-2">Direct Post</Badge>
              Posts immediately using X API
            </p>
            <p className="text-white/50 text-xs">
              Image will be included automatically • Or use browser option for manual posting
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}