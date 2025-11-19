import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkSubscriptionAccess, trackUsage } from '@/lib/subscription-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkSubscriptionAccess(request, 'diagnosis')
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: accessCheck.error,
        trialExpired: accessCheck.trialExpired,
        limitReached: accessCheck.limitReached,
        currentUsage: accessCheck.currentUsage,
        limit: accessCheck.limit
      }, { status: 403 })
    }

    const { symptoms, patientAge, medicalHistory, vitalSigns } = await request.json()

    if (!symptoms || !symptoms.trim()) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 })
    }

    const prompt = `As a senior physician, provide a comprehensive differential diagnosis analysis:

**PATIENT PRESENTATION:**
- Symptoms: ${symptoms}
- Age: ${patientAge || 'Not specified'}
- Medical History: ${medicalHistory || 'None provided'}
- Vital Signs: ${vitalSigns || 'Not provided'}

Provide detailed analysis in this format:

**DIFFERENTIAL DIAGNOSIS:**
[List 3-5 most likely conditions with probability percentages and brief rationale]

**CLINICAL REASONING:**
[Explain the diagnostic reasoning process and key clinical features]

**RED FLAGS:**
[Identify any warning signs that require immediate attention]

**RECOMMENDED INVESTIGATIONS:**
[Suggest specific tests, labs, imaging with clinical justification]

**TREATMENT APPROACH:**
[Initial management recommendations based on most likely diagnosis]

**FOLLOW-UP PLAN:**
[Monitoring and reassessment recommendations]

**CLINICAL REFERENCES:**
[Cite relevant medical guidelines, studies, or diagnostic criteria]

**URGENCY LEVEL:**
[LOW/MODERATE/HIGH with justification]

Be thorough, evidence-based, and include specific medical references where applicable.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior attending physician with expertise in internal medicine and differential diagnosis. Provide comprehensive, evidence-based medical analysis with specific references to medical literature and guidelines. Always emphasize the importance of clinical correlation and professional medical judgment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.2
    })

    const analysis = completion.choices[0]?.message?.content || 'Analysis not available'

    // Parse urgency level
    let urgencyLevel: 'low' | 'medium' | 'high' = 'medium'
    const analysisUpper = analysis.toUpperCase()
    if (analysisUpper.includes('URGENCY LEVEL: HIGH') || analysisUpper.includes('EMERGENCY') || analysisUpper.includes('IMMEDIATE')) {
      urgencyLevel = 'high'
    } else if (analysisUpper.includes('URGENCY LEVEL: LOW') || analysisUpper.includes('ROUTINE')) {
      urgencyLevel = 'low'
    }

    // Extract differential diagnoses
    const diffDiagnosisMatch = analysis.match(/\*\*DIFFERENTIAL DIAGNOSIS:\*\*(.*?)(?=\*\*|$)/s)
    const differentialDiagnosis = diffDiagnosisMatch ? diffDiagnosisMatch[1].trim() : 'Not available'

    // Extract investigations
    const investigationsMatch = analysis.match(/\*\*RECOMMENDED INVESTIGATIONS:\*\*(.*?)(?=\*\*|$)/s)
    const investigations = investigationsMatch ? investigationsMatch[1].trim() : 'Not available'

    // Extract references
    const referencesMatch = analysis.match(/\*\*CLINICAL REFERENCES:\*\*(.*?)(?=\*\*|$)/s)
    const references = referencesMatch ? referencesMatch[1].trim() : 'Not available'

    // Track usage after successful analysis
    if (accessCheck.userId) {
      await trackUsage(accessCheck.userId, 'diagnosis')
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      urgencyLevel: urgencyLevel,
      differentialDiagnosis: differentialDiagnosis,
      investigations: investigations,
      references: references,
      disclaimer: "This AI analysis is for educational and decision support purposes only. It does not replace professional medical judgment, clinical examination, or diagnostic testing. Always correlate with clinical findings and seek appropriate medical consultation."
    })

  } catch (error) {
    console.error('Diagnosis analysis error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        return NextResponse.json(
          { error: 'AI analysis service temporarily unavailable' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze symptoms. Please try again.' },
      { status: 500 }
    )
  }
}