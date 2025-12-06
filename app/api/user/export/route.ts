import { NextResponse } from 'next/server'
import { currentUser } from '@/lib/helpers/session'
import { connectToDB } from '@/lib/mongoose'
import { ChatSession } from '@/lib/models/chat.models'
import { Prescription } from '@/lib/models/prescription.models'
import { Diagnosis } from '@/lib/models/diagnosis.models'
import CarePlan from '@/lib/models/care-plan.models'
import { DrugSearch } from '@/lib/models/drug-search.models'
import  CoinTransaction  from '@/lib/models/coin-transaction.models'

export async function GET() {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectToDB()

    const [chats, prescriptions, diagnoses, carePlans, drugSearches, transactions] = await Promise.all([
      ChatSession.find({ userId: authUser._id }).lean(),
      Prescription.find({ userId: authUser._id }).lean(),
      Diagnosis.find({ userId: authUser._id }).lean(),
      CarePlan.find({ userId: authUser._id }).lean(),
      DrugSearch.find({ userId: authUser._id }).lean(),
      CoinTransaction.find({ userId: authUser._id }).lean()
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        fullName: authUser.fullName,
        email: authUser.email,
        role: authUser.role
      },
      data: {
        chats,
        prescriptions,
        diagnoses,
        carePlans,
        drugSearches,
        transactions
      },
      summary: {
        totalChats: chats.length,
        totalPrescriptions: prescriptions.length,
        totalDiagnoses: diagnoses.length,
        totalCarePlans: carePlans.length,
        totalDrugSearches: drugSearches.length,
        totalTransactions: transactions.length
      }
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="medpro-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
