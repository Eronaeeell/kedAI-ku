"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Sparkles } from "lucide-react"

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
  isGenerating: boolean
  onGenerate: () => void
}

export function CampaignCanvas({
  selectedComponents,
  onRemoveComponent,
  isGenerating,
  onGenerate,
}: CampaignCanvasProps) {
  return (
    <div className="flex-1 p-8 relative flex flex-col transition-all duration-300 ease-out">
      {/* Background gradient blob - positioned to extend beyond container */}
      <div className="absolute inset-[-100px] flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[600px] rounded-full gradient-purple-blue opacity-15 blur-[100px] ${isGenerating ? "animate-pulse" : ""}`}
        />
      </div>

      {/* Central campaign area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="relative transition-all duration-300 ease-out">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div
              className={`absolute inset-[-20px] rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-400 opacity-80 blur-sm ${
                isGenerating ? "animate-spin" : ""
              }`}
              style={{
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                animation: isGenerating
                  ? "spin 3s linear infinite, morph 6s ease-in-out infinite"
                  : "morph 6s ease-in-out infinite",
              }}
            />
            <div
              className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-pink-400 via-purple-500 to-blue-500 opacity-60 blur-md"
              style={{
                borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%",
                animation: "morph 8s ease-in-out infinite reverse",
              }}
            />

            <div className="relative z-10 text-center">
              <h3 className="text-xl font-semibold text-white drop-shadow-lg">October's Campaign</h3>
            </div>
          </div>

          {selectedComponents.map((component, index) => {
            const angle = index * (360 / Math.max(selectedComponents.length, 1)) * (Math.PI / 180)
            const radius = 200
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle)

            return (
              <div
                key={component.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-float"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                {/* Simple rectangular card with text only */}
                <Card className="px-4 py-3 bg-card/90 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-200 group min-w-[100px]">
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 rounded-full bg-destructive hover:bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveComponent(component.id)}
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </Button>

                    <p className="text-sm text-center text-card-foreground font-medium leading-tight">
                      {component.name}
                    </p>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-6 right-6">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || selectedComponents.length === 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      <style jsx>{`
        @keyframes morph {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
          }
          75% {
            border-radius: 60% 40% 60% 30% / 60% 30% 60% 40%;
          }
        }
      `}</style>
    </div>
  )
}
