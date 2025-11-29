import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import CarePlan from '@/lib/models/care-plan.models'
import { currentUser } from '@/lib/helpers/session'

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = await currentUser()
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const carePlanId = searchParams.get('id')

    if (!carePlanId) {
      return NextResponse.json({ error: 'Care plan ID is required' }, { status: 400 })
    }

    await connectToDB()

    const userId = authHeader._id
    const deletedPlan = await CarePlan.findOneAndDelete({ 
      _id: carePlanId, 
      userId 
    })

    if (!deletedPlan) {
      return NextResponse.json({ error: 'Care plan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Care plan delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete care plan' 
    }, { status: 500 })
  }
}