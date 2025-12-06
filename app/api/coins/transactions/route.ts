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

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get user for current balance
    const user = await User.findById(authUser._id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get total count for pagination
    const total = await CoinTransaction.countDocuments({ userId: authUser._id })

    // Get transactions with pagination
    const transactions = await CoinTransaction.find({ userId: authUser._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Calculate stats
    const stats = {
      totalEarned: user.totalCoinsEarned,
      totalSpent: user.totalCoinsSpent,
      currentBalance: user.coinBalance
    }

    return NextResponse.json({
      transactions,
      stats,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + transactions.length < total
      }
    })

  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}