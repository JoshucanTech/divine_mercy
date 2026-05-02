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
import { ShieldCheck, Mail, User, Info } from 'lucide-react'

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
      window.location.href = data.paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-primary px-8 py-10 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight leading-none mb-2">
              Cast Your Vote
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 font-medium">
              Securely support <span className="text-white font-bold">{contestant?.name}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 bg-card">
          {contestant && (
            <div className="space-y-8">
              {/* Contestant Mini Profile */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted ring-1 ring-black/5 dark:ring-white/5">
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-inner">
                  {contestant.image ? (
                    <Image
                      src={contestant.image}
                      alt={contestant.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <span className="text-2xl opacity-20">👤</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{contestant.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Ranked Contestant</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 pl-11 rounded-xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                        value={voterEmail}
                        onChange={(e) => setVoterEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Full Name <span className="opacity-50">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className="h-12 pl-11 rounded-xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Security/Info Info */}
                <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary/80 font-medium leading-tight">
                    You will be redirected to our secure payment gateway. Total due: <span className="font-bold text-primary">{currency} {voteCost}</span>
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm font-bold animate-in fade-in zoom-in-95">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !voterEmail}
                    className="h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Complete Vote
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="h-12 font-bold text-muted-foreground hover:bg-muted/50 rounded-xl"
                  >
                    Cancel and Return
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
