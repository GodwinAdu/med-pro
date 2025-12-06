import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { ChatSession } from '@/lib/models/chat.models'
import { currentUser } from '@/lib/helpers/session'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await ChatSession.findOne({ 
      _id: sessionId, 
      userId: user._id 
    }).lean()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      session: {
        id: session._id.toString(),
        title: session.title,
        messages: session.messages.map(m => ({
          id: m._id?.toString() || Date.now().toString(),
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        })),
        lastMessageAt: session.lastMessageAt
      }
    })

  } catch (error) {
    console.error('Fetch session error:', error)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}
