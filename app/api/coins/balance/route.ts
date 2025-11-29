import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/lib/models/user.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectToDB()
    
    const user = await User.findById(authUser._id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      coinBalance: user.coinBalance,
      totalCoinsEarned: user.totalCoinsEarned,
      totalCoinsSpent: user.totalCoinsSpent,
      canClaimDailyBonus: user.canClaimDailyBonus()
    })

  } catch (error) {
    console.error('Balance fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}