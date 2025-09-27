"use client"

import { useState, useEffect } from "react"
import { ForecastAnalysis } from "./forecast-analysis"
import { Loader2, X } from "lucide-react"
import { Button } from "./ui/button"

interface ForecastAnalysisData {
  engagement: {
    likes: number
    shares: number
    comments: number
  }
  salesForecast: Array<{
    period: string
    value: number
    currency: 'MYR' | 'USD'
  }>
  overallScore: number
}

interface CampaignAnalysis {
  components: any[]
  insights: string[]
  recommendations: string[]
  weatherImpact: string
  trendImpact: string
  salesImpact: string
  eventImpact: string
}

interface ForecastSidebarProps {
  isOpen: boolean
  onClose: () => void
  campaignAnalysis: CampaignAnalysis | null
  selectedComponents: Array<{
    id: string
    name: string
    category: string
    color: string
    position: { x: number; y: number }
  }>
}

export function ForecastSidebar({ 
  isOpen, 
  onClose, 
  campaignAnalysis, 
  selectedComponents 
}: ForecastSidebarProps) {
  const [forecastAnalysis, setForecastAnalysis] = useState<ForecastAnalysisData | null>(null)
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false)

  const generateForecastAnalysis = async (campaignData: CampaignAnalysis) => {
    console.log("Starting forecast analysis generation...")
    setIsGeneratingForecast(true)
    
    try {
      const response = await fetch("/api/generate-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          campaignAnalysis: campaignData,
          selectedComponents: selectedComponents
        }),
      })

      const result = await response.json()
      console.log("Forecast API response:", result)

      if (result.success) {
        setForecastAnalysis(result.data)
      } else {
        console.error("Forecast generation failed:", result.message)
        // Show error message to user
        setForecastAnalysis(null)
      }
    } catch (err) {
      console.error("Error generating forecast analysis:", err)
    } finally {
      setIsGeneratingForecast(false)
    }
  }

  // Generate forecast when sidebar opens
  useEffect(() => {
    if (isOpen && campaignAnalysis && !forecastAnalysis) {
      generateForecastAnalysis(campaignAnalysis)
    }
  }, [isOpen, campaignAnalysis])

  if (!isOpen) return null

  return (
    <div className="w-80 bg-sidebar/95 backdrop-blur-xl border-l border-border/50 h-full overflow-hidden flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Forecast Analysis</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isGeneratingForecast ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <h3 className="text-lg font-semibold">Generating Forecast Analysis...</h3>
            <p className="text-sm text-muted-foreground text-center">
              AI is analyzing your campaign's potential performance...
            </p>
          </div>
        ) : forecastAnalysis ? (
          <ForecastAnalysis analysis={forecastAnalysis} />
        ) : selectedComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold">Select Components First</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please select at least one component from the left sidebar to generate forecast analysis.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              No forecast data available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
