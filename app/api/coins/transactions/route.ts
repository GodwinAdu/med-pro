import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/helpers/session'
import { connectToDB } from '@/lib/mongoose'
import CoinTransaction from '@/lib/models/coin-transaction.models'
import User from '@/lib/models/user.models'

export async function GET(request: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectToDB()

    // Get user for current balance
    const user = await User.findById(authUser._id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get transactions
    const transactions = await CoinTransaction.find({ userId: authUser._id })
      .sort({ createdAt: -1 })
      .limit(50)

    // Calculate stats
    const stats = {
      totalEarned: user.totalCoinsEarned,
      totalSpent: user.totalCoinsSpent,
      currentBalance: user.coinBalance
    }

    return NextResponse.json({
      transactions,
      stats
    })

  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}