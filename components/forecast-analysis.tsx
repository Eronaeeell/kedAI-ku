"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, Target, Eye, Share2, MessageCircle } from "lucide-react"
import CustomModal from "./custom-modal"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EngagementForecast {
  likes: number
  shares: number
  comments: number
}

interface SalesDataPoint {
  period: string
  value: number
  currency: 'MYR' | 'USD'
}

interface ForecastAnalysis {
  engagement: EngagementForecast
  salesForecast: SalesDataPoint[]
  overallScore: number
}

interface ForecastAnalysisProps {
  analysis: ForecastAnalysis
}

export function ForecastAnalysis({ analysis }: ForecastAnalysisProps) {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const formatCurrency = (value: number, currency: 'MYR' | 'USD') => {
    const symbol = currency === 'MYR' ? 'RM' : '$'
    
    // Format in thousands (1k, 5k, etc.)
    if (value >= 1000) {
      const thousands = Math.round(value / 1000)
      return `${symbol}${thousands}k`
    }
    
    return `${symbol}${value}`
  }

  const maxSalesValue = analysis.salesForecast.length > 0 ? Math.max(...analysis.salesForecast.map(d => d.value)) : 0
  const currency = analysis.salesForecast[0]?.currency || 'MYR'

  return (
    <div className="mt-4">
      <div className="text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm p-4 bg-background/50 border-border/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">AI Forecast Analysis</h3>
        </div>

        <div className="flex flex-col gap-6">
          {/* Engagement Forecast */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Engagement Forecast
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Likes</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreColor(analysis.engagement.likes)} transition-all duration-300`}
                      style={{ width: `${(analysis.engagement.likes / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreTextColor(analysis.engagement.likes)}`}>
                    {analysis.engagement.likes}/10
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Shares</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreColor(analysis.engagement.shares)} transition-all duration-300`}
                      style={{ width: `${(analysis.engagement.shares / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreTextColor(analysis.engagement.shares)}`}>
                    {analysis.engagement.shares}/10
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Comments</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreColor(analysis.engagement.comments)} transition-all duration-300`}
                      style={{ width: `${(analysis.engagement.comments / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreTextColor(analysis.engagement.comments)}`}>
                    {analysis.engagement.comments}/10
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Forecast Graph */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Sales Forecast
            </h4>
            <div 
              className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsGraphModalOpen(true)}
            >
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.salesForecast} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => formatCurrency(value, currency)}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6" 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <span className="text-xs text-gray-500">Click to enlarge</span>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Overall Score
            </h4>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreColor(analysis.overallScore)} text-white text-xl font-bold mb-2`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm text-gray-600">out of 10</div>
              <Badge 
                variant="secondary" 
                className={`mt-2 ${getScoreColor(analysis.overallScore)} text-white`}
              >
                {analysis.overallScore >= 8 ? 'Excellent' : analysis.overallScore >= 6 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Modal */}
      <CustomModal 
        open={isGraphModalOpen} 
        title="Sales Forecast - Detailed View"
        onClose={() => setIsGraphModalOpen(false)}
      >
        <div className="w-full max-w-lg">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.salesForecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: '#374151' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 14, fill: '#374151' }}
                    tickFormatter={(value) => formatCurrency(value, currency)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value, currency), 'Sales']}
                    labelFormatter={(label) => `Week ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              <span className="font-medium">Currency:</span> {currency}
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  )
}
