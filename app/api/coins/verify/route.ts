import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/helpers/session'
import { addCoins } from '@/lib/coin-middleware'

export async function POST(request: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { reference } = await request.json()
    
    if (!reference) {
      return NextResponse.json({ error: 'Payment reference required' }, { status: 400 })
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const verifyResult = await verifyResponse.json()

    if (!verifyResult.status || verifyResult.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const { metadata } = verifyResult.data

    if (metadata?.type !== 'coin_purchase' || metadata?.userId !== authUser._id) {
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 })
    }

    // Add coins to user account
    const success = await addCoins(
      authUser._id,
      metadata.coins,
      'purchase',
      `Purchased ${metadata.coins} coins (manual verification)`,
      reference
    )

    if (!success) {
      return NextResponse.json({ error: 'Failed to add coins' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      coins: metadata.coins,
      message: `Successfully added ${metadata.coins} coins to your account`
    })

  } catch (error) {
    console.error('Manual coin verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}