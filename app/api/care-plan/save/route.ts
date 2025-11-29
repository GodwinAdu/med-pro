import { NextRequest, NextResponse } from 'next/server'
import CarePlan from '@/lib/models/care-plan.models'
import { currentUser } from '@/lib/helpers/session'
import { connectToDB } from '@/lib/mongoose'

export async function POST(request: NextRequest) {
  try {
    // Replace with your auth logic
    const authHeader = await currentUser()
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const carePlanData = await request.json()

    console.log('Received care plan data:', carePlanData)
    
    if (!carePlanData.patientInfo?.name || !carePlanData.patientInfo?.diagnosis) {
      return NextResponse.json({ 
        error: 'Patient name and diagnosis are required' 
      }, { status: 400 })
    }

   await connectToDB()

    // Replace with your user ID from auth
    const userId = authHeader._id // Get from your auth system

    const carePlan = new CarePlan({
      userId,
      patientName: carePlanData.patientInfo.name,
      patientAge: carePlanData.patientInfo.age,
      diagnosis: carePlanData.patientInfo.diagnosis,
      problems: carePlanData.problems
    })

    const savedPlan = await carePlan.save()

    return NextResponse.json({ 
      success: true,
      carePlanId: carePlan._id 
    })

  } catch (error) {
    console.error('Care plan save error:', error)
    return NextResponse.json({ 
      error: 'Failed to save care plan' 
    }, { status: 500 })
  }
}