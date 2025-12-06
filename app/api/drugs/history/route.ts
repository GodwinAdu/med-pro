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

    await connectToDB()

    const searches = await DrugSearch.find({ userId: user._id })
      .sort({ searchedAt: -1 })
      .limit(50)
      .lean()

    const formattedSearches = searches.map(search => ({
      id: search._id.toString(),
      searchType: search.searchType,
      drugName: search.drugName,
      searchedAt: search.searchedAt,
      preview: search.searchType === 'drug-info' 
        ? search.result?.basicInfo?.generic_name || search.drugName
        : search.searchType === 'interaction'
        ? `${search.drugName} interactions`
        : `${search.drugName} dosage`
    }))

    return NextResponse.json({ searches: formattedSearches })
  } catch (error) {
    console.error('Fetch drug history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
