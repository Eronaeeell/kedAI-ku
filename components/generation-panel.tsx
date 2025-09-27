"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

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

interface EngagementForecast {
  likes: number
  shares: number
  comments: number
}

interface SalesDataPoint {
  period: string
  value: number
  currency: 'MYR' | 'USD'
}

interface ForecastAnalysisData {
  engagement: EngagementForecast
  salesForecast: SalesDataPoint[]
  overallScore: number
}

interface GenerationPanelProps {
  isGenerating: boolean
  generatedImage: string | null
  selectedComponents: SelectedComponent[]
  onGenerate: (prompt: string) => void
  onComponentsGenerated?: (components: CampaignComponent[]) => void
  onCampaignAnalysisGenerated?: (analysis: CampaignAnalysis) => void
}

export function GenerationPanel({
  isGenerating,
  generatedImage,
  selectedComponents,
  onGenerate,
  onComponentsGenerated,
  onCampaignAnalysisGenerated,
}: GenerationPanelProps) {
  const [prompt, setPrompt] = useState(
    "Based on September's sales data, current cafe food & beverages trend, and weather prediction, can you help to generate a campaign plan for October to boost my sales?",
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<CampaignAnalysis | null>(null)
  const [forecastAnalysis, setForecastAnalysis] = useState<ForecastAnalysisData | null>(null)
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false)
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setForecastAnalysis(null)

    try {
      const response = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result.data)
        onComponentsGenerated?.(result.data.components)
        onCampaignAnalysisGenerated?.(result.data)

        toast.success("Campaign generated", {
          description: `Created ${result.data.components?.length ?? 0} component(s) with insights.`,
          duration: 3500,
        })
      } else {
        const msg = result.message || "Failed to generate campaign"
        setError(msg)
        toast.error("Generation failed", { description: msg })
      }
    } catch (err) {
      setError("Network error occurred")
      toast.error("Network error", { description: "Please try again." })
      console.error("Error generating campaign:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function stripMarkdownBold(text: string) {
    return text.replace(/\*\*/g, "")
  }

  const handleSend = () => handleGenerate()

  return (
    <div className="h-full overflow-hidden leading-5">
      <div className="max-w-4xl mx-auto h-full overflow-y-auto no-scrollbar">
        <div className="mt-4">
          <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
            <label className="text-sm font-medium text-card-foreground">Campaign Brief</label>
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your campaign goals and requirements..."
                className="min-h-[60px] bg-background/50 border-border/50 focus:border-primary/50 pr-12"
                disabled={isAnalyzing}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute bottom-2 right-2 w-8 h-8 p-0"
                onClick={handleSend}
                disabled={isAnalyzing || !prompt.trim()}
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {analysisResult && (
            <div className="mt-4">
              <div className="text-card-foreground rounded-xl border shadow-sm bg-background/50 border-border/50">
                {/* Analysis Header - Always Visible */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/30 transition-colors"
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Analysis Complete</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAnalysisExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Collapsible Analysis Content */}
                {isAnalysisExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                    {analysisResult.insights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Insights:</h4>
                        <ul className="text-sm space-y-1">
                          {analysisResult.insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>{stripMarkdownBold(insight)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <ul className="text-sm space-y-1">
                          {analysisResult.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>{stripMarkdownBold(rec)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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
                )}
              </div>
            </div>
          )}


          {error && (
            <div className="mt-4">
              <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50 border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-700">Error</h3>
                </div>
                <p className="text-sm text-red-600">{error}</p>
                <Button size="sm" variant="outline" onClick={() => setError(null)} className="w-fit">
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
