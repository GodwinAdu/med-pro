import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Prescription } from '@/lib/models/prescription.models'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { patientName, patientAge, diagnosis, medications, notes, validation } = await request.json()

    if (!patientName || !medications || medications.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prescription = await Prescription.create({
      userId: user._id,
      patientName,
      patientAge,
      diagnosis,
      medications,
      notes,
      validation
    })

    return NextResponse.json({
      prescriptionId: prescription._id.toString(),
      message: 'Prescription saved successfully'
    })
  } catch (error) {
    console.error('Save prescription error:', error)
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 })
  }
}
