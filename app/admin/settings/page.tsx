'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Settings {
  id: string
  voteCost: number
  currency: string
  votingActive: boolean
}

export default function AdminSettings() {
  const router = useRouter()
  const { status } = useSession()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      setError('Failed to fetch settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setError(null)
    setSuccess(false)

    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteCost: settings.voteCost,
          currency: settings.currency,
          votingActive: settings.votingActive,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save settings')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save settings'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">
            Manage voting platform configuration
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
            Settings saved successfully!
          </div>
        )}

        {settings && (
          <Card className="p-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Vote Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vote Cost
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.voteCost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      voteCost: parseFloat(e.target.value),
                    })
                  }
                  disabled={isSaving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount charged per vote in the selected currency
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Code
                </label>
                <Input
                  type="text"
                  maxLength={3}
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currency: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="NGN"
                  disabled={isSaving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ISO 4217 currency code (e.g., NGN, USD, EUR)
                </p>
              </div>

              {/* Voting Active */}
              <div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="votingActive"
                    checked={settings.votingActive}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        votingActive: e.target.checked,
                      })
                    }
                    disabled={isSaving}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label
                    htmlFor="votingActive"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Voting is Active
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {settings.votingActive
                    ? 'Users can currently cast votes'
                    : 'Voting is currently disabled'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchSettings()}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Transactions Section */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Transactions
          </h3>
          <p className="text-gray-600 mb-4">
            View all payment transactions and vote history
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/transactions">View Transactions</a>
          </Button>
        </Card>
      </div>
    </div>
  )
}
