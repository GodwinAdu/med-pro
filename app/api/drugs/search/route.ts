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

    const { drugName } = await request.json()

    if (!drugName) {
      return NextResponse.json({ error: 'Drug name is required' }, { status: 400 })
    }

    // Search FDA API
    const fdaResponse = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`
    )

    if (!fdaResponse.ok) {
      return NextResponse.json({ error: 'Drug not found in FDA database' }, { status: 404 })
    }

    const fdaData = await fdaResponse.json()

    if (!fdaData.results || fdaData.results.length === 0) {
      return NextResponse.json({ error: 'No drug information found' }, { status: 404 })
    }

    const drugData = fdaData.results[0]

    // Prepare data for OpenAI summarization
    const drugInfo = {
      brand_name: drugData.openfda?.brand_name?.[0] || 'N/A',
      generic_name: drugData.openfda?.generic_name?.[0] || 'N/A',
      manufacturer: drugData.openfda?.manufacturer_name?.[0] || 'N/A',
      dosage_form: drugData.openfda?.dosage_form?.[0] || 'N/A',
      route: drugData.openfda?.route?.join(', ') || 'N/A',
      purpose: drugData.purpose?.[0] || 'N/A',
      indications: drugData.indications_and_usage?.[0] || 'N/A',
      warnings: drugData.warnings?.[0] || 'N/A',
      dosage: drugData.dosage_and_administration?.[0] || 'N/A',
      contraindications: drugData.contraindications?.[0] || 'N/A',
      adverse_reactions: drugData.adverse_reactions?.[0] || 'N/A'
    }

    // Generate AI summary
    const prompt = `Please provide a concise, professional medical summary of this drug information for healthcare professionals:

Brand Name: ${drugInfo.brand_name}
Generic Name: ${drugInfo.generic_name}
Manufacturer: ${drugInfo.manufacturer}
Dosage Form: ${drugInfo.dosage_form}
Route: ${drugInfo.route}
Purpose: ${drugInfo.purpose}
Indications: ${drugInfo.indications}
Warnings: ${drugInfo.warnings}
Dosage: ${drugInfo.dosage}
Contraindications: ${drugInfo.contraindications}
Adverse Reactions: ${drugInfo.adverse_reactions}

Please format the response with clear section headers followed by concise information:

**Overview:**
[Brief description]

**Key Uses:**
[Primary indications]

**Important Warnings:**
[Critical safety information]

**Administration Guidelines:**
[Dosing and administration details]

Use clear, professional language suitable for healthcare providers. Keep each section concise but informative.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical information assistant providing accurate, concise drug summaries for healthcare professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const aiSummary = completion.choices[0]?.message?.content || 'Summary not available'

    // Track usage after successful search
    if (accessCheck.userId) {
      await trackUsage(accessCheck.userId, 'chat')
    }

    return NextResponse.json({
      success: true,
      data: {
        rawData: drugData,
        summary: aiSummary,
        basicInfo: drugInfo
      }
    })

  } catch (error) {
    console.error('Drug search error:', error)
    return NextResponse.json(
      { error: 'Failed to search drug information' },
      { status: 500 }
    )
  }
}