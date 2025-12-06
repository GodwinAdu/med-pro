import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { DrugSearch } from '@/lib/models/drug-search.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
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

    const search = await DrugSearch.findOne({ _id: id, userId: user._id }).lean()

    if (!search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 })
    }

    return NextResponse.json({
      search: {
        id: search._id.toString(),
        searchType: search.searchType,
        drugName: search.drugName,
        result: search.result,
        searchedAt: search.searchedAt
      }
    })
  } catch (error) {
    console.error('Get drug search error:', error)
    return NextResponse.json({ error: 'Failed to get search' }, { status: 500 })
  }
}
