'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Leaderboard } from '@/components/Leaderboard'
import { VoteModal } from '@/components/VoteModal'
import { Button } from '@/components/ui/button'
import { type Contestant } from '@/hooks/useLeaderboard'
import { Trophy, ShieldCheck, Sparkles, UserCircle } from 'lucide-react'

export default function Home() {
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [voteCost, setVoteCost] = useState(500)
  const [currency, setCurrency] = useState('NGN')

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
    <main className="min-h-screen bg-background font-sans selection:bg-primary/10">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Divine<span className="text-primary">Mercy</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground -mt-1">
                Voting Platform
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#leaderboard" className="text-sm font-medium hover:text-primary transition-colors">Leaderboard</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <UserCircle className="w-4 h-4" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-3 h-3" />
            <span>THE ANNUAL VOTE IS NOW LIVE</span>
          </div>

          <h2 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Help Choose the <br />
            <span className="text-gradient">Next Champion</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Empower your favorite contestant with your support. Every vote brings them
            one step closer to victory. Each vote costs only <span className="text-foreground font-bold">{currency} {voteCost}</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Button size="lg" className="h-14 px-8 rounded-2xl text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" asChild>
              <a href="#leaderboard">Cast Your Vote Now</a>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-6 py-3 rounded-2xl bg-muted/50 border">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Secure Voting Process
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-2">Live Standings</h3>
            <p className="text-muted-foreground">Real-time voting results for all contestants</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Updates Enabled
          </div>
        </div>

        <Leaderboard onVote={handleVote} />
      </section>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-black/20 border-t py-12 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b pb-12 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tight">DivineMercy</span>
            </div>

            <div className="flex gap-12">
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Terms of Voting</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Admin</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/admin/login" className="hover:text-primary transition-colors">Login</Link></li>
                  <li><Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <p>© 2024 DivineMercy Voting Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Vote Modal */}
      <VoteModal
        contestant={selectedContestant}
        open={isVoteModalOpen}
        onOpenChange={setIsVoteModalOpen}
        voteCost={voteCost}
        currency={currency}
      />
    </main>
  )
}
