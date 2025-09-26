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
      <div className="flex-1 relative flex items-center justify-center pt-30">
        <div className="relative transition-all duration-300 ease-out">
          <div className="relative w-70 h-70 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div
              className={`absolute inset-[-40px] rounded-full ${
                isGenerating ? "animate-pulse" : "animate-spin-slow"
              }`}
              style={{
                background: isGenerating 
                  ? "linear-gradient(135deg, rgba(236, 72, 153, 0.5), rgba(147, 51, 234, 0.45), rgba(59, 130, 246, 0.5))"
                  : "linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(59, 130, 246, 0.35), rgba(6, 182, 212, 0.4))",
                backdropFilter: "blur(60px)",
                border: isGenerating ? "2px solid rgba(236, 72, 153, 0.3)" : "2px solid rgba(255, 255, 255, 0.2)",
                boxShadow: isGenerating 
                  ? "0 12px 48px rgba(236, 72, 153, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.4)"
                  : "0 12px 48px rgba(147, 51, 234, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)",
                borderRadius: "70% 30% 40% 60% / 50% 70% 30% 50%",
                animation: isGenerating 
                  ? "energyPulse 1s ease-in-out infinite, morph 3s ease-in-out infinite"
                  : "spin 8s linear infinite, morph 5s ease-in-out infinite"
              }}
            />

            {/* Primary Liquid Glass Background Effects */}
            <div
              className={`absolute inset-[-30px] rounded-full ${
                isGenerating ? "" : "liquid-glass-primary"
              }`}
              style={{
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                background: isGenerating
                  ? "linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(147, 51, 234, 0.35), rgba(59, 130, 246, 0.4))"
                  : "linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.35))",
                backdropFilter: "blur(40px)",
                border: isGenerating ? "1.5px solid rgba(236, 72, 153, 0.2)" : "1.5px solid rgba(255, 255, 255, 0.15)",
                boxShadow: isGenerating
                  ? "0 8px 32px rgba(236, 72, 153, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                  : "0 8px 32px rgba(147, 51, 234, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                animation: isGenerating
                  ? "energyWave 2s ease-in-out infinite, morph 4s ease-in-out infinite"
                  : "morph 6s ease-in-out infinite, liquidFloat 4s ease-in-out infinite"
              }}
            />
            
            {/* Secondary liquid glass layer */}
            <div
              className="absolute inset-[-15px] rounded-full liquid-glass-secondary backdrop-blur-lg"
              style={{
                borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%",
                background: "linear-gradient(45deg, rgba(236, 72, 153, 0.3), rgba(147, 51, 234, 0.25), rgba(59, 130, 246, 0.3))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 4px 16px rgba(236, 72, 153, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
              }}
            />

            {/* Inner spinning accent ring */}
            <div
              className={`absolute inset-[5px] rounded-full ${
                isGenerating ? "animate-spin" : ""
              }`}
              style={{
                background: "linear-gradient(225deg, rgba(168, 85, 247, 0.25), rgba(34, 197, 94, 0.2), rgba(251, 146, 60, 0.25))",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 2px 12px rgba(168, 85, 247, 0.3)",
                borderRadius: "50% 40% 60% 50% / 40% 60% 40% 60%",
                animation: isGenerating 
                  ? "spin 1.5s linear infinite reverse, morph 7s ease-in-out infinite"
                  : "spin 12s linear infinite reverse, morph 7s ease-in-out infinite"
              }}
            />

            {/* Inner glass orb */}
            <div
              className="absolute inset-[20px] rounded-full backdrop-blur-md"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.08))",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0 4px 16px rgba(147, 51, 234, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.4)"
              }}
            />





            <div className="relative z-10 text-center">
              <h3 className="text-xl font-semibold text-white drop-shadow-lg backdrop-blur-sm">October's Campaign</h3>
            </div>
          </div>

          {selectedComponents.map((component, index) => {
            const angle = index * (360 / Math.max(selectedComponents.length, 1)) * (Math.PI / 180)
            const radius = 200
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle)

            // Define color schemes based on component category to match sidebar colors
            const getComponentColors = (category: string) => {
              switch (category) {
                case "Local Data":
                  return {
                    bg: 'bg-gradient-to-br from-blue-500/20 via-teal-500/15 to-cyan-500/20',
                    border: 'border-teal-400/40',
                    shadow: 'shadow-teal-500/25',
                    text: 'text-white font-semibold drop-shadow-lg'
                  }
                case "Online trend data":
                  return {
                    bg: 'bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-blue-500/20',
                    border: 'border-purple-400/40',
                    shadow: 'shadow-purple-500/25',
                    text: 'text-white font-semibold drop-shadow-lg'
                  }
                case "Campaign Type":
                  return {
                    bg: 'bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-orange-500/20',
                    border: 'border-pink-400/40',
                    shadow: 'shadow-pink-500/25',
                    text: 'text-white font-semibold drop-shadow-lg'
                  }
                default:
                  return {
                    bg: 'bg-gradient-to-br from-slate-500/20 via-gray-500/15 to-zinc-500/20',
                    border: 'border-slate-400/30',
                    shadow: 'shadow-slate-500/20',
                    text: 'text-white font-semibold drop-shadow-lg'
                  }
              }
            }

            const colors = getComponentColors(component.category)

            return (
              <div
                key={component.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-float cursor-pointer"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${index * 0.2}s`,
                  zIndex: 10 + index,
                }}
              >
                <div className="relative group">
                  {/* Liquid glass style card */}
                  <div className={`relative px-4 py-3 rounded-xl backdrop-blur-md ${colors.bg} ${colors.border} border shadow-lg ${colors.shadow} hover:shadow-xl transition-all duration-300 min-w-[100px]`}>
                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm" />
                    
                    <div className="relative z-10">
                      <p className={`text-sm text-center leading-tight ${colors.text}`}>
                        {component.name}
                      </p>
                    </div>
                  </div>

                  {/* Minus button positioned outside the card with higher z-index */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-red-400/50 shadow-lg z-50 flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveComponent(component.id);
                    }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-50">
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
            transform: scale(1) rotate(0deg);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: scale(1.02) rotate(90deg);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: scale(0.98) rotate(180deg);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 60% 30% 60% 40%;
            transform: scale(1.01) rotate(270deg);
          }
        }
        
        @keyframes liquidFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
            filter: blur(15px);
          }
          33% {
            transform: translateY(-5px) scale(1.02);
            filter: blur(12px);
          }
          66% {
            transform: translateY(3px) scale(0.98);
            filter: blur(18px);
          }
        }
        
        @keyframes glassShimmer {
          0%, 100% {
            opacity: 0.4;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.8;
            transform: translateX(100%);
          }
        }
        
        .liquid-glass-primary {
          animation: morph 6s ease-in-out infinite, liquidFloat 4s ease-in-out infinite;
        }
        
        .liquid-glass-secondary {
          animation: morph 8s ease-in-out infinite reverse, liquidFloat 5s ease-in-out infinite 0.5s;
        }
        
        .glass-shimmer {
          animation: glassShimmer 3s ease-in-out infinite;
        }
        
        .group:hover .group-hover\\:opacity-100 {
          pointer-events: auto;
        }
        
        .group .group-hover\\:opacity-100 {
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
