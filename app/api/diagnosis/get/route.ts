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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Diagnosis ID required' }, { status: 400 })
    }

    await connectToDB()

    const diagnosis = await Diagnosis.findOne({ _id: id, userId: user._id }).lean()

    if (!diagnosis) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 })
    }

    return NextResponse.json({
      diagnosis: {
        id: diagnosis._id.toString(),
        symptoms: diagnosis.symptoms,
        patientAge: diagnosis.patientAge,
        medicalHistory: diagnosis.medicalHistory,
        vitalSigns: diagnosis.vitalSigns,
        result: diagnosis.result,
        createdAt: diagnosis.createdAt
      }
    })
  } catch (error) {
    console.error('Get diagnosis error:', error)
    return NextResponse.json({ error: 'Failed to get diagnosis' }, { status: 500 })
  }
}
