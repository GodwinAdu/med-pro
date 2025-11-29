import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { addCoins } from '@/lib/coin-middleware'

export async function POST(request: NextRequest) {
  try {
    console.log('Webhook received:', new Date().toISOString())
    
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    console.log('Webhook body length:', body.length)
    console.log('Signature present:', !!signature)

    if (!signature) {
      console.log('No signature provided')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.log('Invalid signature - hash mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Event type:', event.event)
    console.log('Event data:', JSON.stringify(event.data, null, 2))

    if (event.event === 'charge.success') {
      const { metadata, reference } = event.data
      console.log('Charge success - metadata:', metadata)

      if (metadata?.type === 'coin_purchase') {
        const { userId, coins } = metadata
        console.log(`Processing coin purchase: ${coins} coins for user ${userId}`)

        const success = await addCoins(
          userId,
          coins,
          'purchase',
          `Purchased ${coins} coins`,
          reference
        )

        if (success) {
          console.log(`Successfully added ${coins} coins to user ${userId}`)
        } else {
          console.log(`Failed to add coins to user ${userId}`)
        }
      } else {
        console.log('Not a coin purchase transaction')
      }
    } else {
      console.log('Not a charge.success event')
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Coin webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}