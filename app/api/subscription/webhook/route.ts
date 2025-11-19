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
    console.log('Webhook event received:', event.event, event.data)
    
    // Handle successful payment events
    if (event.event === 'charge.success' && event.data.status === 'success') {
      await connectToDB()
      
      const { metadata } = event.data
      const userId = metadata?.userId
      const plan = metadata?.plan
      const duration = metadata?.duration || 1
      
      if (userId && plan) {
        const user = await User.findById(userId)
        if (user) {
          const now = new Date()
          // Calculate end date based on duration in months
          const endDate = new Date(now)
          endDate.setMonth(endDate.getMonth() + duration)
          
          user.subscriptionPlan = plan
          user.subscriptionStartDate = now
          user.subscriptionEndDate = endDate
          user.paystackCustomerId = event.data.customer?.id || event.data.customer?.customer_code
          
          await user.save()
          console.log(`Updated user ${userId} to ${plan} plan for ${duration} months`)
        }
      }
    }

    return NextResponse.json({ status: 'success' })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}