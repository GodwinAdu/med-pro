import { NextRequest } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/lib/models/user.models'
import CoinTransaction from '@/lib/models/coin-transaction.models'
import { currentUser } from '@/lib/helpers/session'

// Feature costs in coins
export const FEATURE_COSTS = {
  chat: 5,
  diagnosis: 5,
  prescription: 8,
  'care-plan': 15,
  'drug-search': 2,
  'voice-tts': 3,
  'voice-stt': 3,
  notes: 10,
} as const

export type FeatureType = keyof typeof FEATURE_COSTS

interface CoinCheckResult {
  hasAccess: boolean
  userId?: string
  coinBalance?: number
  error?: string
  insufficientCoins?: boolean
}

export async function checkCoinAccess(
  request: NextRequest, 
  feature: FeatureType
): Promise<CoinCheckResult> {
  try {
    const authUser = await currentUser()
    
    if (!authUser) {
      return { 
        hasAccess: false, 
        error: 'Authentication required' 
      }
    }

    await connectToDB()
    
    const user = await User.findById(authUser._id)
    if (!user) {
      return { 
        hasAccess: false, 
        error: 'User not found' 
      }
    }

    const cost = FEATURE_COSTS[feature]
    
    if (!user.canAfford(cost)) {
      return {
        hasAccess: false,
        userId: user._id.toString(),
        coinBalance: user.coinBalance,
        error: `Insufficient coins. Need ${cost} coins, have ${user.coinBalance}`,
        insufficientCoins: true
      }
    }

    return {
      hasAccess: true,
      userId: user._id.toString(),
      coinBalance: user.coinBalance
    }

  } catch (error) {
    console.error('Coin access check error:', error)
    return { 
      hasAccess: false, 
      error: 'System error' 
    }
  }
}

export async function deductCoins(
  userId: string, 
  feature: FeatureType,
  description?: string
): Promise<boolean> {
  try {
    await connectToDB()
    
    const user = await User.findById(userId)
    if (!user) return false

    const cost = FEATURE_COSTS[feature]
    
    if (!user.deductCoins(cost)) {
      return false
    }

    await user.save()

    // Record transaction
    await CoinTransaction.create({
      userId,
      type: 'usage',
      amount: -cost,
      description: description || `Used ${feature} feature`,
      feature,
      balanceAfter: user.coinBalance
    })

    return true

  } catch (error) {
    console.error('Coin deduction error:', error)
    return false
  }
}

export async function addCoins(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund',
  description: string,
  paystackReference?: string
): Promise<boolean> {
  try {
    await connectToDB()
    
    const user = await User.findById(userId)
    if (!user) return false

    const coinAmount = Number(amount)
    user.addCoins(coinAmount)
    await user.save()

    // Record transaction
    await CoinTransaction.create({
      userId,
      type,
      amount: coinAmount,
      description,
      paystackReference,
      balanceAfter: user.coinBalance
    })

    return true

  } catch (error) {
    console.error('Add coins error:', error)
    return false
  }
}

export async function claimDailyBonus(userId: string): Promise<{ success: boolean; coins?: number; message: string }> {
  try {
    await connectToDB()
    
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    if (!user.canClaimDailyBonus()) {
      return { success: false, message: 'Daily bonus already claimed today' }
    }

    const bonusAmount = 2
    user.addCoins(bonusAmount)
    user.lastDailyBonus = new Date()
    await user.save()

    // Record transaction
    await CoinTransaction.create({
      userId,
      type: 'bonus',
      amount: bonusAmount,
      description: 'Daily login bonus',
      balanceAfter: user.coinBalance
    })

    return { 
      success: true, 
      coins: bonusAmount, 
      message: `Claimed ${bonusAmount} coins!` 
    }

  } catch (error) {
    console.error('Daily bonus error:', error)
    return { success: false, message: 'Failed to claim bonus' }
  }
}