'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLeaderboard, type Contestant } from '@/hooks/useLeaderboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LeaderboardProps {
  onVote: (contestant: Contestant) => void
}

export function Leaderboard({ onVote }: LeaderboardProps) {
  const { contestants, isLoading, error } = useLeaderboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Error loading leaderboard</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (contestants.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No contestants yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top 3 Featured Section */}
      {contestants.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contestants.slice(0, 3).map((contestant, index) => (
            <Card
              key={contestant.id}
              className="relative overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="absolute top-3 right-3 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                #{index + 1}
              </div>

              <div className="aspect-square relative bg-gray-200 overflow-hidden">
                {contestant.image ? (
                  <Image
                    src={contestant.image}
                    alt={contestant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">
                  {contestant.name}
                </h3>
                <p className="text-2xl font-bold text-primary mt-2">
                  {contestant.voteCount.toLocaleString()} votes
                </p>
                <Button
                  onClick={() => onVote(contestant)}
                  className="w-full mt-4"
                >
                  Vote Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Contestant
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                Votes
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {contestants.map((contestant, index) => (
              <tr
                key={contestant.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  #{index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {contestant.image ? (
                        <Image
                          src={contestant.image}
                          alt={contestant.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                          <span>👤</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {contestant.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {contestant.voteCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVote(contestant)}
                  >
                    Vote
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
