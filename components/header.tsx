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
          <span className="text-sm text-muted-foreground">AI Campaign Planner</span>
        </div>
      </div>
    </header>
  )
}
