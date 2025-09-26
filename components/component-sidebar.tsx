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

const COMPONENTS: Component[] = [
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
  /** NEW: tell parent to remove this id from the canvas if present */
  onRemoveFromCanvas?: (id: string) => void
}

export function ComponentSidebar({ onAddComponent, onRemoveFromCanvas }: ComponentSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [customComponents, setCustomComponents] = useState<Component[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

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

  // remove a custom component locally AND notify parent/canvas
  function handleRemoveCustom(id: string) {
    setCustomComponents((prev) => prev.filter((c) => c.id !== id))
    if (selectedId === id) setSelectedId(null)
    // notify parent to remove from canvas if present
    onRemoveFromCanvas?.(id)
  }

  if (!mounted) return null

  return (
    <div className="w-80 border-r border-border/50 bg-sidebar/80 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Components</h2>
          <p className="text-sm text-muted-foreground">Drag and drop components to build your campaign</p>
        </div>

        {CATEGORIES.map((category) => (
          <div key={category} className="space-y-3">
            <Badge variant="outline" className="text-xs">{category}</Badge>
            <div className="grid grid-cols-2 gap-3">
              {COMPONENTS.filter((comp) => comp.category === category).map((component) => (
                <Card
                  key={component.id}
                  className="p-3 cursor-pointer hover:scale-105 transition-all duration-200 border-border/50 hover:border-primary/50 hover:shadow-lg group"
                  onClick={() => onAddComponent(component)}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${component.color} mb-2 mx-auto flex items-center justify-center group-hover:animate-float`}
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full" />
                  </div>
                  <p className="text-xs text-center text-card-foreground font-medium leading-tight">{component.name}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Custom section */}
        <div className="space-y-3">
          <Badge variant="outline" className="text-xs">Custom</Badge>
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
          onKeyDown={(e) => { if (e.key === "Enter") handleCreateCustom() }}
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
