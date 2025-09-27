"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React, { useState, useEffect } from "react"
import CustomModal from "@/components/custom-modal"
import { X } from "lucide-react"

interface Component {
  id: string
  name: string
  category: string
  color: string
}

interface CampaignComponent {
  id: string
  type: "local_data" | "online_trend" | "campaign_type"
  title: string
  description: string
  data: any
  relevanceScore: number
  category: string
  keywords: string[]
  impact: "high" | "medium" | "low"
}

const STATIC_COMPONENTS: Component[] = [
  { id: "deepavali", name: "Deepavali festival", category: "Local Data", color: "gradient-blue-teal" },
  { id: "coldplay", name: "Coldplay concert", category: "Local Data", color: "gradient-blue-teal" },
  { id: "rainy", name: "Rainy weeks", category: "Local Data", color: "gradient-blue-teal" },
  { id: "sunny", name: "Sunny weeks", category: "Local Data", color: "gradient-blue-teal" },
  { id: "matcha-boba", name: "Matcha + boba", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "cold-matcha", name: "Cold Matcha", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "ceremony", name: "Ceremony grade matcha", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "hot-matcha", name: "Hot Matcha", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "buy-one", name: "Buy 1 get 1", category: "Campaign Type", color: "gradient-pink-orange" },
  { id: "free-upsize", name: "Free upsize drink", category: "Campaign Type", color: "gradient-pink-orange" },
  { id: "discount", name: "Discount 20%", category: "Campaign Type", color: "gradient-pink-orange" },
  { id: "combo-snack", name: "Combo Snack + Matcha", category: "Campaign Type", color: "gradient-pink-orange" },
]

const CATEGORIES = ["Local Data", "Online trend data", "Campaign Type"]
const STORAGE_KEY = "kedai.customComponents.v1"

interface ComponentSidebarProps {
  onAddComponent: (component: Component) => void
  generatedComponents?: CampaignComponent[]
  onRemoveFromCanvas?: (id: string) => void
}

function colorByType(t: CampaignComponent["type"]) {
  if (t === "local_data") return "gradient-blue-teal"
  if (t === "online_trend") return "gradient-purple-blue"
  return "gradient-pink-orange"
}

