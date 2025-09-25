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
    <div className="h-full border-border/50 bg-card/80 backdrop-blur-xl p-6 overflow-auto leading-5 border-t">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{selectedComponents.length} components selected</span>

            {selectedComponents.length > 0 && (
              <div className="flex -space-x-2">
                {selectedComponents.slice(0, 3).map((component) => (
                  <div
                    key={component.id}
                    className={`w-8 h-8 rounded-full ${component.color} border-2 border-background flex items-center justify-center`}
                  >
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                  </div>
                ))}
                {selectedComponents.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">+{selectedComponents.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Card className="p-4 bg-background/50 border-border/50">
          <div className="space-y-3">
            <label className="text-sm font-medium text-card-foreground">Campaign Brief</label>
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your campaign goals and requirements..."
                className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary/50 pr-12"
              />
              <Button size="sm" variant="ghost" className="absolute bottom-2 right-2 w-8 h-8 p-0" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Generated Image Display */}
        {generatedImage && (
          <Card className="p-6 bg-background/50 border-border/50">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated campaign poster"
                  className="w-48 h-48 object-cover rounded-lg border border-border/50"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Generated Campaign Poster</h3>
                  <p className="text-sm text-muted-foreground">
                    Your AI-generated campaign visual is ready! This poster incorporates all selected components and
                    follows current design trends.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
