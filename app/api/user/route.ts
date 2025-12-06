import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const authToken = cookieStore.get('auth-token')

        if (!authToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Mock user data based on auth token
        const userData = {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@medicalpractice.com',
            role: 'doctor',
            specialization: 'Internal Medicine',
            credits: 150
        }

        return NextResponse.json(userData)
    } catch (error) {
        console.error('Error fetching user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}