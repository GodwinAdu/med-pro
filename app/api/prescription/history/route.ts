import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Prescription } from '@/lib/models/prescription.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const prescriptions = await Prescription.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const formattedPrescriptions = prescriptions.map(rx => ({
      id: rx._id.toString(),
      patientName: rx.patientName,
      patientAge: rx.patientAge,
      diagnosis: rx.diagnosis,
      medicationCount: rx.medications?.length || 0,
      validationStatus: rx.validation?.status,
      createdAt: rx.createdAt,
      preview: `${rx.medications?.[0]?.name || 'No medications'}${rx.medications?.length > 1 ? ` +${rx.medications.length - 1} more` : ''}`
    }))

    return NextResponse.json({ prescriptions: formattedPrescriptions })
  } catch (error) {
    console.error('Fetch prescription history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
