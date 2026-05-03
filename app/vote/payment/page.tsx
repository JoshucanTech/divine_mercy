'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function MockPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSimulateSuccess = () => {
    setIsProcessing(true)
    // Simulate payment delay
    setTimeout(() => {
      router.push(`/vote/verify?status=successful&tx_ref=${reference}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl border-none ring-1 ring-black/5 dark:ring-white/5">
        <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-black text-foreground mb-2">Simulate Payment</h1>
        <p className="text-muted-foreground font-medium mb-8">
          This is a development mock payment page. No real money will be charged.
        </p>

        <div className="space-y-4 p-6 rounded-2xl bg-muted/50 border border-muted mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-bold uppercase tracking-widest">Reference</span>
            <span className="font-black text-foreground">{reference}</span>
          </div>
          <div className="h-px bg-muted" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            In production, this page would be replaced by the secure Flutterwave Checkout gateway.
          </p>
        </div>

        <Button 
          size="lg" 
          disabled={isProcessing}
          className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20"
          onClick={handleSimulateSuccess}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Simulate Successful Payment
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </Card>
    </div>
  )
}
