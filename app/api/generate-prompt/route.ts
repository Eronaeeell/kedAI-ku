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

    console.log('Generating marketing prompt for components:', components)

    // Create a detailed prompt for DeepSeek to generate marketing copy
    const systemPrompt = `You are an expert promotional poster designer and marketing creative director specializing in high-impact cafe marketing campaigns. Your task is to create detailed prompts for AI image generation that will produce professional PROMOTIONAL POSTERS similar to retail marketing materials.

POSTER DESIGN PHILOSOPHY:
Create bold, attention-grabbing promotional posters that follow proven retail marketing principles with prominent text overlays, strong visual hierarchy, and clear calls-to-action.

REQUIRED POSTER ELEMENTS (always include):
1. **MAIN HEADLINE**: Bold, large text (examples: "BIG SALE", "SPECIAL OFFER", "UNBEATABLE DEAL", "LIMITED TIME")
2. **PROMOTIONAL OFFER**: Prominent discount/deal text (examples: "50% OFF", "2 FOR RM10.10", "ANY 2 FOR", "30% DISC")
3. **CALL-TO-ACTION**: Action-driving text (examples: "SHOP NOW", "ORDER TODAY", "VISIT US", "GRAB YOURS")
4. **BRAND ELEMENTS**: Cafe name/logo placement and social media handles
5. **PROMOTIONAL DETAILS**: Dates, terms, conditions, or validity periods

VISUAL DESIGN REQUIREMENTS:
- Bright, eye-catching background colors (orange, yellow, red, purple gradients)
- Bold, contrasting typography with clear hierarchy (large headlines, medium offers, small details)
- Professional food/drink photography integrated with graphic overlays
- Geometric shapes, badges, burst designs, or promotional frames
- Strategic white space for text readability
- Modern promotional poster aesthetic similar to retail marketing

TEXT PLACEMENT STRATEGY:
- Reserve 40-50% of poster space for text and promotional elements
- Use high contrast colors for maximum text visibility
- Position main offers in upper or center areas for immediate attention
- Include supporting text in designated areas without overwhelming the design
- Ensure all text is legible and professionally formatted

PROMOTIONAL PSYCHOLOGY:
- Create urgency with time-limited offers and scarcity messaging
- Use power words that drive action and create desire
- Include social proof elements (ratings, testimonials, or popularity indicators)
- Apply color psychology for emotional responses and purchase motivation

Generate prompts that will create complete promotional posters that cafes could immediately use for their marketing campaigns, with all text elements clearly specified and strategically positioned.`

    // Analyze components to determine text strategy
    const campaignTypes = components.filter((comp: any) => comp.category === 'Campaign Type')
    const onlineTrends = components.filter((comp: any) => comp.category === 'Online trend data')
    const localData = components.filter((comp: any) => comp.category === 'Local Data')
    const customData = components.filter((comp: any) => comp.category === 'Custom')
    
    const componentsText = components.map((comp: any) => `${comp.name} (${comp.category})`).join(', ')
    
    const userPrompt = `Create a detailed Stability AI image generation prompt for a PROMOTIONAL POSTER (similar to retail marketing posters) featuring: ${componentsText}

MANDATORY POSTER ELEMENTS TO INCLUDE:

🎯 **MAIN PROMOTIONAL HEADLINE** (Large, Bold Text):
${campaignTypes.length > 0 ? `
- Primary offer: "${campaignTypes.map((c: any) => c.name).join(' + ')}"
- Add promotional words like "SPECIAL OFFER", "BIG SALE", "UNBEATABLE DEAL"
- Include discount percentages, "LIMITED TIME ONLY", "BEST DEAL OF THE YEAR"
- Position: Top third or center, largest text size, contrasting colors` : `
- Create compelling headline based on components (e.g., "SPECIAL COFFEE", "EXCLUSIVE MENU", "GRAND OPENING")
- Add urgency words like "LIMITED TIME", "TODAY ONLY", "DON'T MISS"`}

💰 **PRICING/OFFER DETAILS** (Medium Prominence):
${onlineTrends.length > 0 ? `
- Feature: "${onlineTrends.map((c: any) => c.name).join(' & ')}"
- Add specific pricing like "RM10.10", "50% OFF", "2 FOR 1", "STARTING AT RM8"
- Include "NEW", "TRENDING", "POPULAR" badges
- Position: Near product images with clear visibility` : `
- Create attractive pricing (e.g., "FROM RM5", "ONLY RM12.90", "SPECIAL PRICE")
- Add value propositions like "BEST VALUE", "PREMIUM QUALITY"`}

📞 **CALL-TO-ACTION** (Medium Size):
- Action text: "SHOP NOW", "ORDER TODAY", "VISIT US NOW", "GRAB YOURS TODAY"
- Add urgency: "HURRY UP", "WHILE STOCKS LAST", "LIMITED TIME"

🏪 **BRAND & CONTACT INFO** (Small but Visible):
- Cafe name/logo placement
- Social media: "@cafename" or website
${localData.length > 0 ? `- Location reference: "${localData.map((c: any) => c.name).join(', ')}"` : ''}
- Validity dates: "Valid until [date]" or "Oct 10-11, 2024"

POSTER VISUAL SPECIFICATIONS:
- **Layout**: Professional promotional poster format (vertical/horizontal)
- **Colors**: Bright, attention-grabbing background (orange, yellow, purple, red gradients)
- **Typography**: Bold, contrasting fonts with clear size hierarchy
- **Design Elements**: Include promotional badges, burst shapes, frames, or geometric overlays
- **Photography**: High-quality food/drink images integrated with text overlays
- **Text Areas**: Reserve 45-50% space for text and promotional graphics
- **Style**: Modern retail promotional poster similar to shopping mall advertisements

CRITICAL: Specify exact text content, positioning, font treatments, and color contrasts to create a complete promotional poster that could be immediately used for cafe marketing. The result should look like professional retail promotional materials with all text clearly readable and strategically placed.`

    const requestBody = {
      model: "openai/gpt-3.5-turbo",
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
      temperature: 0.8,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }

    console.log('Sending request to OpenRouter API...')
    console.log('API URL:', OPENROUTER_API_URL)
    console.log('API Key present:', !!OPENROUTER_API_KEY)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
        'X-Title': 'KedAI-ku Marketing Campaign Generator'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('OpenRouter API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error details:')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Response:', errorText)
      
      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenRouter API key' },
          { status: 401 }
        )
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      } else if (response.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('OpenRouter API response data:', JSON.stringify(data, null, 2))
    
    const generatedPrompt = data.choices?.[0]?.message?.content?.trim()

    if (!generatedPrompt) {
      console.error('No prompt in response:', data)
      return NextResponse.json(
        { error: 'No prompt generated by AI' },
        { status: 500 }
      )
    }

    console.log('✅ OpenRouter/DeepSeek SUCCESS - Generated marketing prompt:')
    console.log('📝 Full prompt content:', generatedPrompt)
    console.log('📊 Prompt statistics:')
    console.log('  - Length:', generatedPrompt.length, 'characters')
    console.log('  - Words:', generatedPrompt.split(' ').length)
    console.log('  - Components used:', components.length)
    console.log('🚀 This exact prompt will be sent to Stability AI without modifications')

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt, // ✅ Exact prompt from OpenRouter/DeepSeek
      components: components
    })

  } catch (error) {
    console.error('Error generating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate marketing prompt' },
      { status: 500 }
    )
  }
}