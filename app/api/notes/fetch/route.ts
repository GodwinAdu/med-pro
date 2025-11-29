import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Note } from '@/lib/models/notes.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const notes = await Note.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean()

    const formattedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      profession: note.profession,
      timestamp: new Date(note.createdAt).toLocaleString()
    }))

    return NextResponse.json({ notes: formattedNotes })

  } catch (error) {
    console.error('Fetch notes error:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}