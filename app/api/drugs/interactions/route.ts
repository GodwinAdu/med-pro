import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkCoinAccess, deductCoins } from '@/lib/coin-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkCoinAccess(request, 'drug-search')
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: accessCheck.error,
        insufficientCoins: accessCheck.insufficientCoins,
        coinBalance: accessCheck.coinBalance
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

    // Deduct coins after successful analysis
    if (accessCheck.userId) {
      await deductCoins(accessCheck.userId, 'drug-search', `Drug interactions: ${drugs.join(', ')}`)
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