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

    // 5. Initiate Flutterwave Payment
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
    let paymentUrl = `/vote/payment?reference=${reference}` // Fallback mock URL

    if (secretKey && !secretKey.includes('your-secret')) {
      try {
        const response = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tx_ref: reference,
            amount: transaction.amount,
            currency: transaction.currency,
            redirect_url: `${process.env.NEXTAUTH_URL}/vote/verify`,
            customer: {
              email: transaction.voterEmail,
              name: transaction.voterName || 'Anonymous Voter',
            },
            customizations: {
              title: 'DivineMercy Voting',
              description: `Voting for ${contestant.name} (${transaction.voteCount} votes)`,
              logo: 'https://divinemercy.voting/logo.png',
            },
          }),
        })

        const fwData = await response.json()
        if (fwData.status === 'success') {
          paymentUrl = fwData.data.link
        } else {
          console.error('Flutterwave initiation error:', fwData)
          // Still return mock URL in dev if FW fails
        }
      } catch (err) {
        console.error('Fetch error calling Flutterwave:', err)
      }
    }

    return NextResponse.json({
      transactionId: transaction.id,
      reference: transaction.flutterRef,
      amount: transaction.amount,
      currency: transaction.currency,
      voteCount: transaction.voteCount,
      paymentUrl,
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
