'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Contestant } from '@/hooks/useLeaderboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface VoteModalProps {
  contestant: Contestant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  voteCost: number
  currency: string
}

export function VoteModal({
  contestant,
  open,
  onOpenChange,
  voteCost,
  currency,
}: VoteModalProps) {
  const [voterEmail, setVoterEmail] = useState('')
  const [voterName, setVoterName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contestant || !voterEmail) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/vote/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: contestant.id,
          voterEmail,
          voterName,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to initiate vote')
      }

      const data = await res.json()

      // Redirect to payment page
      window.location.href = data.paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vote for {contestant?.name}</DialogTitle>
          <DialogDescription>
            Complete your vote with a secure payment
          </DialogDescription>
        </DialogHeader>

        {contestant && (
          <div className="space-y-6">
            {/* Contestant Preview */}
            <Card className="p-4 bg-gray-50">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  {contestant.image ? (
                    <Image
                      src={contestant.image}
                      alt={contestant.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{contestant.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {contestant.voteCount.toLocaleString()} votes
                  </p>
                </div>
              </div>
            </Card>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Payment Info */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-gray-700">
                  You will be redirected to our secure payment page to complete
                  your vote
                </p>
              </Card>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !voterEmail}
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : `Pay ${currency} ${voteCost}`}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
