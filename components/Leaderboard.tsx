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
      <div className="relative pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
          {/* Order for Podium: 2nd, 1st, 3rd */}
          {[1, 0, 2].map((contestantIndex) => {
            const contestant = contestants[contestantIndex]
            if (!contestant) return null

            const rank = contestantIndex + 1
            const isFirst = rank === 1
            const isSecond = rank === 2
            const isThird = rank === 3

            const Icon = isFirst ? Crown : (isSecond ? Medal : Trophy)
            const medalColor = isFirst ? 'text-yellow-500' : (isSecond ? 'text-slate-400' : 'text-amber-600')
            const rankOrder = isFirst ? 'order-1 md:order-2' : (isSecond ? 'order-2 md:order-1' : 'order-3 md:order-3')
            
            return (
              <div key={contestant.id} className={`${rankOrder} flex flex-col items-center`}>
                <Card
                  className={`group relative overflow-hidden transition-all duration-500 hover:scale-[1.03] bg-card rounded-[2.5rem] border-none shadow-2xl ${
                    isFirst 
                      ? 'w-full md:scale-110 z-20 ring-4 ring-primary/20 shadow-primary/20' 
                      : 'w-full md:scale-95 z-10 shadow-black/5'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-6 left-6 z-30 w-12 h-12 rounded-2xl bg-white/90 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center shadow-xl border border-white/20`}>
                    <Icon className={`w-7 h-7 ${medalColor} animate-pulse`} />
                  </div>

                  {/* Image Section */}
                  <div className={`${isFirst ? 'aspect-[4/5]' : 'aspect-square'} relative bg-muted overflow-hidden`}>
                    {contestant.image ? (
                      <Image
                        src={contestant.image}
                        alt={contestant.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <span className="text-7xl grayscale opacity-20">👤</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Content on Image */}
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isFirst ? 'bg-yellow-500 text-black' : 'bg-white/20 backdrop-blur-md text-white'
                        }`}>
                          Rank #{rank}
                        </span>
                      </div>
                      <h3 className={`${isFirst ? 'text-2xl' : 'text-xl'} font-black truncate drop-shadow-md`}>
                        {contestant.name}
                      </h3>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-black text-foreground tracking-tight">
                          {contestant.voteCount.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Captured Votes</p>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
                        isFirst ? 'bg-primary/10 border-primary/20' : 'bg-muted/50 border-muted'
                      }`}>
                        <TrendingUp className={`w-6 h-6 ${isFirst ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </div>

                    <Button
                      onClick={() => onVote(contestant)}
                      className={`w-full h-14 rounded-2xl gap-3 font-black text-base shadow-xl transition-all active:scale-95 ${
                        isFirst 
                          ? 'bg-primary hover:bg-primary/90 shadow-primary/30' 
                          : 'bg-secondary hover:bg-secondary/90 shadow-secondary/10'
                      }`}
                    >
                      <Vote className="w-5 h-5" />
                      Vote For Me
                    </Button>
                  </div>

                  {/* Glow Effect for Winner */}
                  {isFirst && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-yellow-500/10 to-primary/20 rounded-[2.6rem] blur-2xl -z-10 opacity-50" />
                  )}
                </Card>
              </div>
            )
          })}
        </div>
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
