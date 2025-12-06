import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { ChatSession } from '@/lib/models/chat.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    console.log('Current user:', user)
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const sessions = await ChatSession.find({ userId: user._id })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean()

    const formattedSessions = sessions.map(session => ({
      id: session._id as string,
      title: session.title,
      messageCount: session.messages.length,
      lastMessageAt: session.lastMessageAt,
      preview: session.messages[session.messages.length - 1]?.content.substring(0, 100) || ''
    }))

    return NextResponse.json({ sessions: formattedSessions })

  } catch (error) {
    console.error('Fetch sessions error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
