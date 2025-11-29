import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@/lib/helpers/session'

const COIN_PACKAGES = {
  starter: { coins: 100, price: 2000, name: 'Starter Pack' }, // ₵20 (5 coins/₵)
  value: { coins: 300, price: 5000, name: 'Value Pack' },   // ₵50 (6 coins/₵)
  pro: { coins: 1000, price: 12000, name: 'Pro Pack' }      // ₵120 (8.33 coins/₵)
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await currentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { packageType, amount, coins } = await request.json()
    
    let selectedPackage
    
    if (packageType === 'custom') {
      if (!amount || !coins || amount < 1) {
        return NextResponse.json({ error: 'Invalid custom amount' }, { status: 400 })
      }
      selectedPackage = {
        coins: coins,
        price: Math.round(amount * 100), // Convert Cedis to pesewas
        name: `Custom ${coins} Coins`
      }
    } else {
      if (!packageType || !COIN_PACKAGES[packageType as keyof typeof COIN_PACKAGES]) {
        return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
      }
      selectedPackage = COIN_PACKAGES[packageType as keyof typeof COIN_PACKAGES]
    }

    const paystackData = {
      email: authUser.email,
      amount: selectedPackage.price,
      currency: 'GHS',
      reference: `coin_${Date.now()}_${authUser._id}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/coins`,
      metadata: {
        userId: authUser._id,
        packageType,
        coins: selectedPackage.coins,
        type: 'coin_purchase'
      }
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paystackData)
    })

    const result = await paystackResponse.json()

    if (!result.status) {
      return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
      package: selectedPackage
    })

  } catch (error) {
    console.error('Coin purchase error:', error)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}