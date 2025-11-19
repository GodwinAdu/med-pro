import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import User from '@/lib/models/user.models'
import { connectToDB } from '@/lib/mongoose'


export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    
    if (event.event === 'subscription.create' || event.event === 'charge.success') {
      await connectToDB()
      
      const { metadata } = event.data
      const userId = metadata?.userId
      const plan = metadata?.plan
      
      if (userId && plan) {
        const user = await User.findById(userId)
        if (user) {
          const now = new Date()
          const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
          
          user.subscriptionPlan = plan
          user.subscriptionStartDate = now
          user.subscriptionEndDate = endDate
          user.paystackCustomerId = event.data.customer?.id
          user.paystackSubscriptionCode = event.data.subscription_code
          
          await user.save()
        }
      }
    }

    return NextResponse.json({ status: 'success' })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}