import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkCoinAccess, deductCoins } from '@/lib/coin-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Medication {
  id?: string
  name: string
  dosage: string
  frequency: string
  duration: string
}

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkCoinAccess(request, 'prescription')
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: accessCheck.error,
        insufficientCoins: accessCheck.insufficientCoins,
        coinBalance: accessCheck.coinBalance
      }, { status: 403 })
    }

    const { medications, notes } = await request.json()

    if (!medications || medications.length === 0) {
      return NextResponse.json({ error: 'No medications provided' }, { status: 400 })
    }

    // Filter out empty medications
    const validMedications = medications.filter((med: Medication) => med.name.trim())

    if (validMedications.length === 0) {
      return NextResponse.json({ error: 'No valid medications provided' }, { status: 400 })
    }

    // Fetch drug information from FDA API for each medication
    const drugDataPromises = validMedications.map(async (med: Medication) => {
      try {
        // Try multiple search strategies
        const searchQueries = [
          `openfda.brand_name:"${encodeURIComponent(med.name)}"`,
          `openfda.generic_name:"${encodeURIComponent(med.name)}"`,
          `openfda.substance_name:"${encodeURIComponent(med.name)}"`
        ]

        let drugData = null
        
        for (const query of searchQueries) {
          try {
            const response = await fetch(
              `https://api.fda.gov/drug/label.json?search=${query}&limit=1`,
              { 
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'MedAssist-Pro/1.0'
                }
              }
            )
            
            if (response.ok) {
              const data = await response.json()
              if (data.results && data.results.length > 0) {
                drugData = data.results[0]
                break
              }
            }
          } catch (searchError) {
            console.log(`Search failed for query: ${query}`, searchError)
            continue
          }
        }
        
        if (drugData) {
          // Extract only key information to reduce token usage
          const extractKeyInfo = (text: string, maxLength: number = 200) => {
            if (!text || text === 'No warnings available') return 'None'
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
          }

          return {
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            fdaData: {
              warnings: extractKeyInfo(drugData.warnings?.[0] || drugData.boxed_warning?.[0]),
              contraindications: extractKeyInfo(drugData.contraindications?.[0]),
              adverse_reactions: extractKeyInfo(drugData.adverse_reactions?.[0]),
              drug_interactions: extractKeyInfo(drugData.drug_interactions?.[0]),
              dosage_info: extractKeyInfo(drugData.dosage_and_administration?.[0])
            }
          }
        }
        
        return {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          fdaData: null
        }
      } catch (error) {
        console.error(`FDA API error for ${med.name}:`, error)
        return {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          fdaData: null
        }
      }
    })

    const enrichedMedications = await Promise.all(drugDataPromises)

    // Create concise prompt for AI analysis
    const medicationList = enrichedMedications.map((med, index) => {
      return `${index + 1}. ${med.name} - ${med.dosage || 'unspecified'} ${med.frequency || ''} for ${med.duration || 'unspecified'}${med.fdaData ? ` | Warnings: ${med.fdaData.warnings} | Interactions: ${med.fdaData.drug_interactions}` : ''}`
    }).join('\n')

    const prompt = `Analyze this prescription for safety issues and suggest alternatives:

Medications:
${medicationList}

Notes: ${notes || 'None'}

Provide analysis in this format:

**RISK LEVEL:** [LOW/MODERATE/HIGH]

**INTERACTIONS:** [Key drug interactions between medications]

**DOSAGE ISSUES:** [Dosage concerns if any]

**WARNINGS:** [Critical warnings]

**ALTERNATIVE DRUGS:** [If interactions found, suggest specific alternative medications that can replace problematic drugs while maintaining therapeutic effect]

**RECOMMENDATIONS:** [Key clinical recommendations]

If drugs cannot be used together, provide specific alternative drug names with similar therapeutic effects.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a clinical pharmacist specializing in drug interactions and therapeutic alternatives. When drugs interact dangerously, suggest specific alternative medications with similar therapeutic effects. Be concise and practical."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    })

    const analysis = completion.choices[0]?.message?.content || 'Analysis not available'

    // Determine risk level from AI response
    let riskLevel: 'safe' | 'warning' | 'danger' = 'safe'
    const analysisUpper = analysis.toUpperCase()
    if (analysisUpper.includes('HIGH') || analysisUpper.includes('DANGER') || analysisUpper.includes('SEVERE') || analysisUpper.includes('CONTRAINDICATED')) {
      riskLevel = 'danger'
    } else if (analysisUpper.includes('MODERATE') || analysisUpper.includes('WARNING') || analysisUpper.includes('CAUTION') || analysisUpper.includes('MONITOR')) {
      riskLevel = 'warning'
    }

    // Deduct coins after successful validation
    if (accessCheck.userId) {
      await deductCoins(accessCheck.userId, 'prescription', `Prescription validation: ${validMedications.length} medications`)
    }

    return NextResponse.json({
      success: true,
      status: riskLevel,
      analysis: analysis,
      medicationCount: validMedications.length,
      fdaDataAvailable: enrichedMedications.filter(med => med.fdaData).length
    })

  } catch (error) {
    console.error('Prescription validation error:', error)
    
    // Return more specific error information
    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        return NextResponse.json(
          { error: 'AI analysis service temporarily unavailable' },
          { status: 503 }
        )
      }
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Unable to fetch drug information' },
          { status: 502 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to validate prescription. Please try again.' },
      { status: 500 }
    )
  }
}