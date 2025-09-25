"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Component {
  id: string
  name: string
  category: string
  color: string
}

const COMPONENTS: Component[] = [
  // Local Data
  { id: "deepavali", name: "Deepavali festival", category: "Local Data", color: "gradient-blue-teal" },
  { id: "coldplay", name: "Coldplay concert", category: "Local Data", color: "gradient-blue-teal" },
  { id: "rainy", name: "Rainy weeks", category: "Local Data", color: "gradient-blue-teal" },
  { id: "sunny", name: "Sunny weeks", category: "Local Data", color: "gradient-blue-teal" },

  // Online Trend Data
  { id: "matcha-boba", name: "Matcha + boba", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "cold-matcha", name: "Cold Matcha", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "ceremony", name: "Ceremony grade matcha", category: "Online trend data", color: "gradient-purple-blue" },
  { id: "hot-matcha", name: "Hot Matcha", category: "Online trend data", color: "gradient-purple-blue" },

  // Campaign Type
  { id: "buy-one", name: "Buy 1 get 1", category: "Campaign Type", color: "gradient-pink-orange" },
  { id: "free-upsize", name: "Free upsize drink", category: "Campaign Type", color: "gradient-pink-orange" },
  { id: "discount", name: "Discount 20%", category: "Campaign Type", color: "gradient-pink-orange" },
  { id: "combo-snack", name: "Combo Snack + Matcha", category: "Campaign Type", color: "gradient-pink-orange" },
]

const CATEGORIES = ["Local Data", "Online trend data", "Campaign Type"]

interface ComponentSidebarProps {
  onAddComponent: (component: Component) => void
}

export function ComponentSidebar({ onAddComponent }: ComponentSidebarProps) {
  return (
    <div className="w-80 border-r border-border/50 bg-sidebar/80 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Components</h2>
          <p className="text-sm text-muted-foreground">Drag and drop components to build your campaign</p>
        </div>

        {CATEGORIES.map((category) => (
          <div key={category} className="space-y-3">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>

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
      </div>
    </div>
  )
}
