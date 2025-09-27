"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { ComponentSidebar } from "@/components/component-sidebar"
import { CampaignCanvas } from "@/components/campaign-canvas"
import { GenerationPanel } from "@/components/generation-panel"
import { PosterPreview } from "@/components/poster-preview"
import { Header } from "@/components/header"
import { ForecastSidebar } from "@/components/forecast-sidebar"
import { PostsSidebar } from "@/components/posts-sidebar"

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

export default function HomePage() {
  const [selectedComponents, setSelectedComponents] = useState<
    Array<{
      id: string
      name: string
      category: string
      color: string
      position: { x: number; y: number }
    }>
  >([])

  const [generatedComponents, setGeneratedComponents] = useState<CampaignComponent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [panelHeight, setPanelHeight] = useState(300)
  const [showPreview, setShowPreview] = useState(false)
  const [showForecastSidebar, setShowForecastSidebar] = useState(false)
  const [showPostsSidebar, setShowPostsSidebar] = useState(false)
  const [campaignAnalysis, setCampaignAnalysis] = useState<any>(null)

  const handleAddComponent = useCallback(
    (component: {
      id: string
      name: string
      category: string
      color: string
    }) => {
      setSelectedComponents((prev) => {
        // Check if component already exists
        const existingComponent = prev.find(comp => comp.id === component.id)
        if (existingComponent) {
          console.log('⚠️ Component already exists, not adding:', component.name, 'ID:', component.id)
          return prev
        }

        const angle = prev.length * 60 * (Math.PI / 180)
        const radius = 180
        const centerX = 300
        const centerY = 300

        const position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }

        console.log('➕ Adding component:', component.name, 'ID:', component.id, 'Position:', position)
        return [...prev, { ...component, position }]
      })
    },
    [],
  )

  const handleRemoveComponent = useCallback((id: string) => {
    console.log('🗑️ Attempting to remove component with ID:', id)
    setSelectedComponents((prev) => {
      const componentExists = prev.some(comp => comp.id === id)
      if (!componentExists) {
        console.log('⚠️ Component not found in current list:', id)
        return prev
      }
      
      const filteredComponents = prev.filter((comp) => {
        const shouldKeep = comp.id !== id
        console.log(`  - Component "${comp.name}" (ID: "${comp.id}") - ${shouldKeep ? 'KEEP' : 'REMOVE'}`)
        return shouldKeep
      })
      console.log('✅ Components after removal:', filteredComponents.map(c => `${c.name} (${c.id})`))
      return filteredComponents
    })
  }, [])

  const handleGenerate = useCallback((imageUrl: string | boolean) => {
    if (imageUrl === "GENERATING") {
      setIsGenerating(true)
      setGeneratedImage(null) // Clear previous image
      setShowPreview(false) // Close preview if open
    } else if (imageUrl === "ERROR") {
      setIsGenerating(false)
      // Keep previous image if any
    } else if (typeof imageUrl === 'string' && imageUrl.startsWith("PREVIEW:")) {
      // Show preview mode
      const actualImageUrl = imageUrl.replace("PREVIEW:", "")
      setGeneratedImage(actualImageUrl)
      setShowPreview(true)
    } else if (imageUrl === false || imageUrl === "RESET") {
      // Reset to normal state
      setIsGenerating(false)
      setShowPreview(false)
    } else if (typeof imageUrl === 'string') {
      // Set the generated image URL and stop generating
      setGeneratedImage(imageUrl)
      setIsGenerating(false)
    }
  }, [])

  const handleComponentsGenerated = useCallback((components: CampaignComponent[]) => {
    setGeneratedComponents(components)
  }, [])

  const handleCampaignAnalysisGenerated = useCallback((analysis: any) => {
    setCampaignAnalysis(analysis)
  }, [])

  const handleResize = useCallback(
    (e: React.MouseEvent) => {
      const startY = e.clientY
      const startHeight = panelHeight

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = startY - e.clientY
        const newHeight = Math.max(200, Math.min(600, startHeight + deltaY))
        setPanelHeight(newHeight)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [panelHeight],
  )

  return (
    <div className="h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30 overflow-hidden">
      <Header onHistoryClick={() => setShowPostsSidebar(true)} />

      {/* Show preview overlay if enabled */}
      {showPreview && generatedImage && (
        <PosterPreview
          imageUrl={generatedImage}
          onBack={() => setShowPreview(false)}
          selectedComponents={selectedComponents}
        />
      )}

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Component Sidebar */}
        <ComponentSidebar
          onAddComponent={handleAddComponent}
          onRemoveFromCanvas={handleRemoveComponent}
          generatedComponents={generatedComponents}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-[2] min-h-0">
            <CampaignCanvas
              selectedComponents={selectedComponents}
              onRemoveComponent={handleRemoveComponent}
              isGenerating={isGenerating ? "GENERATING" : (generatedImage || false)}
              onGenerate={handleGenerate}
              showPreview={showPreview}
              onForecastAnalysisClick={() => setShowForecastSidebar(true)}
            />
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <GenerationPanel
              isGenerating={isGenerating}
              generatedImage={generatedImage}
              selectedComponents={selectedComponents}
              onGenerate={handleGenerate}
              onComponentsGenerated={handleComponentsGenerated}
              onCampaignAnalysisGenerated={handleCampaignAnalysisGenerated}
            />
          </div>
        </div>

        {/* Forecast Sidebar */}
        {showForecastSidebar && selectedComponents.length > 0 && (
          <ForecastSidebar
            isOpen={showForecastSidebar}
            onClose={() => setShowForecastSidebar(false)}
            campaignAnalysis={campaignAnalysis}
            selectedComponents={selectedComponents}
          />
        )}

        {/* Posts Sidebar */}
        {showPostsSidebar && (
          <PostsSidebar
            isOpen={showPostsSidebar}
            onClose={() => setShowPostsSidebar(false)}
          />
        )}
      </div>
    </div>
  )
}
