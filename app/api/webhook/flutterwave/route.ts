import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { broadcastUpdate } from '../../leaderboard/stream/route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    if (event !== 'charge.completed' || data.status !== 'successful') {
      return NextResponse.json({ status: 'ok' })
    }

    const reference = data.meta?.reference || data.tx_ref

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    // Use a transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { flutterRef: reference },
      })

      if (transaction && transaction.status !== 'completed') {
        // 1. Update transaction
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'completed',
            voteApplied: true,
            updatedAt: new Date(),
          },
        })

        // 2. Increment vote count
        await tx.contestant.update({
          where: { id: transaction.contestantId },
          data: {
            voteCount: { increment: 1 },
          },
        })
      }
    })

    // Trigger SSE broadcast
    broadcastUpdate()

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

// Mock endpoint for testing payment completion
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')
    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { flutterRef: reference },
      })

      if (transaction && transaction.status !== 'completed') {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'completed', voteApplied: true },
        })

        await tx.contestant.update({
          where: { id: transaction.contestantId },
          data: { voteCount: { increment: 1 } },
        })
      }
    })

    broadcastUpdate()
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
