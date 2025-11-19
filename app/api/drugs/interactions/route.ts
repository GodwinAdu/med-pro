import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkSubscriptionAccess, trackUsage } from '@/lib/subscription-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkSubscriptionAccess(request, 'chat')
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: accessCheck.error,
        trialExpired: accessCheck.trialExpired,
        limitReached: accessCheck.limitReached,
        currentUsage: accessCheck.currentUsage,
        limit: accessCheck.limit
      }, { status: 403 })
    }

    const { drugs } = await request.json()

    if (!drugs || drugs.length < 2) {
      return NextResponse.json({ error: 'At least 2 drugs required' }, { status: 400 })
    }

    const prompt = `Analyze potential drug interactions between: ${drugs.join(', ')}

Provide:
1. **Interaction Risk Level**: None/Minor/Moderate/Major/Severe
2. **Clinical Significance**: Brief explanation
3. **Mechanism**: How the interaction occurs
4. **Management**: Clinical recommendations
5. **Monitoring**: What to watch for

Be concise and clinically focused.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a clinical pharmacist providing drug interaction analysis for healthcare professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.1
    })

    // Track usage after successful analysis
    if (accessCheck.userId) {
      await trackUsage(accessCheck.userId, 'chat')
    }

    return NextResponse.json({
      success: true,
      interaction: completion.choices[0]?.message?.content || 'Analysis not available'
    })

  } catch (error) {
    console.error('Drug interaction error:', error)
    return NextResponse.json({ error: 'Failed to analyze interactions' }, { status: 500 })
  }
}