import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { DrugSearch } from '@/lib/models/drug-search.models'
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
      return NextResponse.json({ error: 'Search ID required' }, { status: 400 })
    }

    await connectToDB()

    const result = await DrugSearch.deleteOne({ _id: id, userId: user._id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Search deleted successfully' })
  } catch (error) {
    console.error('Delete drug search error:', error)
    return NextResponse.json({ error: 'Failed to delete search' }, { status: 500 })
  }
}
