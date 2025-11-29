import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import CarePlan from '@/lib/models/care-plan.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    // Replace with your auth logic
    const authHeader = await currentUser()
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    // Replace with your user ID from auth
    const userId = authHeader._id // Get from your auth system

    const carePlans = await CarePlan.find({ userId })
      .sort({ createdAt: -1 })
      .select('patientName patientAge diagnosis problems status createdAt')
      .limit(50)

    return NextResponse.json({ carePlans })

  } catch (error) {
    console.error('Care plans fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch care plans' 
    }, { status: 500 })
  }
}