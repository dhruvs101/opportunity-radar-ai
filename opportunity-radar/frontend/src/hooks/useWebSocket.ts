'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL } from '@/lib/api'

interface WSMessage {
  type: string
  data?: any[]
  market?: any
  timestamp?: string
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [market, setMarket] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const reconnectTimer = useRef<NodeJS.Timeout>()
  const pingTimer = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(`${WS_URL}/ws/signals`)

      ws.current.onopen = () => {
        setConnected(true)
        // Send ping every 25 seconds
        pingTimer.current = setInterval(() => {
          ws.current?.send('ping')
        }, 25000)
      }

      ws.current.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data)
          if (msg.type === 'live_signals' || msg.type === 'initial') {
            if (msg.data) setSignals(msg.data)
            if (msg.market) setMarket(msg.market)
          }
        } catch (e) {
          console.error('WS parse error:', e)
        }
      }

      ws.current.onclose = () => {
        setConnected(false)
        clearInterval(pingTimer.current)
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.current.onerror = () => {
        ws.current?.close()
      }
    } catch (e) {
      console.error('WS connect error:', e)
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      clearInterval(pingTimer.current)
      ws.current?.close()
    }
  }, [connect])

  return { signals, market, connected }
}
