'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { z } from 'zod'

interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
  createdAt: string
}

const CreateContestantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().url().optional().or(z.literal('')),
})

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', image: '' })
  const [error, setError] = useState<string | null>(null)

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  useEffect(() => {
    fetchContestants()
  }, [])

  const fetchContestants = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/contestants')
      if (res.ok) {
        const data = await res.json()
        setContestants(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      setError('Failed to fetch contestants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateContestant = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const validated = CreateContestantSchema.parse(formData)

      setIsCreating(true)
      const res = await fetch('/api/admin/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      if (!res.ok) {
        throw new Error('Failed to create contestant')
      }

      setFormData({ name: '', image: '' })
      setShowCreateDialog(false)
      fetchContestants()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create contestant'
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteContestant = async (id: string) => {
    if (
      !window.confirm('Are you sure you want to delete this contestant?')
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/contestants/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchContestants()
      } else {
        setError('Failed to delete contestant')
      }
    } catch (err) {
      setError('Failed to delete contestant')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Contestants</h2>
            <p className="text-gray-600 mt-1">
              Manage voting contestants and view vote counts
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
            Add Contestant
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
              <p className="mt-4 text-gray-600">Loading contestants...</p>
            </div>
          </div>
        ) : contestants.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">No contestants yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create First Contestant
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contestants.map((contestant) => (
              <Card key={contestant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 overflow-hidden relative">
                  {contestant.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={contestant.image}
                      alt={contestant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {contestant.name}
                  </h3>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {contestant.voteCount.toLocaleString()} votes
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteContestant(contestant.id)
                      }
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Contestant</DialogTitle>
            <DialogDescription>
              Add a new contestant to the voting platform
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContestant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                placeholder="Contestant name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                disabled={isCreating}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !formData.name}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
