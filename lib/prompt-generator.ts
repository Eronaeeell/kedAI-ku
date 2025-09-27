interface Component {
  id: string
  name: string
  category: string
  color: string
}

interface ComponentsByCategory {
  'Local Data': string[]
  'Online trend data': string[]
  'Campaign Type': string[]
  'Custom': string[]
}

export function generatePrompt(components: Component[]): string {
  if (components.length === 0) {
    return "Create a modern marketing campaign poster for a cafe"
  }

  // Group components by category
  const componentsByCategory: ComponentsByCategory = {
    'Local Data': [],
    'Online trend data': [],
    'Campaign Type': [],
    'Custom': []
  }

  components.forEach(component => {
    const category = component.category as keyof ComponentsByCategory
    if (componentsByCategory[category]) {
      componentsByCategory[category].push(component.name.toLowerCase())
    }
  })

  // Build the prompt
  let prompt = "Create a professional marketing campaign poster for a modern cafe featuring"

  // Add local context (events/weather)
  if (componentsByCategory['Local Data'].length > 0) {
    const localData = componentsByCategory['Local Data']
    if (localData.some(item => item.includes('festival') || item.includes('concert'))) {
      const events = localData.filter(item => item.includes('festival') || item.includes('concert'))
      prompt += ` celebrating ${events.join(' and ')}`
    }
    if (localData.some(item => item.includes('rainy'))) {
      prompt += ` with cozy indoor atmosphere for rainy weather`
    }
    if (localData.some(item => item.includes('sunny'))) {
      prompt += ` with bright, refreshing vibes for sunny weather`
    }
  }

  // Add trending products
  if (componentsByCategory['Online trend data'].length > 0) {
    const trendData = componentsByCategory['Online trend data']
    prompt += `. Highlighting ${trendData.join(', ')} as the featured beverages`
    
    // Add specific styling based on products
    if (trendData.some(item => item.includes('matcha'))) {
      prompt += ` with vibrant green matcha elements and Japanese-inspired aesthetics`
    }
    if (trendData.some(item => item.includes('boba'))) {
      prompt += ` with colorful boba pearls and modern bubble tea styling`
    }
  }

  // Add campaign offers
  if (componentsByCategory['Campaign Type'].length > 0) {
    const campaigns = componentsByCategory['Campaign Type']
    prompt += `. Promoting special offers: ${campaigns.join(', ')}`
    
    if (campaigns.some(item => item.includes('buy 1 get 1'))) {
      prompt += ` with bold "BUY 1 GET 1" text and attractive pricing display`
    }
    if (campaigns.some(item => item.includes('discount'))) {
      prompt += ` with prominent discount percentages and savings highlights`
    }
    if (campaigns.some(item => item.includes('free upsize'))) {
      prompt += ` showing different cup sizes with upgrade arrows`
    }
    if (campaigns.some(item => item.includes('combo'))) {
      prompt += ` displaying food and drink combinations attractively`
    }
  }

  // Add custom components
  if (componentsByCategory['Custom'].length > 0) {
    prompt += `. Additionally featuring ${componentsByCategory['Custom'].join(', ')}`
  }

  // Add general styling instructions
  prompt += `. Style: modern, clean design with warm cafe colors, appetizing food photography, clear typography, and eye-catching promotional elements. Include the cafe atmosphere with customers enjoying their drinks. Make it visually appealing for social media marketing.`

  // Add quality and format specifications
  prompt += ` High quality, professional marketing poster, 16:9 aspect ratio, vibrant colors, well-lit photography style.`

  return prompt
}

export function generateImagePrompt(components: Component[]): string {
  const basePrompt = generatePrompt(components)
  
  // Add Stability AI specific enhancements
  const enhancedPrompt = `${basePrompt} Professional commercial photography, high resolution, marketing poster style, vibrant lighting, appetizing presentation, clean composition, modern typography overlay space.`
  
  return enhancedPrompt
}