import { NextResponse } from 'next/server'

// This route has been deprecated - the app now uses a coin-based system
// Coin purchases are handled by /api/coins/purchase
export async function POST() {
  return NextResponse.json({ 
    error: 'This payment method is no longer supported. Please use the coin purchase system.' 
  }, { status: 410 })
}