export function ComponentSidebar({
  onAddComponent,
  generatedComponents = [],
  onRemoveFromCanvas,
}: ComponentSidebarProps) {
  const [allComponents, setAllComponents] = useState<Component[]>(STATIC_COMPONENTS)

  // Convert AI components to the same visual spec as static items
  useEffect(() => {
    const converted: Component[] = generatedComponents.map((comp) => ({
      id: comp.id,
      name: comp.title,
      category:
        comp.type === "local_data"
          ? "Local Data"
          : comp.type === "online_trend"
          ? "Online trend data"
          : "Campaign Type",
      // match static color by category so visuals are identical
      color: colorByType(comp.type),
    }))

    const combined = [...STATIC_COMPONENTS, ...converted]
    const unique = combined.filter((c, i, arr) => i === arr.findIndex((x) => x.id === c.id))
    setAllComponents(unique)
  }, [generatedComponents])

  const [mounted, setMounted] = useState(false)
  const [customComponents, setCustomComponents] = useState<Component[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCustomComponents(JSON.parse(raw) as Component[])
    } catch {}
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customComponents))
    } catch {}
  }, [customComponents, mounted])

  useEffect(() => {
    if (!mounted) return
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setCustomComponents(JSON.parse(e.newValue) as Component[])
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [mounted])

  function openAddModal() {
    setNewName("")
    setShowModal(true)
  }

  function handleCreateCustom() {
    const name = newName.trim()
    if (!name) return
    const id = `custom-${Date.now()}`
    setCustomComponents((s) => [
      ...s,
      { id, name, category: "Custom", color: "bg-gradient-to-br from-yellow-300 via-lime-300 to-emerald-300" },
    ])
    setShowModal(false)
    setSelectedId(id)
  }

  function handleClickCustom(component: Component) {
    setSelectedId(component.id)
    onAddComponent(component)
  }

  function handleRemoveCustom(id: string) {
    setCustomComponents((prev) => prev.filter((c) => c.id !== id))
    if (selectedId === id) setSelectedId(null)
    onRemoveFromCanvas?.(id)
  }

  if (!mounted) return null

  return (
    <div className="w-80 border-r border-border/50 bg-sidebar/80 backdrop-blur-xl p-6 overflow-y-auto h-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Components</h2>
          <p className="text-sm text-muted-foreground">
            {generatedComponents.length > 0
              ? `AI-generated components (${generatedComponents.length}) + static components`
              : "Drag and drop components to build your campaign"}
          </p>
        </div>

        {CATEGORIES.map((category) => {
          const categoryComponents = allComponents.filter((c) => c.category === category)
          const generatedInCategory = generatedComponents.filter(
            (gc) =>
              (gc.type === "local_data" && category === "Local Data") ||
              (gc.type === "online_trend" && category === "Online trend data") ||
              (gc.type === "campaign_type" && category === "Campaign Type"),
          )

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                {generatedInCategory.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    AI Generated ({generatedInCategory.length})
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categoryComponents.map((component) => {
                  const generatedComp = generatedComponents.find((gc) => gc.id === component.id)
                  const isGenerated = Boolean(generatedComp)

                  return (
                    <Card
                      key={component.id}
                      className="relative p-3 cursor-pointer hover:scale-105 transition-all duration-200 border-border/50 hover:border-primary/50 hover:shadow-lg group min-h-[120px]"
                      onClick={() => onAddComponent(component)}
                    >
                      {isGenerated && (
                        <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          AI
                        </span>
                      )}

                      <div className="flex flex-col items-center text-center space-y-2">
                        {/* Gradient bubble with white center and inner ring */}
                        <div className="flex items-center justify-center w-full">
                          <div
                            className={`w-12 h-12 rounded-full ${component.color} flex items-center justify-center group-hover:animate-float`}
                          >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-white/40" />
                            </div>
                          </div>
                        </div>

                        <div className="w-full">
                          <p className="text-xs text-card-foreground font-medium leading-tight mb-0.5">
                            {component.name}
                          </p>

                          {isGenerated && generatedComp && (
                            <>
                              <div className="flex items-center justify-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  {Math.round(generatedComp.relevanceScore)}%
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-0.5">
                                {generatedComp.description}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Custom section */}
        <div className="space-y-3">
          <Badge variant="outline" className="text-xs">
            Custom
          </Badge>
          <div className="grid grid-cols-2 gap-3">
            {customComponents.map((component) => {
              const isSelected = selectedId === component.id
              const bubbleClass = isSelected
                ? "w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-lime-300 to-emerald-300 mb-2 mx-auto flex items-center justify-center"
                : `w-12 h-12 rounded-full ${component.color} mb-2 mx-auto flex items-center justify-center group-hover:animate-float`

              return (
                <div key={component.id} className="relative group">
                  <button
                    aria-label={`Remove ${component.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveCustom(component.id)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <Card
                    className="p-3 cursor-pointer hover:scale-105 transition-all duration-200 border-border/50 hover:border-primary/50 hover:shadow-lg group"
                    onClick={() => handleClickCustom(component)}
                  >
                    <div className={bubbleClass}>
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    </div>
                    <p className="text-xs text-center text-card-foreground font-medium leading-tight">
                      {component.name}
                    </p>
                  </Card>
                </div>
              )
            })}

            {/* Add custom button */}
            <Card
              className="p-3 cursor-pointer hover:scale-105 transition-all duration-200 border-dashed border-border/40 flex flex-col items-center justify-center"
              onClick={openAddModal}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-300/30 mb-2 mx-auto flex items-center justify-center">
                <div className="text-xl font-bold text-yellow-700">+</div>
              </div>
              <p className="text-xs text-center text-card-foreground font-medium leading-tight">Add custom</p>
            </Card>
          </div>
        </div>
      </div>

      <CustomModal open={showModal} title="Create custom component" onClose={() => setShowModal(false)}>
        <input
          className="w-full rounded-md border border-input px-3 py-2 text-sm mb-3"
          placeholder="Component name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateCustom()
          }}
        />
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 rounded-md bg-muted text-muted-foreground" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground" onClick={handleCreateCustom}>
            Create
          </button>
        </div>
      </CustomModal>
    </div>
  )
}
