import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/mock-db'

// Verify Flutterwave webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // In production, use actual Flutterwave secret
  // For now, skip verification for mock testing
  return true
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('verif-hash') || ''
    const body = await request.json()

    // Verify signature
    // if (!verifyWebhookSignature(JSON.stringify(body), signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { event, data } = body

    if (event !== 'charge.completed') {
      return NextResponse.json({ status: 'ok' })
    }

    const { meta, flw_ref, status, amount } = data

    if (status !== 'successful') {
      return NextResponse.json({ status: 'ok' })
    }

    const reference = meta?.reference

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing reference in webhook' },
        { status: 400 }
      )
    }

    // Update transaction and increment vote count
    mockDb.updateTransaction(reference, 'completed')

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Mock endpoint for testing payment completion
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Simulate payment completion
    const transaction = mockDb.updateTransaction(reference, 'completed')

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      transaction,
    })
  } catch (error) {
    console.error('Mock payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
