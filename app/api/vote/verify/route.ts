import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { flutterRef: reference },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: transaction.id,
      reference: transaction.flutterRef,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      voteApplied: transaction.voteApplied,
    })
  } catch (error) {
    console.error('Verify vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
