import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/lib/models/user.models'
import { CoinTransaction } from '@/lib/models/coin-transaction.models'
import { currentUser } from '@/lib/helpers/session'

export async function DELETE(request: NextRequest) {
  try {
    await connectToDB()
    
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete the user account (mark as deleted instead of hard delete)
    const deletedUser = await User.findByIdAndUpdate(
      user._id,
      {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        // Clear sensitive data
        email: `deleted_${user._id}@deleted.com`,
        phone: null,
        paystackCustomerId: null,
        coinBalance: 0,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a final transaction record for account deletion
    await CoinTransaction.create({
      userId: user._id,
      type: 'usage',
      amount: -user.coinBalance || 0,
      description: 'Account deletion - coins forfeited',
      balanceAfter: 0,
      createdAt: new Date()
    })

    return NextResponse.json({
      message: 'Account deleted successfully',
      deletedAt: deletedUser.deletedAt
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}