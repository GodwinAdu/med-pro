import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profession = searchParams.get('profession')

    if (!profession || !['nurses', 'doctors'].includes(profession)) {
      return NextResponse.json({ error: 'Invalid profession' }, { status: 400 })
    }

    const guidelines = profession === 'nurses' ? getNursingGuidelines() : getDoctorGuidelines()
    
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`${profession === 'nurses' ? 'Nursing' : 'Medical'} Notes Guidelines`, 20, 20)
    
    const lines = doc.splitTextToSize(guidelines, 170)
    doc.setFontSize(10)
    doc.text(lines, 20, 40)
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${profession}-notes-guidelines.pdf"`
      }
    })

  } catch (error) {
    console.error('Guidelines PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate guidelines PDF' }, { status: 500 })
  }
}

function getNursingGuidelines() {
  return `NURSING NOTES GUIDELINES
How to Provide Quality Input for Professional Notes

GENERAL PRINCIPLES:
• Be specific and factual
• Include relevant vital signs and measurements
• Use professional medical terminology
• Document patient responses and behaviors
• Include time-sensitive information

ADMISSION NOTE - Example Input:
"Patient: Mary Johnson, 65F, admitted 2:30pm with chest pain. BP 160/90, HR 88, RR 20, Temp 37.2°C, SpO2 94%. Alert and oriented x3. History of HTN, DM. Takes metformin 500mg BID, lisinopril 10mg daily. NKDA. Chest pain 7/10, radiating to left arm, started 1 hour ago. Anxious about procedure. IV 18G left hand established."

SHIFT/ROUTINE NOTE - Example Input:
"Day shift 7am-7pm. Patient stable, alert. BP 140/85, HR 76, RR 18, Temp 36.8°C. Pain 4/10 managed with paracetamol. Ambulated to bathroom independently. Ate 75% breakfast. IV fluids running at 100ml/hr. No complaints. Plan: continue monitoring, encourage mobility."

PROGRESS NOTE - Example Input:
"Patient reports feeling better, pain reduced to 3/10. Slept well overnight. BP 135/80, HR 72, afebrile. Wound dressing dry and intact. Ambulating without assistance. Appetite improved. Requesting discharge planning discussion."

PRE-OPERATIVE NOTE - Example Input:
"Scheduled for appendectomy 10am. NPO since midnight. Consent signed. Pre-op checklist complete. BP 130/75, HR 80. IV access 20G right hand. Pre-medication given: midazolam 2mg IV. Patient anxious but cooperative. Dentures removed, jewelry secured."

POST-OPERATIVE NOTE - Example Input:
"Returned from OR 2:15pm post appendectomy. Awake, responsive. BP 125/70, HR 78, RR 16, SpO2 98% on room air. Pain 6/10. Wound dressing clean, dry, intact. Foley catheter draining clear urine 200ml. IV fluids running. No nausea."

DISCHARGE NOTE - Example Input:
"Patient stable for discharge. Vital signs normal. Wound healing well. Medications reconciled. Discharge instructions given and understood. Follow-up appointment scheduled. Family present for transport home."

KEY TIPS:
✓ Include specific times and measurements
✓ Document patient's own words in quotes
✓ Note family involvement and communication
✓ Record patient education provided
✓ Document any changes in condition
✓ Include safety measures taken
✓ Note patient's response to interventions`
}

function getDoctorGuidelines() {
  return `MEDICAL NOTES GUIDELINES
How to Provide Quality Input for Professional Notes

GENERAL PRINCIPLES:
• Include complete clinical assessment
• Document differential diagnoses considered
• Record investigation results and interpretation
• Include treatment rationale
• Document patient consent and understanding

ADMISSION/CLERKING NOTE - Example Input:
"Mr. Smith, 58M, admitted with acute chest pain. CC: Central chest pain 2 hours, 8/10 severity, radiating to left arm. HPC: Pain started at rest, associated with sweating, nausea. PMH: HTN, hyperlipidemia. Medications: amlodipine 5mg, atorvastatin 20mg. SH: Smoker 20 pack-years. FH: Father MI age 60. O/E: BP 150/95, HR 95, distressed. CVS: Normal heart sounds, no murmurs. ECG: ST elevation V2-V4. Troponin elevated 0.8. Assessment: STEMI. Plan: Primary PCI, dual antiplatelet therapy, monitoring."

DAILY REVIEW - Example Input:
"Day 2 post-MI. Patient comfortable, chest pain resolved. BP 130/80, HR 70, afebrile. Echo shows anterior wall hypokinesis, EF 45%. Cardiac enzymes trending down. Mobilizing well. Plan: Continue medications, cardiac rehabilitation referral, discharge planning."

CONSULTATION NOTE - Example Input:
"Cardiology consultation requested for chest pain evaluation. Patient has atypical symptoms with normal ECG. Risk factors include diabetes, family history. Recommend stress testing, consider CT coronary angiogram. Will follow up with results."

DISCHARGE SUMMARY - Example Input:
"Admission: 15/03/2024 with STEMI. Discharge: 18/03/2024. Treatment: Primary PCI to LAD, drug-eluting stent inserted. Complications: None. Discharge medications: Aspirin 75mg, clopidogrel 75mg, metoprolol 25mg BD, atorvastatin 80mg. Follow-up: Cardiology clinic 2 weeks, GP 1 week. Advised smoking cessation, cardiac rehabilitation."

PROCEDURE NOTE - Example Input:
"Procedure: Central line insertion. Indication: Poor peripheral access, need for CVP monitoring. Consent obtained. Technique: Ultrasound-guided right internal jugular approach. 7Fr triple lumen catheter inserted 15cm. Good blood return all lumens. CXR confirms position, no pneumothorax. Secured with sutures."

KEY TIPS:
✓ Include relevant negative findings
✓ Document clinical reasoning
✓ Record patient's understanding and consent
✓ Include risk stratification
✓ Document communication with family
✓ Note any complications or adverse events
✓ Include follow-up arrangements
✓ Record medication changes and rationale`
}