import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkCoinAccess, deductCoins } from '@/lib/coin-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkCoinAccess(request, 'notes')
    if (!accessCheck.hasAccess) {
      return NextResponse.json({
        error: accessCheck.error,
        insufficientCoins: accessCheck.insufficientCoins,
        coinBalance: accessCheck.coinBalance
      }, { status: 403 })
    }

    const { noteType, profession, userInput, noteTitle } = await request.json()

    if (!noteType || !profession || !userInput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let systemPrompt = ''
    let userPrompt = ''
    const currentDateTime = new Date().toLocaleString()

    // Generate specific prompts based on note type and profession
    if (profession === 'nurses') {
      switch (noteType) {
        case 'admission':
          systemPrompt = `You are a professional nursing documentation assistant. Generate a comprehensive ADMISSION NOTE following standard nursing format.

INCLUDE THESE SECTIONS:
- Date/Time: ${currentDateTime}
- Patient Demographics
- Reason for Admission
- Medical/Surgical History
- Medications & Allergies
- Vital Signs
- Physical Assessment (head-to-toe)
- Mental Status
- Initial Nursing Plan
- Nurse signature line`
          userPrompt = `Generate a nursing admission note using this patient information:\n\n${userInput}\n\nCreate a complete, professional admission note with all standard sections.`
          break

        case 'shift-routine':
          systemPrompt = `Generate a SHIFT NURSING NOTE following standard format.

INCLUDE:
- Date/Time: ${currentDateTime}
- Shift type
- Patient condition assessment
- Vital signs
- Medications administered
- Nursing interventions performed
- Patient response
- Intake/Output
- Plan for next shift`
          userPrompt = `Generate a shift nursing note using this information:\n\n${userInput}\n\nCreate a comprehensive shift report.`
          break

        case 'progress':
          systemPrompt = `Generate a NURSING PROGRESS NOTE using SOAP format.

INCLUDE:
- Date/Time: ${currentDateTime}
- Subjective: Patient reports
- Objective: Vital signs, observations
- Assessment: Current condition, response to treatment
- Plan: Continuing interventions, changes needed`
          userPrompt = `Generate a nursing progress note using this information:\n\n${userInput}\n\nUse SOAP format for the progress note.`
          break

        case 'pre-operative':
          systemPrompt = `Generate a PRE-OPERATIVE NURSING NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Procedure scheduled
- Pre-op instructions completed (NPO, consent)
- Vital signs
- Skin preparation
- IV access
- Medications given
- Patient emotional status
- Readiness for surgery`
          userPrompt = `Generate a pre-operative nursing note using this information:\n\n${userInput}\n\nDocument pre-surgical preparation.`
          break

        case 'post-operative':
          systemPrompt = `Generate a POST-OPERATIVE NURSING NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Procedure completed
- Airway, Breathing, Circulation (ABC)
- Level of consciousness
- Pain assessment
- Wound/dressing status
- IV fluids
- Urine output
- Complications if any`
          userPrompt = `Generate a post-operative nursing note using this information:\n\n${userInput}\n\nDocument post-surgical care and monitoring.`
          break

        case 'discharge':
          systemPrompt = `Generate a NURSING DISCHARGE NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Final assessment
- Condition at discharge
- Medications reconciliation
- Diet and activity instructions
- Follow-up appointments
- Patient education provided
- Discharge planning`
          userPrompt = `Generate a nursing discharge note using this information:\n\n${userInput}\n\nDocument discharge preparation and education.`
          break

        case 'initial-assessment':
          systemPrompt = `Generate a NURSING INITIAL ASSESSMENT NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Patient demographics
- Comprehensive health assessment
- Risk assessments (falls, pressure ulcers)
- Functional status
- Psychosocial assessment
- Nursing diagnoses identified
- Initial care priorities`
          userPrompt = `Generate a nursing initial assessment note using this information:\n\n${userInput}\n\nDocument comprehensive patient assessment.`
          break

        case 'transfer':
          systemPrompt = `Generate a NURSING TRANSFER NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Transfer from/to locations
- Reason for transfer
- Current condition
- Medications and treatments
- Special equipment/needs
- Communication with receiving unit
- Patient/family notification`
          userPrompt = `Generate a nursing transfer note using this information:\n\n${userInput}\n\nDocument patient transfer details.`
          break

        case 'referral':
          systemPrompt = `Generate a NURSING REFERRAL NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Referral to (service/specialist)
- Reason for referral
- Current nursing concerns
- Patient's condition
- Relevant history
- Expected outcomes
- Follow-up arrangements`
          userPrompt = `Generate a nursing referral note using this information:\n\n${userInput}\n\nDocument referral to other services.`
          break

        case 'incident':
          systemPrompt = `Generate a NURSING INCIDENT/ACCIDENT NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Type of incident
- Location of incident
- Persons involved
- Detailed description of events
- Immediate actions taken
- Patient condition post-incident
- Notifications made
- Follow-up required`
          userPrompt = `Generate a nursing incident note using this information:\n\n${userInput}\n\nDocument incident/accident details professionally.`
          break

        case 'care-plan':
          systemPrompt = `Generate a NURSING CARE PLAN NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Nursing diagnoses
- Patient goals (short/long term)
- Nursing interventions
- Rationale for interventions
- Evaluation criteria
- Patient response
- Plan modifications`
          userPrompt = `Generate a nursing care plan note using this information:\n\n${userInput}\n\nDocument comprehensive care planning.`
          break

        case 'death':
          systemPrompt = `Generate a NURSING DEATH NOTE (sensitive and professional).

INCLUDE:
- Date/Time: ${currentDateTime}
- Time of death
- Circumstances
- Last nursing interventions
- Family notification
- Post-mortem care provided
- Personal belongings
- Documentation completed`
          userPrompt = `Generate a nursing death note using this information:\n\n${userInput}\n\nDocument with sensitivity and professionalism.`
          break

        default:
          systemPrompt = `Generate a professional nursing ${noteTitle} following standard format with Date/Time: ${currentDateTime}`
          userPrompt = `Generate a ${noteTitle} using this information:\n\n${userInput}`
      }
    } else {
      // Doctor's notes
      switch (noteType) {
        case 'admission-clerking':
          systemPrompt = `Generate a DOCTOR'S ADMISSION NOTE (CLERKING) following standard medical format.

INCLUDE:
- Date/Time: ${currentDateTime}
- Patient demographics
- Chief Complaint
- History of Presenting Complaint (detailed)
- Past Medical/Surgical History
- Medications & Allergies
- Social/Family History
- Vital Signs
- Physical Examination (systematic)
- Investigations
- Assessment (clinical impression)
- Plan (treatment, investigations, monitoring)`
          userPrompt = `Generate a doctor's admission note using this information:\n\n${userInput}\n\nCreate a comprehensive clerking note.`
          break

        case 'daily-review':
          systemPrompt = `Generate a DAILY REVIEW/PROGRESS NOTE using SOAP format.

INCLUDE:
- Date/Time: ${currentDateTime}
- Subjective: Patient complaints/symptoms
- Objective: Vital signs, examination, investigations
- Assessment: Current diagnosis, progress
- Plan: Continue/modify/add treatments, monitoring`
          userPrompt = `Generate a daily review note using this information:\n\n${userInput}\n\nUse SOAP format for medical progress.`
          break

        case 'consultation':
          systemPrompt = `Generate a CONSULTATION NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Consultant details
- Reason for consultation
- Findings and examination
- Clinical impression
- Recommendations
- Follow-up plan`
          userPrompt = `Generate a consultation note using this information:\n\n${userInput}\n\nDocument specialist consultation.`
          break

        case 'discharge-summary':
          systemPrompt = `Generate a DISCHARGE SUMMARY.

INCLUDE:
- Admission/Discharge dates
- Final diagnosis (primary/secondary)
- Hospital course summary
- Investigations performed
- Medications on discharge
- Discharge instructions
- Follow-up arrangements
- Prognosis`
          userPrompt = `Generate a discharge summary using this information:\n\n${userInput}\n\nCreate comprehensive discharge documentation.`
          break

        case 'procedure':
          systemPrompt = `Generate a PROCEDURE NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Procedure name
- Indication
- Consent obtained
- Technique used
- Findings
- Complications if any
- Post-procedure instructions`
          userPrompt = `Generate a procedure note using this information:\n\n${userInput}\n\nDocument the procedure performed.`
          break

        case 'death':
          systemPrompt = `Generate a DEATH NOTE (sensitive and professional).

INCLUDE:
- Date/Time: ${currentDateTime}
- Time of death
- Circumstances leading to death
- Physical findings (pupils, heart sounds, breathing)
- Doctor who pronounced death
- Relatives informed
- Cause of death`
          userPrompt = `Generate a death note using this information:\n\n${userInput}\n\nDocument death with sensitivity and professionalism.`
          break

        case 'pre-operative':
          systemPrompt = `Generate a DOCTOR'S PRE-OPERATIVE NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Procedure planned
- Pre-operative assessment
- Fitness for surgery
- Consent obtained
- Pre-medication given
- Special instructions
- Anesthetic plan`
          userPrompt = `Generate a doctor's pre-operative note using this information:\n\n${userInput}\n\nDocument pre-surgical assessment.`
          break

        case 'post-operative':
          systemPrompt = `Generate a DOCTOR'S POST-OPERATIVE NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Procedure performed
- Operative findings
- Technique used
- Complications if any
- Post-operative orders
- Recovery status
- Follow-up plan`
          userPrompt = `Generate a doctor's post-operative note using this information:\n\n${userInput}\n\nDocument post-surgical care.`
          break

        case 'referral':
          systemPrompt = `Generate a DOCTOR'S REFERRAL NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Referring to (specialist/service)
- Reason for referral
- Clinical findings
- Investigations done
- Treatment tried
- Urgency level
- Expected outcome`
          userPrompt = `Generate a doctor's referral note using this information:\n\n${userInput}\n\nDocument specialist referral.`
          break

        case 'follow-up':
          systemPrompt = `Generate a DOCTOR'S FOLLOW-UP NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Previous visit summary
- Current complaints
- Response to treatment
- Current examination
- Plan modifications
- Next appointment
- Patient education`
          userPrompt = `Generate a doctor's follow-up note using this information:\n\n${userInput}\n\nDocument follow-up assessment.`
          break

        case 'transfer':
          systemPrompt = `Generate a DOCTOR'S TRANSFER NOTE.

INCLUDE:
- Date/Time: ${currentDateTime}
- Transfer from/to
- Reason for transfer
- Current diagnosis
- Treatment given
- Current condition
- Handover details
- Continuing care needs`
          userPrompt = `Generate a doctor's transfer note using this information:\n\n${userInput}\n\nDocument patient transfer.`
          break

        default:
          systemPrompt = `Generate a professional medical ${noteTitle} following standard format with Date/Time: ${currentDateTime}`
          userPrompt = `Generate a ${noteTitle} using this information:\n\n${userInput}`
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.2,
    })

    const generatedNote = completion.choices[0]?.message?.content

    if (!generatedNote) {
      throw new Error('Failed to generate note content')
    }

    // Deduct coins for note generation
    if (accessCheck.userId) {
      await deductCoins(accessCheck.userId, 'notes', `AI-generated ${noteTitle}`)
    }

    return NextResponse.json({
      generatedNote,
      message: 'Note generated successfully'
    })

  } catch (error) {
    console.error('Note generation error:', error)
    return NextResponse.json({ error: 'Failed to generate note' }, { status: 500 })
  }
}