"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { ComponentSidebar } from "@/components/component-sidebar"
import { CampaignCanvas } from "@/components/campaign-canvas"
import { GenerationPanel } from "@/components/generation-panel"
import { Header } from "@/components/header"

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

  const handleAddComponent = useCallback(
    (component: {
      id: string
      name: string
      category: string
      color: string
    }) => {
      const angle = selectedComponents.length * 60 * (Math.PI / 180)
      const radius = 180
      const centerX = 300
      const centerY = 300

      const position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }

      setSelectedComponents((prev) => [...prev, { ...component, position }])
    },
    [selectedComponents.length],
  )

  const handleRemoveComponent = useCallback((id: string) => {
    setSelectedComponents((prev) => prev.filter((comp) => comp.id !== id))
  }, [])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)

    // Simulate AI generation process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock generated image
    setGeneratedImage("/ai-generated-campaign-poster.jpg")
    setIsGenerating(false)
  }, [])

  const handleComponentsGenerated = useCallback((components: CampaignComponent[]) => {
    setGeneratedComponents(components)
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
      <Header />

      <div className="flex h-[calc(100vh-4rem)]">
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
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <GenerationPanel
              isGenerating={isGenerating}
              generatedImage={generatedImage}
              selectedComponents={selectedComponents}
              onGenerate={handleGenerate}
              onComponentsGenerated={handleComponentsGenerated}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
