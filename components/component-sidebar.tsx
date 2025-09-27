"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface Component {
  id: string
  name: string
  category: string
  color: string
}

interface CampaignComponent {
  id: string
  type: 'local_data' | 'online_trend' | 'campaign_type'
  title: string
  description: string
  data: any
  relevanceScore: number
  category: string
  keywords: string[]
  impact: 'high' | 'medium' | 'low'
}

const STATIC_COMPONENTS: Component[] = [
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
  generatedComponents?: CampaignComponent[]
}

export function ComponentSidebar({ onAddComponent, generatedComponents = [] }: ComponentSidebarProps) {
  const [allComponents, setAllComponents] = useState<Component[]>(STATIC_COMPONENTS)

  useEffect(() => {
    // Convert generated components to the Component format
    const convertedComponents: Component[] = generatedComponents.map(comp => ({
      id: comp.id,
      name: comp.title,
      category: comp.type === 'local_data' ? 'Local Data' : 
                comp.type === 'online_trend' ? 'Online trend data' : 
                'Campaign Type',
      color: comp.impact === 'high' ? 'gradient-green-blue' : 
             comp.impact === 'medium' ? 'gradient-yellow-orange' : 
             'gradient-gray-blue'
    }))

    // Combine static and generated components, removing duplicates
    const combined = [...STATIC_COMPONENTS, ...convertedComponents]
    const unique = combined.filter((comp, index, self) => 
      index === self.findIndex(c => c.id === comp.id)
    )
    
    setAllComponents(unique)
  }, [generatedComponents])

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="w-80 border-r border-border/50 bg-sidebar/80 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Components</h2>
          <p className="text-sm text-muted-foreground">
            {generatedComponents.length > 0 
              ? `AI-generated components (${generatedComponents.length}) + static components`
              : "Drag and drop components to build your campaign"
            }
          </p>
        </div>

        {CATEGORIES.map((category) => {
          const categoryComponents = allComponents.filter((comp) => comp.category === category)
          const generatedInCategory = generatedComponents.filter(comp => 
            (comp.type === 'local_data' && category === 'Local Data') ||
            (comp.type === 'online_trend' && category === 'Online trend data') ||
            (comp.type === 'campaign_type' && category === 'Campaign Type')
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
                  const isGenerated = generatedComponents.some(comp => comp.id === component.id)
                  const generatedComp = generatedComponents.find(comp => comp.id === component.id)
                  
                  return (
                    <Card
                      key={component.id}
                      className={`p-3 cursor-pointer hover:scale-105 transition-all duration-200 border-border/50 hover:border-primary/50 hover:shadow-lg group min-h-[120px] ${
                        isGenerated ? 'ring-2 ring-green-200 bg-green-50/50' : ''
                      }`}
                      onClick={() => onAddComponent(component)}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="flex items-center justify-center w-full">
                          <div
                            className={`w-12 h-12 rounded-full ${component.color} flex items-center justify-center group-hover:animate-float`}
                          >
                            <div className="w-6 h-6 bg-white/20 rounded-full" />
                          </div>
                        </div>
                        
                        <div className="w-full">
                          <p className="text-xs text-card-foreground font-medium leading-tight mb-1">
                            {component.name}
                          </p>
                          
                          {isGenerated && generatedComp && (
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <div className={`w-2 h-2 rounded-full ${getImpactColor(generatedComp.impact)}`} />
                              <span className="text-xs text-muted-foreground">
                                {generatedComp.relevanceScore}%
                              </span>
                            </div>
                          )}
                          
                          {isGenerated && generatedComp && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                              {generatedComp.description}
                            </p>
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
      </div>
    </div>
  )
}
