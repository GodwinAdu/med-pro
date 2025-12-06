import { NextResponse } from 'next/server'
import { currentUser } from '@/lib/helpers/session'
import { connectToDB } from '@/lib/mongoose'
import { ChatSession } from '@/lib/models/chat.models'
import { Prescription } from '@/lib/models/prescription.models'
import { Diagnosis } from '@/lib/models/diagnosis.models'
import { DrugSearch } from '@/lib/models/drug-search.models'
import CarePlan from '@/lib/models/care-plan.models'

export async function GET() {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectToDB()

    const [chatCount, prescriptionCount, diagnosisCount, carePlanCount, drugSearchCount] = await Promise.all([
      ChatSession.countDocuments({ userId: authUser._id }),
      Prescription.countDocuments({ userId: authUser._id }),
      Diagnosis.countDocuments({ userId: authUser._id }),
      CarePlan.countDocuments({ userId: authUser._id }),
      DrugSearch.countDocuments({ userId: authUser._id })
    ])

    return NextResponse.json({
      stats: {
        totalChats: chatCount,
        totalPrescriptions: prescriptionCount,
        totalDiagnoses: diagnosisCount,
        totalCarePlans: carePlanCount,
        totalDrugSearches: drugSearchCount
      }
    })

  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
