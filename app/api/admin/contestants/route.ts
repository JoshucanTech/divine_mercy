import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { mockDb } from '@/lib/mock-db'
import { z } from 'zod'

// Middleware to check auth
async function requireAuth(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const CreateContestantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const contestants = mockDb.getContestants()
    return NextResponse.json(contestants)
  } catch (error) {
    console.error('Get contestants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { name, description, imageUrl } = CreateContestantSchema.parse(body)

    const contestant = mockDb.createContestant(name, description || '', imageUrl)

    return NextResponse.json(contestant, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
