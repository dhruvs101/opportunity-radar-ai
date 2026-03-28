const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

export { API_URL, WS_URL }

export async function fetchMarketOverview() {
  const res = await fetch(`${API_URL}/api/market/overview`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch market overview')
  return res.json()
}

export async function fetchStocks() {
  const res = await fetch(`${API_URL}/api/stocks`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch stocks')
  return res.json()
}

export async function fetchStock(symbol: string) {
  const res = await fetch(`${API_URL}/api/stocks/${symbol}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch stock ${symbol}`)
  return res.json()
}

export async function fetchLiveSignals() {
  const res = await fetch(`${API_URL}/api/signals/live`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch signals')
  return res.json()
}

export async function analyzeStock(symbol: string) {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Analysis failed')
  }
  return res.json()
}

export async function sendAlert(symbol: string, channel = 'whatsapp') {
  const res = await fetch(`${API_URL}/api/alerts/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, channel }),
  })
  if (!res.ok) throw new Error('Failed to send alert')
  return res.json()
}

export async function fetchScreener(params: {
  sector?: string
  signal_type?: string
  min_score?: number
}) {
  const query = new URLSearchParams()
  if (params.sector) query.set('sector', params.sector)
  if (params.signal_type) query.set('signal_type', params.signal_type)
  if (params.min_score !== undefined) query.set('min_score', String(params.min_score))

  const res = await fetch(`${API_URL}/api/screener?${query}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Screener failed')
  return res.json()
}
