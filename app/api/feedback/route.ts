import { currentUser } from '@/lib/helpers/session'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface FeedbackData {
  name: string
  email: string
  type: string
  priority: string
  subject: string
  message: string
  deviceInfo?: string
  steps?: string
  timestamp: string
  userAgent: string
}

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS 
    }
  })
}

const generateEmailHTML = (data: FeedbackData, user: { fullName?: string; email?: string }) => {
  const typeIcons = {
    bug: '🐛',
    feature: '💡',
    improvement: '⭐',
    general: '💬'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Doctor Assistance App - Feedback</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 8px; background: white; border-radius: 4px; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>🏥 MedPro - New Feedback</h2>
        <p>Received: ${new Date(data.timestamp).toLocaleString()}</p>
      </div>
      
      <div class="content">
        <div class="field">
          <div class="label">Contact Information</div>
          <div class="value">
            <strong>Name:</strong> ${user.fullName || 'N/A'}<br>
            <strong>Email:</strong> ${user.email || 'N/A'}
          </div>
        </div>

        <div class="field">
          <div class="label">Feedback Details</div>
          <div class="value">
            <strong>Type:</strong> ${typeIcons[data.type as keyof typeof typeIcons]} ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}<br>
            <strong>Priority:</strong> ${data.priority.toUpperCase()}<br>
            <strong>Subject:</strong> ${data.subject}
          </div>
        </div>

        <div class="field">
          <div class="label">Message</div>
          <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
        </div>

        ${data.steps ? `
        <div class="field">
          <div class="label">Steps to Reproduce</div>
          <div class="value">${data.steps.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${data.deviceInfo ? `
        <div class="field">
          <div class="label">Device Information</div>
          <div class="value">${data.deviceInfo}</div>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {  
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
    
    const data: FeedbackData = await request.json()

    if ( !data.type || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const transporter = createTransporter()

    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `MedPro ${data.type.toUpperCase()} - ${data.subject}`,
      html: generateEmailHTML(data, user),
      replyTo: user.email
    }

    const userMailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Thank you for your feedback - MedPro App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🏥 Thank You for Your Feedback!</h2>
          <p>Dear ${user.fullName || 'User'},</p>
          <p>Thank you for your ${data.type} report. We have received your feedback and will review it shortly.</p>
          <p>We typically respond within 24-48 hours for critical issues.</p>
          <p>Best regards,<br>The MedPro Team</p>
        </div>
      `
    }

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ])

    return NextResponse.json({ message: 'Feedback sent successfully' })

  } catch (error) {
    console.error('Error sending feedback:', error)
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 })
  }
}