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
    <div className="h-full p-8 relative flex flex-col transition-all duration-300 ease-out">
      {/* Background gradient blob */}
      <div className="absolute inset-[-100px] flex items-center justify-center pointer-events-none">
        <div
          className={[
            "w-[600px] h-[600px] rounded-full gradient-purple-blue opacity-15 blur-[100px]",
            isGenerating ? "animate-pulse" : "",
          ].join(" ")}
        />
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
                      "animate-pulse animate-morph",
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
                      "animate-morph",
                    ].join(" ")
                  : [
                      "bg-[linear-gradient(135deg,rgba(147,51,234,0.35),rgba(59,130,246,0.3),rgba(6,182,212,0.35))]",
                      "border-white/15",
                      "shadow-[0_8px_32px_rgba(147,51,234,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]",
                      "animate-morph animate-liquid-float",
                    ].join(" "),
              ].join(" ")}
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
                "animate-morph",
              ].join(" ")}
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
                  ? "animate-spin animate-morph [animation-duration:1.5s] [animation-direction:reverse]"
                  : "animate-morph animate-spin-slow [animation-direction:reverse]",
              ].join(" ")}
            />

            {/* Inner glass orb */}
            <div
              className={[
                "absolute inset-[20px] rounded-full backdrop-blur-md",
                "bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(147,51,234,0.1),rgba(59,130,246,0.08))]",
                "border border-white/25",
                "shadow-[0_4px_16px_rgba(147,51,234,0.2),inset_0_2px_0_rgba(255,255,255,0.4)]",
              ].join(" ")}
            />

            <div className="relative z-10 text-center">
              <h3 className="text-xl font-semibold text-white drop-shadow-lg backdrop-blur-sm">
                October&apos;s Campaign
              </h3>
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

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50">
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
    </div>
  )
}
