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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Prescription ID required' }, { status: 400 })
    }

    await connectToDB()

    const prescription = await Prescription.findOne({ _id: id, userId: user._id }).lean()

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    return NextResponse.json({
      prescription: {
        id: prescription._id.toString(),
        patientName: prescription.patientName,
        patientAge: prescription.patientAge,
        diagnosis: prescription.diagnosis,
        medications: prescription.medications,
        notes: prescription.notes,
        validation: prescription.validation,
        createdAt: prescription.createdAt
      }
    })
  } catch (error) {
    console.error('Get prescription error:', error)
    return NextResponse.json({ error: 'Failed to get prescription' }, { status: 500 })
  }
}
