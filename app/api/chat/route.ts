import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkCoinAccess, deductCoins } from '@/lib/coin-middleware'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MEDICAL_SYSTEM_PROMPT = `You are MedAssist AI, a professional medical AI assistant designed to support healthcare professionals and provide medical information. Your responses should be:

1. Evidence-based and clinically accurate
2. Professional and empathetic in tone
3. Clear and well-structured
4. Include relevant medical terminology when appropriate
5. Always emphasize the importance of professional medical consultation

Guidelines:
- Provide comprehensive medical information and analysis
- Suggest differential diagnoses when relevant
- Recommend appropriate investigations or referrals
- Include safety considerations and red flags
- Cite medical guidelines when applicable
- Always include medical disclaimers

IMPORTANT: Always end responses with a medical disclaimer emphasizing that this is for educational purposes and professional medical consultation is required for diagnosis and treatment.`

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkCoinAccess(request, 'chat')
   
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: accessCheck.error,
        insufficientCoins: accessCheck.insufficientCoins,
        coinBalance: accessCheck.coinBalance
      }, { status: 403 })
    }

    const { messages }: ChatRequest = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Deduct coins before processing
    if (accessCheck.userId) {
      await deductCoins(accessCheck.userId, 'chat', `Chat message: ${messages[messages.length - 1]?.content?.substring(0, 50)}...`)
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: MEDICAL_SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      error: 'Unable to process your request. Please try again.'
    }, { status: 500 })
  }
}