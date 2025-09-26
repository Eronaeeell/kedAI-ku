"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Share, Send } from "lucide-react"

interface SelectedComponent {
  id: string
  name: string
  category: string
  color: string
  position: { x: number; y: number }
}

interface GenerationPanelProps {
  isGenerating: boolean
  generatedImage: string | null
  selectedComponents: SelectedComponent[]
  onGenerate: (prompt: string) => void
}

export function GenerationPanel({
  isGenerating,
  generatedImage,
  selectedComponents,
  onGenerate,
}: GenerationPanelProps) {
  const [prompt, setPrompt] = useState(
    "Based on September's sales data, current cafe food & beverages trend, and weather prediction, can you help to generate a campaign plan for October to boost my sales?",
  )

  const handleGenerate = () => {
    if (selectedComponents.length > 0) {
      onGenerate(prompt)
    }
  }

  const handleSend = () => {
    console.log("Send clicked:", prompt)
  }

  return (
    <div className="h-full overflow-hidden leading-5">
      <div className="max-w-4xl mx-auto">
        <div className="mt-4">
          <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
            <label className="text-sm font-medium text-card-foreground">Campaign Brief</label>
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your campaign goals and requirements..."
                className="min-h-[60px] bg-background/50 border-border/50 focus:border-primary/50 pr-12"
              />
              <Button size="sm" variant="ghost" className="absolute bottom-2 right-2 w-8 h-8 p-0" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
