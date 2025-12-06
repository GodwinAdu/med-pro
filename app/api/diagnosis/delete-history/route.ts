import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Diagnosis } from '@/lib/models/diagnosis.models'
import { currentUser } from '@/lib/helpers/session'

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Diagnosis ID required' }, { status: 400 })
    }

    await connectToDB()

    const result = await Diagnosis.deleteOne({ _id: id, userId: user._id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Diagnosis deleted successfully' })
  } catch (error) {
    console.error('Delete diagnosis error:', error)
    return NextResponse.json({ error: 'Failed to delete diagnosis' }, { status: 500 })
  }
}
