import { NextRequest, NextResponse } from 'next/server'
import User from '@/lib/models/user.models'
import { connectToDB } from '@/lib/mongoose'
import { currentUser } from '@/lib/helpers/session'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    console.log('Verifying payment with reference:', reference)

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Paystack verification response:', data)

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    await connectToDB()

    // Extract metadata from payment
    const { metadata } = data.data
    const { userId, plan, duration } = metadata

    console.log('Payment metadata:', { userId, plan, duration })

    if (!userId || !plan || !duration) {
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 })
    }



    // Calculate subscription end date based on duration
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + parseInt(duration))
    
    console.log('Subscription dates:', { startDate, endDate, duration })

    // Update user subscription
    const updatedUser = await User.findByIdAndUpdate(userId, {
      subscriptionPlan: plan,
      subscriptionDuration: parseInt(duration),
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      paymentReference: reference,
      paymentStatus: 'completed'
    }, { new: true })

    console.log('User subscription updated:', updatedUser?.subscriptionPlan)

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription updated',
      subscription: {
        plan,
        duration,
        startDate,
        endDate
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify payment' 
    }, { status: 500 })
  }
}