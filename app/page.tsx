'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Leaderboard } from '@/components/Leaderboard'
import { VoteModal } from '@/components/VoteModal'
import { Button } from '@/components/ui/button'
import { type Contestant } from '@/hooks/useLeaderboard'

export default function Home() {
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(
    null
  )
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [voteCost, setVoteCost] = useState(100)
  const [currency, setCurrency] = useState('NGN')

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const settings = await res.json()
          setVoteCost(settings.voteCost)
          setCurrency(settings.currency)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleVote = (contestant: Contestant) => {
    setSelectedContestant(contestant)
    setIsVoteModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Voting Platform
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Vote for your favorite contestant
              </p>
            </div>
            <Link href="/admin/login">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Cast Your Vote
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl">
            Help choose the winner by casting your vote. Each vote costs{' '}
            <span className="font-semibold text-primary">
              {currency} {voteCost}
            </span>
            .
          </p>
        </div>

        {/* Leaderboard */}
        <Leaderboard onVote={handleVote} />
      </div>

      {/* Vote Modal */}
      <VoteModal
        contestant={selectedContestant}
        open={isVoteModalOpen}
        onOpenChange={setIsVoteModalOpen}
        voteCost={voteCost}
        currency={currency}
      />

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-600">
            © 2024 Voting Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
