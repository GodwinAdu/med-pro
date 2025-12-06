import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import { ChatSession } from '@/lib/models/chat.models'
import { currentUser } from '@/lib/helpers/session'

function generateSmartTitle(firstMessage: string): string {
  // Extract key medical terms or create descriptive title
  const message = firstMessage.toLowerCase()
  
  // Check for common medical scenarios
  if (message.includes('chest pain') || message.includes('cardiac')) {
    return '💔 Chest Pain Case'
  }
  if (message.includes('fever') || message.includes('temperature')) {
    return '🌡️ Fever Assessment'
  }
  if (message.includes('headache') || message.includes('migraine')) {
    return '🧠 Headache Consultation'
  }
  if (message.includes('abdominal') || message.includes('stomach')) {
    return '🏥 Abdominal Case'
  }
  if (message.includes('respiratory') || message.includes('breathing') || message.includes('cough')) {
    return '🫁 Respiratory Issue'
  }
  if (message.includes('diabetes') || message.includes('blood sugar')) {
    return '💉 Diabetes Management'
  }
  if (message.includes('hypertension') || message.includes('blood pressure')) {
    return '❤️ Hypertension Case'
  }
  if (message.includes('pediatric') || message.includes('child')) {
    return '👶 Pediatric Case'
  }
  if (message.includes('emergency') || message.includes('urgent')) {
    return '🚨 Emergency Consultation'
  }
  if (message.includes('prescription') || message.includes('medication')) {
    return '💊 Medication Query'
  }
  if (message.includes('diagnosis') || message.includes('differential')) {
    return '🔍 Diagnostic Discussion'
  }
  
  // Default: use first 40 characters
  return firstMessage.substring(0, 40).trim() + (firstMessage.length > 40 ? '...' : '')
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    console.log('Current user:', user)
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    
    const { sessionId, messages, title } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Filter out messages without content
    const validMessages = messages.filter(m => m.content && m.content.trim())

    if (validMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages to save' }, { status: 400 })
    }

    let session

    if (sessionId) {
      // Update existing session - don't change title
      session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId: user._id },
        {
          messages: validMessages,
          lastMessageAt: new Date()
        },
        { new: true, upsert: false }
      )
    } else {
      // Create new session with smart title
      const firstMessage = validMessages[0]?.content || ''
      const smartTitle = generateSmartTitle(firstMessage)
      
      session = await ChatSession.create({
        userId: user._id,
        messages: validMessages,
        title: smartTitle,
        lastMessageAt: new Date()
      })
    }

    return NextResponse.json({
      sessionId: session._id.toString(),
      message: 'Chat saved successfully'
    })

  } catch (error) {
    console.error('Save chat error:', error)
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 })
  }
}
