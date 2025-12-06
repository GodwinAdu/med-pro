import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { DrugSearch } from '@/lib/models/drug-search.models'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { searchType, drugName, result } = await request.json()

    if (!searchType || !drugName || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for recent duplicate (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existingSearch = await DrugSearch.findOne({
      userId: user._id,
      searchType,
      drugName: { $regex: new RegExp(`^${drugName}$`, 'i') },
      searchedAt: { $gte: fiveMinutesAgo }
    })

    if (existingSearch) {
      return NextResponse.json({
        searchId: existingSearch._id.toString(),
        message: 'Search already exists',
        duplicate: true
      })
    }

    const search = await DrugSearch.create({
      userId: user._id,
      searchType,
      drugName,
      result
    })

    return NextResponse.json({
      searchId: search._id.toString(),
      message: 'Search saved successfully'
    })
  } catch (error) {
    console.error('Save drug search error:', error)
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 })
  }
}
