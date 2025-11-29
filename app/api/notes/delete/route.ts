import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Note } from '@/lib/models/notes.models'
import { currentUser } from '@/lib/helpers/session'

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    await Note.findOneAndDelete({ _id: noteId, userId: user._id })

    return NextResponse.json({ message: 'Note deleted successfully' })

  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}