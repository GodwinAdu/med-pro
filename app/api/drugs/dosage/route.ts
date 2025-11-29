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

    const { drug, weight, age, condition, renalFunction, hepaticFunction } = await request.json()

    const prompt = `Calculate appropriate dosage for:
Drug: ${drug}
Patient: ${age} years old, ${weight} kg
Condition: ${condition}
Renal Function: ${renalFunction || 'Normal'}
Hepatic Function: ${hepaticFunction || 'Normal'}

Provide:
1. **Standard Adult Dose**
2. **Weight-Based Calculation** (if applicable)
3. **Adjustments** (renal/hepatic if needed)
4. **Frequency & Duration**
5. **Maximum Daily Dose**
6. **Special Considerations**

Be precise and include units.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a clinical pharmacist providing precise dosage calculations for healthcare professionals. Always include safety warnings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    })

    // Deduct coins after successful calculation
    if (accessCheck.userId) {
      await deductCoins(accessCheck.userId, 'drug-search', `Dosage calculation: ${drug}`)
    }

    return NextResponse.json({
      success: true,
      dosage: completion.choices[0]?.message?.content || 'Calculation not available'
    })

  } catch (error) {
    console.error('Dosage calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate dosage' }, { status: 500 })
  }
}