import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { mockDb } from '@/lib/mock-db'
import { z } from 'zod'

async function requireAuth(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const UpdateSettingsSchema = z.object({
  votePrice: z.number().positive().optional(),
  platformName: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  maxVotesPerUser: z.number().positive().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const settings = mockDb.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const updates = UpdateSettingsSchema.parse(body)

    const settings = mockDb.updateSettings(updates)

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
