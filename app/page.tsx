"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { ComponentSidebar } from "@/components/component-sidebar"
import { CampaignCanvas } from "@/components/campaign-canvas"
import { GenerationPanel } from "@/components/generation-panel"
import { Header } from "@/components/header"

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

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Component Sidebar */}
        <ComponentSidebar onAddComponent={handleAddComponent} />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div style={{ height: `calc(100% - ${panelHeight}px)` }} className="transition-all duration-300 ease-out">
            <CampaignCanvas
              selectedComponents={selectedComponents}
              onRemoveComponent={handleRemoveComponent}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </div>

          <div
            className="h-px bg-gradient-to-r from-transparent via-border/20 to-transparent hover:via-border/40 cursor-row-resize transition-all duration-200 relative"
            onMouseDown={handleResize}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>

          <div style={{ height: `${panelHeight}px` }} className="transition-all duration-300 ease-out">
            <GenerationPanel
              isGenerating={isGenerating}
              generatedImage={generatedImage}
              selectedComponents={selectedComponents}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
