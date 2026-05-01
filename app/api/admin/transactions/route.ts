import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { mockDb } from '@/lib/mock-db'

async function requireAuth(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const status = request.nextUrl.searchParams.get('status')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    const allTransactions = mockDb.getTransactions()
    const filtered = status ? allTransactions.filter(t => t.status === status) : allTransactions
    
    const transactions = filtered.slice(offset, offset + limit)
    const total = filtered.length

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
