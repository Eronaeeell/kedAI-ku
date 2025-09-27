import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { components } = await request.json()

    if (!components || components.length === 0) {
      return NextResponse.json(
        { error: 'Components are required' },
        { status: 400 }
      )
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    console.log('🎯 Generating social media caption for components:', components)

    // Create a detailed system prompt for social media caption generation
    const systemPrompt = `You are an expert social media marketing specialist and copywriter for cafes and restaurants. Your task is to create engaging, concise social media captions that drive customer action and engagement.

CAPTION REQUIREMENTS:
- Maximum 280 characters (Twitter/X limit) - this is CRITICAL
- Include engaging emojis and hashtags strategically
- Create urgency and excitement about the offer
- Use conversational, trendy language that appeals to young adults
- Include clear call-to-action phrases
- Mention specific offers, prices, or deals when relevant
- Reference local events or trending items when appropriate

CAPTION STYLE:
- Start with attention-grabbing emojis or power words
- Include the main offer/product prominently  
- Add urgency phrases like "Limited Time", "Don't Miss", "Today Only"
- End with relevant hashtags (3-5 max)
- Use exclamation points and engaging punctuation
- Keep it conversational and Instagram/TikTok friendly

TONE: Exciting, trendy, urgent, friendly, and action-oriented

Generate ONLY the final social media caption text, nothing else. Ensure it stays under 280 characters.`

    // Analyze components to determine caption focus
    const campaignTypes = components.filter((comp: any) => comp.category === 'Campaign Type')
    const onlineTrends = components.filter((comp: any) => comp.category === 'Online trend data')
    const localData = components.filter((comp: any) => comp.category === 'Local Data')
    
    const componentsText = components.map((comp: any) => `${comp.name} (${comp.category})`).join(', ')
    
    const userPrompt = `Create a social media caption for a cafe promotional campaign featuring: ${componentsText}

CAPTION FOCUS AREAS:
${campaignTypes.length > 0 ? `
🎯 MAIN OFFER: ${campaignTypes.map((c: any) => c.name).join(' + ')}
- Emphasize the deal/offer prominently
- Add urgency and scarcity messaging
- Include pricing hints like "Starting at RM8" or "50% OFF"` : ''}

${onlineTrends.length > 0 ? `
📱 TRENDING PRODUCTS: ${onlineTrends.map((c: any) => c.name).join(', ')}
- Highlight what's popular and trending
- Use trendy language and emojis
- Appeal to FOMO (fear of missing out)` : ''}

${localData.length > 0 ? `
📍 LOCAL CONNECTION: ${localData.map((c: any) => c.name).join(' & ')}
- Reference the local event or context
- Create community connection
- Use location-specific appeal` : ''}

REQUIREMENTS:
- Maximum 280 characters - COUNT CAREFULLY
- Include 2-4 relevant emojis
- Add 3-5 strategic hashtags
- Include clear call-to-action
- Create excitement and urgency
- Use conversational, social media friendly tone

Generate the complete social media caption that could be posted directly on Twitter/Instagram/TikTok.`

    const requestBody = {
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      temperature: 0.9, // Higher creativity for social media
      max_tokens: 150, // Shorter for captions
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }

    console.log('📡 Sending caption request to OpenRouter API...')
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
        'X-Title': 'KedAI-ku Social Media Caption Generator'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('OpenRouter API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('OpenRouter API response data:', JSON.stringify(data, null, 2))
    
    let generatedCaption = data.choices?.[0]?.message?.content?.trim()

    if (!generatedCaption) {
      console.error('No caption in response:', data)
      return NextResponse.json(
        { error: 'No caption generated by AI' },
        { status: 500 }
      )
    }

    // Ensure caption is under 280 characters
    if (generatedCaption.length > 280) {
      console.log(`⚠️ Caption too long (${generatedCaption.length} chars), truncating...`)
      // Try to truncate at a word boundary near 280 chars
      const truncated = generatedCaption.substring(0, 270).trim()
      const lastSpace = truncated.lastIndexOf(' ')
      generatedCaption = lastSpace > 200 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
    }

    console.log('✅ Generated social media caption:')
    console.log('📝 Caption:', generatedCaption)
    console.log('📊 Length:', generatedCaption.length, 'characters')
    console.log('🎯 Components used:', components.length)

    return NextResponse.json({
      success: true,
      caption: generatedCaption,
      length: generatedCaption.length,
      components: components
    })

  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json(
      { error: 'Failed to generate social media caption' },
      { status: 500 }
    )
  }
}