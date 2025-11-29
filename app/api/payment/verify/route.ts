import { NextResponse } from 'next/server'

// This route has been deprecated - the app now uses a coin-based system
// Payment verification is handled by /api/coins/webhook
export async function POST() {
  return NextResponse.json({ 
    error: 'This payment verification method is no longer supported. The app now uses a coin-based system.' 
  }, { status: 410 })
}