import { NextRequest, NextResponse } from 'next/server'
import User from '@/lib/models/user.models'
import { connectToDB } from '@/lib/mongoose'
import { currentUser } from '@/lib/helpers/session'


interface InitializeRequest {
  plan: 'basic' | 'pro'
  duration: 1 | 3 | 6 | 12
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PLAN_CODES = {
  basic: process.env.PAYSTACK_BASIC_PLAN_CODE,
  pro: process.env.PAYSTACK_PRO_PLAN_CODE
}

export async function POST(request: NextRequest) {
  try {
    // Get user from your auth system (replace with your auth logic)
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const { plan, duration }: InitializeRequest = await request.json()
    
    console.log('Received request:', { plan, duration })
    
    if (!plan || !['basic', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!duration || ![1, 3, 6, 12].includes(duration)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    const monthlyPrice = plan === 'basic' ? 7000 : 15000 // Amount in pesewas (GHS)
    
    // Apply discounts: 3 months = 5%, 6 months = 10%, 12 months = 15%
    const discountRates = { 1: 0, 3: 0.05, 6: 0.10, 12: 0.15 }
    const baseAmount = monthlyPrice * duration
    const discount = baseAmount * discountRates[duration]
    const totalAmount = Math.round(baseAmount - discount)
    
    console.log('Price calculation:', { monthlyPrice, duration, baseAmount, discount, totalAmount })

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: totalAmount,
        currency: 'GHS',
        callback_url: `${process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscription/callback`,
        channels: ['card'],
        metadata: {
          userId: user._id,
          plan: plan,
          duration: duration,
          fullName: user.fullName,
          // paymentType: 'one-time'
        }
      })
    })

    const data = await response.json()
    
    if (!data.status) {
      throw new Error(data.message || 'Payment initialization failed')
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
    })

  } catch (error) {
    console.error('Subscription initialization error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize payment' 
    }, { status: 500 })
  }
}