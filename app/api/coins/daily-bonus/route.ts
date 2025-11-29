import { NextRequest, NextResponse } from 'next/server'
import { claimDailyBonus } from '@/lib/coin-middleware'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const result = await claimDailyBonus(authUser._id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        coins: result.coins,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Daily bonus error:', error)
    return NextResponse.json({ error: 'Failed to claim bonus' }, { status: 500 })
  }
}