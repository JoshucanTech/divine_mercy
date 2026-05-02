import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const VoteRequestSchema = z.object({
  contestantId: z.string().min(1),
  voterEmail: z.string().email(),
  voterName: z.string().optional(),
  voterPhone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contestantId, voterEmail, voterName } = VoteRequestSchema.parse(body)

    // 1. Check voting is active
    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings?.votingActive) {
      return NextResponse.json(
        { error: 'Voting is not currently active.' },
        { status: 400 }
      )
    }

    // 2. Verify contestant exists
    const contestant = await prisma.contestant.findUnique({
      where: { id: contestantId },
    })

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found.' },
        { status: 404 }
      )
    }

    // 3. Create pending transaction
    const reference = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9)
    const transaction = await prisma.transaction.create({
      data: {
        contestantId,
        voterEmail,
        voterName: voterName || null,
        amount: settings.voteCost,
        currency: settings.currency,
        status: 'pending',
        flutterRef: reference, // Using reference as flutterRef for now
      },
    })

    // For demo/development, return a mock payment URL
    // In production, you would call Flutterwave API here to get a real payment URL
    const mockPaymentUrl = `/vote/payment?reference=${reference}`

    return NextResponse.json({
      transactionId: transaction.id,
      reference: transaction.flutterRef,
      amount: transaction.amount,
      currency: transaction.currency,
      paymentUrl: mockPaymentUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Vote initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
