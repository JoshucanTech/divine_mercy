'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TransactionStatus {
  id: string
  reference: string
  status: string
  amount: number
}

function PaymentStatusContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')
  
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setError('No transaction reference provided')
      setIsLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/vote/verify?reference=${reference}`
        )
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
        } else {
          setError('Could not verify transaction')
        }
      } catch (err) {
        setError('Failed to check payment status')
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
    
    // Poll for updates every 3 seconds
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [reference])

  if (isLoading) {
    return (
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking payment status...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md p-8 border-red-200 bg-red-50">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Payment Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="w-full">Back to Voting</Button>
          </Link>
        </div>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <p className="text-gray-600">No transaction found</p>
        </div>
      </Card>
    )
  }

  const isPending = status.status === 'pending'
  const isCompleted = status.status === 'completed'
  const isFailed = status.status === 'failed'

  return (
    <Card className={`w-full max-w-md p-8 ${isCompleted ? 'border-green-200 bg-green-50' : isPending ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
      <div className="text-center">
        <div className={`text-4xl mb-4 ${isCompleted ? '' : isPending ? '' : ''}`}>
          {isCompleted ? '✅' : isPending ? '⏳' : '❌'}
        </div>
        <h2 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-green-800' : isPending ? 'text-blue-800' : 'text-red-800'}`}>
          {isCompleted ? 'Payment Confirmed!' : isPending ? 'Payment Pending' : 'Payment Failed'}
        </h2>
        
        <div className="my-6 space-y-2 text-sm">
          <p className="text-gray-600">Reference: <span className="font-mono font-bold">{status.reference}</span></p>
          <p className="text-gray-600">Amount: <span className="font-bold">NGN {status.amount.toLocaleString()}</span></p>
          <p className="text-gray-600">Status: <span className="font-bold capitalize">{status.status}</span></p>
        </div>

        {isCompleted && (
          <div className="bg-green-100 border border-green-300 rounded p-3 mb-6">
            <p className="text-green-800 text-sm">Your vote has been recorded!</p>
          </div>
        )}

        {isPending && (
          <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-6">
            <p className="text-blue-800 text-sm">Processing payment... Please wait</p>
          </div>
        )}

        {isFailed && (
          <div className="bg-red-100 border border-red-300 rounded p-3 mb-6">
            <p className="text-red-800 text-sm">Payment could not be processed. Please try again.</p>
          </div>
        )}

        <div className="space-y-2">
          {isCompleted && (
            <Link href="/" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700">Back to Results</Button>
            </Link>
          )}
          {(isPending || isFailed) && (
            <>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">Try Another Vote</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </Card>
      }>
        <PaymentStatusContent />
      </Suspense>
    </main>
  )
}
