import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/mock-db'

// Simple SSE client management
const clients = new Set<ReadableStreamDefaultController<string>>()

export async function GET(request: NextRequest) {
  // Create a custom ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Register this client
      clients.add(controller)

      // Send initial data
      try {
        const contestants = mockDb.getContestants()

        controller.enqueue(
          `data: ${JSON.stringify({
            type: 'initial',
            contestants,
          })}\n\n`
        )
      } catch (error) {
        controller.error(error)
      }

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
          clients.delete(controller)
          controller.close()
        }
      }, 30000) // 30 seconds

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clients.delete(controller)
        try {
          controller.close()
        } catch (error) {}
      })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// Broadcast update to all connected clients
export function broadcastUpdate() {
  clients.forEach((controller) => {
    try {
      const contestants = mockDb.getContestants()
      controller.enqueue(`data: ${JSON.stringify({ type: 'update', contestants })}\n\n`)
    } catch (error) {
      clients.delete(controller)
    }
  })
}
