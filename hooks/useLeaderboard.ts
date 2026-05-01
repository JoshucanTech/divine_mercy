import { useEffect, useState } from 'react'

export interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
  createdAt: string
  updatedAt: string
}

export function useLeaderboard() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch initial data
    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/admin/contestants')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setContestants(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setContestants([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitial()

    // Connect to SSE for updates
    const eventSource = new EventSource('/api/leaderboard/stream')

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'initial') {
          setContestants(message.contestants || [])
        } else if (message.type === 'update') {
          // Refetch on update
          fetchInitial()
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      setError('Connection lost. Retrying...')
      // Reconnect after delay
      setTimeout(() => {
        const newSource = new EventSource('/api/leaderboard/stream')
        newSource.onmessage = eventSource.onmessage
        newSource.onerror = eventSource.onerror
      }, 3000)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return { contestants, isLoading, error }
}
