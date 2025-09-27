'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History } from 'lucide-react'

interface HeaderProps {
  onHistoryClick?: () => void;
}

export function Header({ onHistoryClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img 
              src="/kedai-ku-logo.jpg" 
              alt="KedAI-ku Logo" 
              className="w-10 h-10 rounded-lg object-cover drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
            />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ked</span>
            <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">AI</span>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">-ku</span>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* History Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs hover:bg-accent/50"
            onClick={onHistoryClick}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>

          <div className="h-4 w-px bg-border/50"></div>
          
          <span className="text-sm text-muted-foreground">AI Campaign Planner</span>
        </div>
      </div>
    </header>
  )
}
