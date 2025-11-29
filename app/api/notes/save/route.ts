import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { Note } from '@/lib/models/notes.models'
import { currentUser } from '@/lib/helpers/session'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { title, content, noteType, profession } = await request.json()

    if (!title || !content || !noteType || !profession) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const note = await Note.create({
      userId: user._id,
      title,
      content,
      noteType,
      profession
    })

    return NextResponse.json({ 
      message: 'Note saved successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        noteType: note.noteType,
        profession: note.profession,
        createdAt: note.createdAt
      }
    })

  } catch (error) {
    console.error('Save note error:', error)
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
  }
}