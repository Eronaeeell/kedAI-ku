"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Sparkles } from "lucide-react"
import { generateImagePrompt } from "@/lib/prompt-generator"

interface SelectedComponent {
  id: string
  name: string
  category: string
  color: string
  position: { x: number; y: number }
}

interface CampaignCanvasProps {
  selectedComponents: SelectedComponent[]
  onRemoveComponent: (id: string) => void
  isGenerating: boolean | string
  onGenerate: (status: string) => void
  showPreview?: boolean
}

export function CampaignCanvas({
  selectedComponents,
  onRemoveComponent,
  isGenerating,
  onGenerate,
  showPreview = false,
}: CampaignCanvasProps) {
  
  // Add custom CSS for abstract spinning animations during generation
  const customStyles = `
    @keyframes orbit-spin {
      from { transform: translate(-50%, -50%) rotate(0deg) translateX(20px) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg) translateX(20px) rotate(-360deg); }
    }
    @keyframes wobble-spin {
      0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
      25% { transform: translate(-50%, -50%) rotate(90deg) scale(1.1); }
      50% { transform: translate(-50%, -50%) rotate(180deg) scale(0.95); }
      75% { transform: translate(-50%, -50%) rotate(270deg) scale(1.05); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `
  
  const handleGenerateImage = async () => {
    if (selectedComponents.length === 0) return

    // Start generating state
    onGenerate("GENERATING")
    
    try {
      // Send components directly to API - OpenRouter will generate the prompt, then Stability AI will use it
      console.log('🎨 Starting image generation with components:', selectedComponents)
      console.log('📡 Components being sent to OpenRouter for prompt generation...')
      console.log('🤖 Using Stability AI Ultra model for highest quality promotional posters')
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: selectedComponents,
          model: 'ultra' // Use Ultra for highest quality promotional posters
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      // Call the parent's onGenerate with the generated image URL
      onGenerate(data.imageUrl)
      console.log('✅ Image generation completed successfully')
      
    } catch (error) {
      console.error('Error generating image:', error)
      // Reset generating state on error
      onGenerate("ERROR")
      // Reset to normal state after 3 seconds
      setTimeout(() => onGenerate("RESET"), 3000)
    }
  }
  return (
    <div className="flex-1 p-8 relative flex flex-col transition-all duration-300 ease-out">
      <style jsx>{customStyles}</style>
      {/* Background gradient blob */}
      <div className="absolute inset-[-100px] flex items-center justify-center pointer-events-none">
        <div
          className={[
            "w-[600px] h-[600px] rounded-full gradient-purple-blue opacity-15 blur-[100px]",
            isGenerating ? "animate-pulse animate-spin" : "",
          ].join(" ")}
          style={isGenerating ? {
            animationDuration: '2s, 8s',
            transform: 'scale(1.2)',
          } : {}}
        />
        {isGenerating && (
          <>
            <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-[80px] animate-spin [animation-duration:6s] [animation-direction:reverse]" />
            <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/5 to-teal-500/5 blur-[120px] animate-pulse [animation-duration:3s]" />
          </>
        )}
      </div>

      {/* Central campaign area */}
      <div className="flex-1 relative flex items-center justify-center pt-30">
        <div className="relative transition-all duration-300 ease-out">
          <div className="relative w-70 h-70 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div
              className={[
                "absolute inset-[-40px]",
                "rounded-[70%_30%_40%_60%_/_50%_70%_30%_50%]",
                "backdrop-blur-[60px] border",
                isGenerating
                  ? [
                      "animate-spin animate-pulse animate-morph",
                      "bg-[linear-gradient(135deg,rgba(236,72,153,0.5),rgba(147,51,234,0.45),rgba(59,130,246,0.5))]",
                      "border-pink-400/30",
                      "shadow-[0_12px_48px_rgba(236,72,153,0.7),inset_0_2px_0_rgba(255,255,255,0.4)]",
                    ].join(" ")
                  : [
                      "animate-spin-slow animate-morph",
                      "bg-[linear-gradient(135deg,rgba(147,51,234,0.4),rgba(59,130,246,0.35),rgba(6,182,212,0.4))]",
                      "border-white/20",
                      "shadow-[0_12px_48px_rgba(147,51,234,0.5),inset_0_2px_0_rgba(255,255,255,0.3)]",
                    ].join(" "),
              ].join(" ")}
              style={isGenerating ? { animationDuration: '2s, 1s, 3s' } : {}}
            />

            {/* Primary Liquid Glass Effects */}
            <div
              className={[
                "absolute inset-[-30px]",
                "rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]",
                "backdrop-blur-[40px] border",
                isGenerating
                  ? [
                      "bg-[linear-gradient(135deg,rgba(236,72,153,0.4),rgba(147,51,234,0.35),rgba(59,130,246,0.4))]",
                      "border-pink-400/20",
                      "shadow-[0_8px_32px_rgba(236,72,153,0.7),inset_0_1px_0_rgba(255,255,255,0.3)]",
                      "animate-spin animate-morph animate-pulse",
                    ].join(" ")
                  : [
                      "bg-[linear-gradient(135deg,rgba(147,51,234,0.35),rgba(59,130,246,0.3),rgba(6,182,212,0.35))]",
                      "border-white/15",
                      "shadow-[0_8px_32px_rgba(147,51,234,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]",
                      "animate-morph animate-liquid-float",
                    ].join(" "),
              ].join(" ")}
              style={isGenerating ? { animationDuration: '3s, 2s, 1.5s', animationDirection: 'reverse' } : {}}
            />

            {/* Secondary liquid glass layer */}
            <div
              className={[
                "absolute inset-[-15px]",
                "rounded-[40%_60%_70%_30%_/_40%_70%_30%_60%]",
                "backdrop-blur-lg border",
                "bg-[linear-gradient(45deg,rgba(236,72,153,0.3),rgba(147,51,234,0.25),rgba(59,130,246,0.3))]",
                "border-white/10",
                "shadow-[0_4px_16px_rgba(236,72,153,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]",
                isGenerating ? "animate-spin animate-morph animate-bounce" : "animate-morph",
              ].join(" ")}
              style={isGenerating ? { animationDuration: '4s, 2.5s, 2s', animationDirection: 'alternate' } : {}}
            />

            {/* Inner spinning accent ring */}
            <div
              className={[
                "absolute inset-[5px]",
                "rounded-[50%_40%_60%_50%_/_40%_60%_40%_60%]",
                "border border-white/10 backdrop-blur-[15px]",
                "bg-[linear-gradient(225deg,rgba(168,85,247,0.25),rgba(34,197,94,0.2),rgba(251,146,60,0.25))]",
                "shadow-[0_2px_12px_rgba(168,85,247,0.3)]",
                isGenerating
                  ? "animate-spin animate-morph animate-pulse [animation-direction:reverse]"
                  : "animate-morph animate-spin-slow [animation-direction:reverse]",
              ].join(" ")}
              style={isGenerating ? { 
                animationDuration: '1s, 1.5s, 0.8s',
                transform: 'rotate(0deg) scale(1.05)'
              } : {}}
            />

            {/* Inner glass orb - only show when no image */}
            {!(typeof isGenerating === 'string' && isGenerating.startsWith('data:image')) && (
              <div
                className={[
                  "absolute inset-[20px] rounded-full backdrop-blur-md",
                  "bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(147,51,234,0.1),rgba(59,130,246,0.08))]",
                  "border border-white/25",
                  "shadow-[0_4px_16px_rgba(147,51,234,0.2),inset_0_2px_0_rgba(255,255,255,0.4)]",
                ].join(" ")}
              />
            )}

            <div className="relative z-10 text-center w-full h-full flex items-center justify-center">
              {typeof isGenerating === 'string' && isGenerating.startsWith('data:image') ? (
                <div 
                  className="w-60 h-60 rounded-full overflow-hidden cursor-pointer hover:scale-105 hover:shadow-3xl transition-all duration-500 shadow-2xl border-4 border-white/40 backdrop-blur-sm relative group"
                  onClick={() => {
                    console.log('🖼️ Image clicked, showing preview for:', isGenerating)
                    // Show preview layout instead of modal
                    onGenerate(`PREVIEW:${isGenerating}`)
                  }}
                >
                  <img 
                    src={isGenerating as string} 
                    alt="Generated Campaign" 
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                      Click to preview
                    </div>
                  </div>
                </div>
              ) : (
                <h3 className="text-xl font-semibold text-white drop-shadow-lg backdrop-blur-sm">
                  {isGenerating === "GENERATING" ? "Generating..." : "October's Campaign"}
                </h3>
              )}
            </div>
          </div>

          {selectedComponents.map((component, index) => {
            const angle = (index * (360 / Math.max(selectedComponents.length, 1)) * Math.PI) / 180
            const radius = 200
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle)

            const getComponentColors = (category: string) => {
              switch (category) {
                case "Local Data":
                  return {
                    bg: "bg-gradient-to-br from-blue-500/20 via-teal-500/15 to-cyan-500/20",
                    border: "border-teal-400/40",
                    shadow: "shadow-teal-500/25",
                    text: "text-white font-semibold drop-shadow-lg",
                  }
                case "Online trend data":
                  return {
                    bg: "bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-blue-500/20",
                    border: "border-purple-400/40",
                    shadow: "shadow-purple-500/25",
                    text: "text-white font-semibold drop-shadow-lg",
                  }
                case "Campaign Type":
                  return {
                    bg: "bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-orange-500/20",
                    border: "border-pink-400/40",
                    shadow: "shadow-pink-500/25",
                    text: "text-white font-semibold drop-shadow-lg",
                  }
                case "Custom":
                  return {
                    bg: "bg-gradient-to-br from-yellow-300/20 via-lime-300/15 to-emerald-300/20",
                    border: "border-yellow-400/40",
                    shadow: "shadow-emerald-500/25",
                    text: "text-white font-semibold drop-shadow-lg",
                  }
                default:
                  return {
                    bg: "bg-gradient-to-br from-slate-500/20 via-gray-500/15 to-zinc-500/20",
                    border: "border-slate-400/30",
                    shadow: "shadow-slate-500/20",
                    text: "text-white font-semibold drop-shadow-lg",
                  }
              }
            }

            const colors = getComponentColors(component.category)

            return (
              <div
                key={component.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 animate-float cursor-pointer"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${index * 0.2}s`,
                  zIndex: 10 + index,
                }}
              >
                <div className="relative group">
                  {/* Liquid glass style chip */}
                  <div
                    className={[
                      "relative px-4 py-3 rounded-xl backdrop-blur-md border shadow-lg hover:shadow-xl transition-all duration-300 min-w-[100px]",
                      colors.bg,
                      colors.border,
                      colors.shadow,
                    ].join(" ")}
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm" />
                    <div className="relative z-10">
                      <p className={["text-sm text-center leading-tight", colors.text].join(" ")}>
                        {component.name}
                      </p>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-red-400/50 shadow-lg z-50 flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('🔴 Remove button clicked for component:', component.name, 'ID:', component.id)
                      onRemoveComponent(component.id)
                    }}
                    aria-label={`Remove ${component.name}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!showPreview && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50">
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating === "GENERATING" || selectedComponents.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg min-w-[120px]"
          >
            {isGenerating === "GENERATING" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate ({selectedComponents.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
