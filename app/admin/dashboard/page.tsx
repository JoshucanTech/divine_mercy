'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Users, Vote, Trophy, ArrowRight, Image as ImageIcon, Search, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { status } = useSession()
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContestants()
    }
  }, [status])

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const fetchContestants = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/contestants')
      if (res.ok) {
        const data = await res.json()
        setContestants(data)
      }
    } catch (err) {
      console.error('Failed to fetch contestants:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contestant?')) return

    try {
      setIsDeleting(id)
      const res = await fetch(`/api/admin/contestants/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setContestants(contestants.filter((c) => c.id !== id))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredContestants = contestants.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Total Contestants', value: contestants.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Votes Cast', value: contestants.reduce((acc, c) => acc + c.voteCount, 0), icon: Vote, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Current Leader', value: contestants.length > 0 ? contestants[0].name.split(' ')[0] : 'None', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 rounded-3xl border-muted bg-card shadow-sm hover:shadow-md transition-all border-none ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Contestants</h2>
            <p className="text-muted-foreground font-medium">Manage and monitor competition participants</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name..." 
                className="pl-10 h-11 rounded-xl bg-muted/30 border-muted focus:bg-card transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2" asChild>
              <Link href="/admin/contestants/new">
                <Plus className="w-4 h-4" />
                Add New Contestant
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : filteredContestants.length === 0 ? (
          <Card className="p-16 text-center rounded-[2.5rem] border-dashed border-2 bg-muted/10">
            <div className="w-20 h-20 rounded-3xl bg-muted mx-auto mb-6 flex items-center justify-center">
              <Users className="text-muted-foreground w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">No contestants found</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Get started by adding your first contestant to the platform.</p>
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" asChild>
              <Link href="/admin/contestants/new">Create Contestant</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContestants.map((contestant) => (
              <Card
                key={contestant.id}
                className="group overflow-hidden rounded-3xl border-muted bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-none ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden ring-1 ring-black/5">
                        {contestant.image ? (
                          <Image
                            src={contestant.image}
                            alt={contestant.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground truncate max-w-[150px]">
                          {contestant.name}
                        </h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          ID: {contestant.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        onClick={() => handleDelete(contestant.id)}
                        disabled={isDeleting === contestant.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 mb-4 border border-muted/50">
                    <div>
                      <p className="text-2xl font-black text-foreground tabular-nums">
                        {contestant.voteCount.toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Votes</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold bg-muted/10 border-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all gap-2"
                    asChild
                  >
                    <Link href={`/admin/contestants/${contestant.id}`}>
                      Edit Profile
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
