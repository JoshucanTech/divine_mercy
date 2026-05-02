'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLeaderboard, type Contestant } from '@/hooks/useLeaderboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, Medal, Crown, Vote, TrendingUp } from 'lucide-react'

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
          <p className="mt-4 text-muted-foreground font-medium">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-6 text-destructive text-center">
        <p className="font-bold text-lg mb-2">Connection Error</p>
        <p className="text-sm opacity-90">{error}</p>
        <Button variant="outline" className="mt-4 border-destructive/20 hover:bg-destructive/10" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </Card>
    )
  }

  if (contestants.length === 0) {
    return (
      <Card className="rounded-3xl bg-muted/20 border-dashed border-2 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-6 flex items-center justify-center">
          <TrendingUp className="text-muted-foreground w-8 h-8" />
        </div>
        <p className="text-lg font-bold text-foreground mb-2">No Contestants Found</p>
        <p className="text-muted-foreground max-w-sm mx-auto">The competition hasn't started yet. Check back later for the official list.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-12">
      {/* Podium - Top 3 Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contestants.slice(0, 3).map((contestant, index) => {
          const isFirst = index === 0
          const Icon = isFirst ? Crown : (index === 1 ? Medal : Trophy)
          const medalColor = isFirst ? 'text-yellow-500' : (index === 1 ? 'text-slate-400' : 'text-amber-600')
          const cardClass = isFirst ? 'md:-mt-6 border-primary/20 shadow-2xl shadow-primary/10 ring-2 ring-primary/20' : 'border-muted'
          
          return (
            <Card
              key={contestant.id}
              className={`group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] bg-card rounded-3xl ${cardClass}`}
            >
              <div className={`absolute top-4 left-4 z-10 w-10 h-10 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center justify-center shadow-lg`}>
                <Icon className={`w-6 h-6 ${medalColor}`} />
              </div>

              <div className="aspect-[4/5] relative bg-muted overflow-hidden">
                {contestant.image ? (
                  <Image
                    src={contestant.image}
                    alt={contestant.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <span className="text-6xl grayscale opacity-20">👤</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Rank #{index + 1}</p>
                  <h3 className="text-xl font-bold truncate">{contestant.name}</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-2xl font-black text-foreground">
                      {contestant.voteCount.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Total Votes</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                    <TrendingUp className="text-primary w-6 h-6" />
                  </div>
                </div>
                <Button
                  onClick={() => onVote(contestant)}
                  className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/10 transition-all active:scale-95"
                >
                  <Vote className="w-4 h-4" />
                  Cast Vote
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* All Contestants Grid */}
      {contestants.length > 3 && (
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-4">
            <div className="h-px flex-1 bg-muted" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              All Competitors
            </h4>
            <div className="h-px flex-1 bg-muted" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contestants.slice(3).map((contestant, index) => (
              <Card
                key={contestant.id}
                className="group relative overflow-hidden rounded-2xl border-muted bg-card hover:shadow-xl transition-all duration-300"
              >
                <div className="p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    {contestant.image ? (
                      <Image
                        src={contestant.image}
                        alt={contestant.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/50">
                        <span className="text-2xl opacity-20">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rank #{index + 4}</span>
                      <div className="flex items-center gap-1 text-primary">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-bold">{contestant.voteCount}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground truncate mb-2">{contestant.name}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-full rounded-lg text-xs font-bold border-primary/20 hover:bg-primary hover:text-white transition-all"
                      onClick={() => onVote(contestant)}
                    >
                      Cast Vote
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
