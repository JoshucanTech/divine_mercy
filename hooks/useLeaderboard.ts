import { useEffect, useState, useCallback } from 'react'

export interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
  createdAt: string
  updatedAt: string
}

export function useLeaderboard(initialData?: Contestant[]) {
  const [contestants, setContestants] = useState<Contestant[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchInitial = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/contestants')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setContestants(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // If no initial data, fetch it
    if (!initialData) {
      fetchInitial()
    }

    // Connect to SSE for updates
    const eventSource = new EventSource('/api/leaderboard/stream')

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'initial') {
          setContestants(message.contestants || [])
          setIsLoading(false)
        } else if (message.type === 'update') {
          // Use the data sent in the update if available, otherwise fetch
          if (message.contestants) {
            setContestants(message.contestants)
          } else {
            fetchInitial()
          }
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      // Don't show full error if we already have data
      if (contestants.length === 0) {
        setError('Connection lost. Retrying...')
      }
      
      const retryTimeout = setTimeout(() => {
        // Reconnection logic is handled by creating a new EventSource on next mount or via this effect cleanup
      }, 3000)

      return () => clearTimeout(retryTimeout)
    }

    return () => {
      eventSource.close()
    }
  }, [initialData, fetchInitial, contestants.length])

  return { contestants, isLoading, error }
}
