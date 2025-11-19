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

    // Track usage after successful calculation
    if (accessCheck.userId) {
      await trackUsage(accessCheck.userId, 'chat')
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