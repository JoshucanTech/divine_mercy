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

const UpdateContestantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  voteCount: z.number().int().min(0).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contestant = mockDb.getContestant(params.id)

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contestant)
  } catch (error) {
    console.error('Get contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const updates = UpdateContestantSchema.parse(body)

    const contestant = mockDb.updateContestant(params.id, updates)

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contestant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const success = mockDb.deleteContestant(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Contestant deleted successfully' })
  } catch (error) {
    console.error('Delete contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
