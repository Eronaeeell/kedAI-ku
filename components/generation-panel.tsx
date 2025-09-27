"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Download, Share, Twitter, Sparkles, CheckCircle, AlertCircle, ExternalLink, Loader2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { XService } from "@/lib/x-service"

interface SelectedComponent {
  id: string
  name: string
  category: string
  color: string
  position: { x: number; y: number }
}

interface CampaignComponent {
  id: string
  type: 'local_data' | 'online_trend' | 'campaign_type'
  title: string
  description: string
  data: any
  relevanceScore: number
  category: string
  keywords: string[]
  impact: 'high' | 'medium' | 'low'
}

interface CampaignAnalysis {
  components: CampaignComponent[]
  insights: string[]
  recommendations: string[]
  weatherImpact: string
  trendImpact: string
  salesImpact: string
  eventImpact: string
}

interface GenerationPanelProps {
  isGenerating: boolean
  generatedImage: string | null
  selectedComponents: SelectedComponent[]
  onGenerate: (imageUrl: string) => void
  onComponentsGenerated?: (components: CampaignComponent[]) => void
}

export function GenerationPanel({
  isGenerating,
  generatedImage,
  selectedComponents,
  onGenerate,
  onComponentsGenerated,
}: GenerationPanelProps) {
  const [quickCaption, setQuickCaption] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<{
    success: boolean;
    message: string;
    tweetId?: string;
  } | null>(null);

  const generateQuickCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          components: selectedComponents
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuickCaption(data.caption);
      } else {
        const componentNames = selectedComponents.map(c => c.name).join(', ');
        setQuickCaption(`🎉 Check out our amazing ${componentNames}! ☕✨ #CafeLife #Coffee`);
      }
    } catch (error) {
      const componentNames = selectedComponents.map(c => c.name).join(', ');
      setQuickCaption(`🎉 Check out our amazing ${componentNames}! ☕✨ #CafeLife #Coffee`);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleQuickPost = async () => {
    if (!quickCaption.trim()) {
      setPostResult({ success: false, message: 'Please generate or enter a caption first' });
      return;
    }

    if (quickCaption.length > 280) {
      setPostResult({ success: false, message: 'Caption exceeds 280 character limit' });
      return;
    }

    setIsPosting(true);
    setPostResult(null);

    try {
      // Post with image if available
      const result = await XService.postTweetWithImage({
        text: quickCaption,
        imageUrl: generatedImage || undefined
      });
      
      if (result.ok && result.tweetId) {
        setPostResult({ 
          success: true, 
          message: 'Successfully posted to X!',
          tweetId: result.tweetId
        });
        // Clear caption after successful post
        setQuickCaption('');
      } else {
        setPostResult({ success: false, message: result.error || 'Failed to post to X' });
      }
    } catch (error) {
      setPostResult({ success: false, message: 'An unexpected error occurred while posting' });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto leading-5">
      <div className="max-w-4xl mx-auto h-full overflow-y-auto no-scrollbar">
        <div className="mt-4 space-y-4 pb-6">

          {/* Loading State */}
          {isGenerating && (
            <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
              <label className="text-sm font-medium text-card-foreground">Generating Image...</label>
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-3" />
                <span className="text-sm text-muted-foreground">Please wait, creating your campaign image...</span>
              </div>
            </div>
          )}

          {/* Image Actions */}
          {generatedImage && generatedImage !== "GENERATING" && generatedImage !== "ERROR" && (
            <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
              <label className="text-sm font-medium text-card-foreground">Campaign Generated Successfully!</label>
              <p className="text-sm text-muted-foreground">
                Your campaign image is displayed in the circle above. Click on the circle to view the full preview.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = generatedImage
                    link.download = 'campaign-poster.jpg'
                    link.click()
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.share?.({
                      title: 'Marketing Campaign Poster',
                      text: 'Check out this AI-generated marketing campaign!',
                      url: generatedImage
                    }).catch(() => {
                      // Fallback: copy to clipboard
                      navigator.clipboard?.writeText(generatedImage)
                    })
                  }}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}

          {/* Quick Post to X */}
          {generatedImage && selectedComponents.length > 0 && (
            <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-500" />
                  Quick Post to X
                </label>
                <Button
                  onClick={generateQuickCaption}
                  disabled={isGeneratingCaption}
                  size="sm"
                  variant="outline"
                  className="border-primary/20 hover:border-primary/40"
                >
                  {isGeneratingCaption ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                value={quickCaption}
                onChange={(e) => setQuickCaption(e.target.value)}
                placeholder="Click 'Generate' to create a caption or write your own..."
                className="min-h-[80px] bg-background/50 border-border/30 resize-none text-sm"
                maxLength={300}
              />
              
              <div className="flex items-center justify-between text-xs">
                <Badge variant={quickCaption.length > 280 ? "destructive" : "secondary"}>
                  {280 - quickCaption.length} characters remaining
                </Badge>
                <span className={quickCaption.length > 280 ? 'text-destructive' : 'text-muted-foreground'}>
                  {quickCaption.length}/280
                </span>
              </div>

              {/* Post Result */}
              {postResult && (
                <div className={`p-3 rounded-lg ${
                  postResult.success 
                    ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                    : 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {postResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        postResult.success 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {postResult.message}
                      </p>
                      {postResult.success && postResult.tweetId && (
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
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
                </div>
              )}

              <Button
                onClick={handleQuickPost}
                disabled={!quickCaption.trim() || isPosting || quickCaption.length > 280}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25 border-0"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting with Image...
                  </>
                ) : (
                  <>
                    <Twitter className="w-4 h-4 mr-2" />
                    Post to X with Image
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                💡 Your generated campaign image will be included with the post automatically
              </p>
            </div>
          )}


          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-4 space-y-4">
              <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Analysis Complete</h3>
                </div>
                
                {/* Insights */}
                {analysisResult.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Insights:</h4>
                    <ul className="text-sm space-y-1">
                      {analysisResult.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                    <ul className="text-sm space-y-1">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Impact Analysis */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Weather:</span>
                    <p className="text-muted-foreground">{analysisResult.weatherImpact}</p>
                  </div>
                  <div>
                    <span className="font-medium">Trends:</span>
                    <p className="text-muted-foreground">{analysisResult.trendImpact}</p>
                  </div>
                  <div>
                    <span className="font-medium">Sales:</span>
                    <p className="text-muted-foreground">{analysisResult.salesImpact}</p>
                  </div>
                  <div>
                    <span className="font-medium">Events:</span>
                    <p className="text-muted-foreground">{analysisResult.eventImpact}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-4">
              <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50 border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-700">Error</h3>
                </div>
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setError(null)}
                  className="w-fit"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
