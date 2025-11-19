import { NextRequest } from 'next/server'
import User from '@/lib/models/user.models'
import Usage from '@/lib/models/usage.models'
import { connectToDB } from './mongoose'
import { currentUser } from './helpers/session'


export async function checkSubscriptionAccess(request?: NextRequest, feature?: 'chat' | 'prescription' | 'diagnosis') {
  try {
    // Replace with your auth logic
    const session = await currentUser()
    if (!session) {
      return { hasAccess: false, error: 'Unauthorized' }
    }

    await connectToDB()
    
    // Replace this with your user lookup logic
    const userEmail = session.email // Get from your auth system
    const user = await User.findOne({ email: userEmail })
    
    if (!user) {
      return { hasAccess: false, error: 'User not found' }
    }

    if (!user.canAccessFeatures()) {
      return { 
        hasAccess: false, 
        error: 'Trial expired. Please upgrade to continue using MedAssist AI.',
        trialExpired: true
      }
    }

    const limits = user.getUsageLimits()
    
    // Check current usage if feature is specified
    if (feature && limits[feature === 'chat' ? 'chatMessages' : feature === 'prescription' ? 'prescriptions' : 'diagnoses'] !== -1) {
      const currentUsage = await (Usage as any).getCurrentUsage(user._id.toString(), feature)
      const limit = limits[feature === 'chat' ? 'chatMessages' : feature === 'prescription' ? 'prescriptions' : 'diagnoses'] as number
      
      if (currentUsage >= limit) {
        return {
          hasAccess: false,
          error: `Monthly ${feature} limit reached. Upgrade to continue.`,
          limitReached: true,
          currentUsage,
          limit
        }
      }
    }

    return { 
      hasAccess: true, 
      limits,
      plan: user.subscriptionPlan,
      userId: user._id.toString()
    }

  } catch (error) {
    console.error('Subscription check error:', error)
    return { hasAccess: false, error: 'Internal error' }
  }
}

export async function trackUsage(userId: string, feature: 'chat' | 'prescription' | 'diagnosis') {
  try {
    await connectToDB()
    await (Usage as any).incrementUsage(userId, feature)
  } catch (error) {
    console.error('Usage tracking error:', error)
  }
}