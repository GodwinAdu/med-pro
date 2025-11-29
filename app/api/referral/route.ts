import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/lib/models/user.models'
import { addCoins } from '@/lib/coin-middleware'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { referralCode } = await request.json()
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    await connectToDB()
    
    const user = await User.findById(authUser._id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already used a referral code
    if (user.referredBy) {
      return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 })
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode: referralCode.toLowerCase() })
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Can't refer yourself
    if (referrer._id.toString() === user._id.toString()) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 })
    }

    // Update user with referral
    user.referredBy = referrer._id
    await user.save()

    // Update referrer count
    referrer.referralCount += 1
    await referrer.save()

    // Give coins to both users
    const referrerBonus = 50 // Referrer gets 50 coins
    const refereeBonus = 25  // New user gets 25 coins

    await addCoins(referrer._id.toString(), referrerBonus, 'bonus', `Referral bonus for referring ${user.fullName}`)
    await addCoins(user._id.toString(), refereeBonus, 'bonus', `Welcome bonus for using referral code ${referralCode}`)

    return NextResponse.json({
      success: true,
      message: `Success! You received ${refereeBonus} coins and ${referrer.fullName} received ${referrerBonus} coins!`,
      coinsReceived: refereeBonus
    })

  } catch (error) {
    console.error('Referral error:', error)
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
  }
}

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
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      hasUsedReferral: !!user.referredBy
    })

  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json({ error: 'Failed to get referral info' }, { status: 500 })
  }
}