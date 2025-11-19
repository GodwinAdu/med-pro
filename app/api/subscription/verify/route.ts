import { NextRequest, NextResponse } from 'next/server'
import User from '@/lib/models/user.models'
import { connectToDB } from '@/lib/mongoose'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference } = await request.json()
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      }
    })

    const data = await response.json()
    
    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    await connectToDB()
    
    const { metadata } = data.data
    const userId = metadata?.userId
    const plan = metadata?.plan
    const duration = metadata?.duration || 1
    
    if (userId && plan && userId === user.id) {
      const dbUser = await User.findById(userId)
      if (dbUser) {
        const now = new Date()
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + duration)
        
        dbUser.subscriptionPlan = plan
        dbUser.subscriptionStartDate = now
        dbUser.subscriptionEndDate = endDate
        dbUser.paystackCustomerId = data.data.customer?.id || data.data.customer?.customer_code
        
        await dbUser.save()
        
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription updated successfully',
          plan,
          endDate 
        })
      }
    }

    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}