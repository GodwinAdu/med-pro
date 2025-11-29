import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkCoinAccess, deductCoins } from '@/lib/coin-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CARE_PLAN_PROMPT = `You are a senior nurse creating a comprehensive nursing care plan. Based on the patient information provided, generate a detailed professional nursing care plan in JSON format.

Return ONLY a valid JSON object with this exact structure:
{
  "patientInfo": {
    "name": "Patient name (extract or use 'Patient' if not provided)",
    "age": "Age with units (e.g., '65 years old')",
    "diagnosis": "Primary diagnosis"
  },
  "problems": [
    {
      "number": 1,
      "problem": "Specific medical/nursing problem (e.g., Hyperglycemia, Risk for Diabetic Neuropathy)",
      "nursingDiagnosis": "NANDA format diagnosis with 'related to' and 'as evidenced by' components",
      "goals": {
        "shortTerm": "Specific measurable goal with timeframe (within 24-48 hours)",
        "longTerm": "Specific measurable goal with timeframe (weeks/months)"
      },
      "interventions": [
        "Specific nursing intervention 1",
        "Specific nursing intervention 2",
        "Continue with more interventions"
      ],
      "rationale": [
        "Scientific rationale for interventions",
        "Additional rationale points"
      ],
      "evaluation": [
        "How to measure if goals are met",
        "Specific evaluation criteria"
      ]
    }
  ]
}

Guidelines:
- Generate 4-6 problems based on the patient's condition
- Focus on primary diagnosis, risk factors, knowledge deficits, and psychosocial needs
- Use proper NANDA nursing diagnosis format
- Include both short-term (24-48 hours) and long-term (weeks/months) goals
- Provide specific, actionable nursing interventions
- Include evidence-based rationales
- Set measurable evaluation criteria
- Consider holistic patient care including physical, emotional, and educational needs`

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkCoinAccess(request, 'care-plan')
    
    if (!accessCheck.hasAccess) {
      return NextResponse.json({ 
        error: accessCheck.error,
        insufficientCoins: accessCheck.insufficientCoins,
        coinBalance: accessCheck.coinBalance
      }, { status: 403 })
    }

    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Patient information is required' }, { status: 400 })
    }

    if (accessCheck.userId) {
      await deductCoins(accessCheck.userId, 'care-plan', `Care plan for: ${prompt.substring(0, 50)}...`)
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: CARE_PLAN_PROMPT },
        { role: "user", content: `Create a comprehensive care plan for this patient:\n\n${prompt}` }
      ],
      max_tokens: 3000,
      temperature: 0.2,
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from AI')
    }

    try {
      const carePlan = JSON.parse(response)
      
      return NextResponse.json({ carePlan })
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to generate structured care plan' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Care plan generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate care plan' 
    }, { status: 500 })
  }
}