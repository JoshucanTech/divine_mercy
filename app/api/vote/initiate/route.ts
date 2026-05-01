import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/mock-db'
import { z } from 'zod'

const VoteRequestSchema = z.object({
  contestantId: z.string().min(1),
  voterEmail: z.string().email(),
  voterName: z.string().optional(),
  voterPhone: z.string().optional(),
})

// Mock rate limiting (in production, use Upstash Redis)
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(email) || []
  const recentRequests = timestamps.filter((t) => now - t < 60000) // 1 minute window
  
  if (recentRequests.length >= 5) {
    return true
  }
  
  rateLimitMap.set(email, [...recentRequests, now])
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contestantId, voterEmail, voterName, voterPhone } = VoteRequestSchema.parse(body)

    // Check rate limit
    if (isRateLimited(voterEmail)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Check voting is active
    const settings = mockDb.getSettings()

    if (!settings?.isActive) {
      return NextResponse.json(
        { error: 'Voting is not currently active.' },
        { status: 400 }
      )
    }

    // Check max votes per user
    const userVoteCount = mockDb.getVoteCount(voterEmail)
    if (userVoteCount >= settings.maxVotesPerUser) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${settings.maxVotesPerUser} votes.` },
        { status: 400 }
      )
    }

    // Verify contestant exists
    const contestant = mockDb.getContestant(contestantId)

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found.' },
        { status: 404 }
      )
    }

    // Create pending transaction
    const reference = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9)
    const transaction = mockDb.createTransaction(
      reference,
      settings.votePrice,
      contestantId,
      voterEmail,
      voterPhone || ''
    )

    // In production, initialize Flutterwave payment
    // For demo, return mock payment data
    const mockPaymentUrl = `/vote/payment?reference=${reference}`

    return NextResponse.json({
      transactionId: transaction.id,
      reference: transaction.reference,
      amount: settings.votePrice,
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
