import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Diagnosis } from '@/lib/models/diagnosis.models'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { symptoms, patientAge, medicalHistory, vitalSigns, result } = await request.json()

    if (!symptoms || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const diagnosis = await Diagnosis.create({
      userId: user._id,
      symptoms,
      patientAge,
      medicalHistory,
      vitalSigns,
      result
    })

    return NextResponse.json({
      diagnosisId: diagnosis._id.toString(),
      message: 'Diagnosis saved successfully'
    })
  } catch (error) {
    console.error('Save diagnosis error:', error)
    return NextResponse.json({ error: 'Failed to save diagnosis' }, { status: 500 })
  }
}
