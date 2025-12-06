import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/lib/models/user.models'
import CoinTransaction from '@/lib/models/coin-transaction.models'
import { Note } from '@/lib/models/notes.models'
import  CarePlan  from '@/lib/models/care-plan.models'
import  UserPreferences  from '@/lib/models/preferences.models'
import { ChatSession } from '@/lib/models/chat.models'
import { DrugSearch } from '@/lib/models/drug-search.models'
import { Prescription } from '@/lib/models/prescription.models'
import { Diagnosis } from '@/lib/models/diagnosis.models'
import { currentUser, logout } from '@/lib/helpers/session'

export async function DELETE(request: NextRequest) {
  try {
    await connectToDB()
    
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user._id

    // Delete all user data in parallel
    await Promise.all([
      CoinTransaction.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      CarePlan.deleteMany({ userId }),
      UserPreferences.deleteMany({ userId }),
      ChatSession.deleteMany({ userId }),
      DrugSearch.deleteMany({ userId }),
      Prescription.deleteMany({ userId }),
      Diagnosis.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ])

    // Logout user by clearing cookies
    await logout('/login')

    return NextResponse.json({
      message: 'Account and all data deleted permanently'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}