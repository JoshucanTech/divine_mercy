import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const VoteRequestSchema = z.object({
  contestantId: z.string().min(1),
  voterEmail: z.string().email().optional().nullable(),
  voterName: z.string().optional().nullable(),
  packageId: z.string().min(1),
  amount: z.number().positive(),
  voteCount: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contestantId, voterEmail, voterName, amount, voteCount } = VoteRequestSchema.parse(body)

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

    // 3. Handle optional email
    const finalEmail = voterEmail || `anon_${Date.now()}@divinemercy.voting`

    // 4. Create pending transaction with the specific vote count
    const reference = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9)
    const transaction = await prisma.transaction.create({
      data: {
        contestantId,
        voterEmail: finalEmail,
        voterName: voterName || null,
        amount,
        voteCount, // Store the number of votes purchased
        currency: settings.currency,
        status: 'pending',
        flutterRef: reference,
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
      voteCount: transaction.voteCount,
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
