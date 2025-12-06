import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Diagnosis } from '@/lib/models/diagnosis.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const diagnoses = await Diagnosis.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const formattedDiagnoses = diagnoses.map(dx => ({
      id: dx._id.toString(),
      symptoms: dx.symptoms,
      patientAge: dx.patientAge,
      urgencyLevel: dx.result?.urgencyLevel,
      createdAt: dx.createdAt,
      preview: dx.symptoms.substring(0, 80) + (dx.symptoms.length > 80 ? '...' : '')
    }))

    return NextResponse.json({ diagnoses: formattedDiagnoses })
  } catch (error) {
    console.error('Fetch diagnosis history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
