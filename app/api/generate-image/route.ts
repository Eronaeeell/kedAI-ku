import { NextRequest, NextResponse } from 'next/server'

const STABILITY_API_KEY = process.env.STABILITY_API_KEY

// Available Stability AI models from the documentation
const STABILITY_MODELS = {
  'ultra': 'https://api.stability.ai/v2beta/stable-image/generate/ultra', // Highest quality, photorealistic
  'core': 'https://api.stability.ai/v2beta/stable-image/generate/core',   // Fast and affordable
  'sd3': 'https://api.stability.ai/v2beta/stable-image/generate/sd3',     // Stable Diffusion 3.5
  'sd3-medium': 'https://api.stability.ai/v2beta/stable-image/generate/sd3' // SD3 Medium (same endpoint)
}

// Default to Ultra for highest quality promotional posters
const SELECTED_MODEL = 'ultra'
const STABILITY_API_URL = STABILITY_MODELS[SELECTED_MODEL]

export async function POST(request: NextRequest) {
  try {
    const { prompt, components, model } = await request.json()
    
    // Allow model selection via request (optional)
    const selectedModel = (model && model in STABILITY_MODELS) ? model as keyof typeof STABILITY_MODELS : SELECTED_MODEL
    const apiUrl = STABILITY_MODELS[selectedModel]

    let finalPrompt = prompt

    // If no prompt provided, generate one using DeepSeek API
    if (!finalPrompt && components && components.length > 0) {
      console.log('No prompt provided, generating with DeepSeek API...')
      
      try {
        const promptResponse = await fetch(`${request.nextUrl.origin}/api/generate-prompt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ components })
        })

        if (promptResponse.ok) {
          const promptData = await promptResponse.json()
          finalPrompt = promptData.prompt
          console.log('✅ OpenRouter/DeepSeek generated prompt (will be used EXACTLY as-is for Stability AI):', finalPrompt)
          console.log('📝 Prompt length:', finalPrompt?.length, 'characters')
          console.log('🎯 Using this exact prompt for image generation without any modifications')
        } else {
          const errorText = await promptResponse.text()
          console.log('AI API failed:', promptResponse.status, errorText)
          throw new Error(`AI prompt generation failed: ${promptResponse.status}`)
        }
      } catch (error) {
        console.log('AI prompt generation error:', error)
        return NextResponse.json(
          { error: 'Failed to generate marketing prompt with AI' },
          { status: 500 }
        )
      }
    }

    if (!finalPrompt) {
      return NextResponse.json(
        { error: 'Prompt or components are required' },
        { status: 400 }
      )
    }

    if (!STABILITY_API_KEY) {
      return NextResponse.json(
        { error: 'Stability API key not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 SENDING TO STABILITY AI - EXACT PROMPT FROM OPENROUTER:')
    console.log('📋 Model:', selectedModel.toUpperCase(), '- Selected Stability AI model')
    console.log('🔗 API URL:', apiUrl)
    console.log('📋 Prompt:', finalPrompt)
    console.log('🔧 Components used for generation:', components)
    console.log('⚡ Stability AI Parameters: output_format=jpeg, aspect_ratio=16:9, seed=0')

    // Use the OpenRouter-generated prompt EXACTLY as-is for Stability AI
    const formData = new FormData()
    formData.append('prompt', finalPrompt) // ✅ Using exact OpenRouter prompt
    formData.append('output_format', 'jpeg')
    formData.append('aspect_ratio', '16:9')
    formData.append('seed', '0')

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Stability AI API error:', response.status, errorText)
      
      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      } else {
        return NextResponse.json(
          { error: `Failed to generate image: ${response.status}` },
          { status: response.status }
        )
      }
    }

    // Get the image as a buffer
    const imageBuffer = await response.arrayBuffer()
    
    // Convert to base64 for sending to client
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const imageDataUrl = `data:image/jpeg;base64,${base64Image}`

    return NextResponse.json({
      success: true,
      imageUrl: imageDataUrl,
      prompt: finalPrompt
    })

  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}