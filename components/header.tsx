import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Twitter, TestTube, Image as ImageIcon } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg gradient-purple-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            kedAI-ku
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Link href="/test-twitter">
              <Button variant="ghost" size="sm" className="text-xs">
                <Twitter className="w-3 h-3 mr-1" />
                X Test
                <Badge variant="secondary" className="ml-1 text-xs">Text</Badge>
              </Button>
            </Link>
            
            <Link href="/test-image-post">
              <Button variant="ghost" size="sm" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                Image Test
                <Badge variant="outline" className="ml-1 text-xs border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-400">Image Only</Badge>
              </Button>
            </Link>
          </div>

          <div className="h-4 w-px bg-border/50"></div>
          
          <span className="text-sm text-muted-foreground">AI Campaign Planner</span>
        </div>
      </div>
    </header>
  )
}
