'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Zap, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import MarketTicker from '@/components/MarketTicker'
import MarketOverview from '@/components/MarketOverview'
import SignalCard from '@/components/SignalCard'
import { useWebSocket } from '@/hooks/useWebSocket'
import { fetchLiveSignals } from '@/lib/api'

const SIGNAL_TYPES = ['ALL', 'BREAKOUT', 'DIVERGENCE', 'REVERSAL', 'ANOMALY', 'DANGER']

export default function DashboardPage() {
  const router = useRouter()
  const { signals: wsSignals, market: wsMarket, connected } = useWebSocket()
  const [signals, setSignals] = useState<any[]>([])
  const [market, setMarket] = useState<any>(null)
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Seed with HTTP fetch first
  useEffect(() => {
    fetchLiveSignals()
      .then(d => { setSignals(d.signals); setMarket(d.market); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Update from WebSocket
  useEffect(() => {
    if (wsSignals.length) { setSignals(wsSignals); setLastUpdate(new Date()) }
    if (wsMarket) setMarket(wsMarket)
  }, [wsSignals, wsMarket])

  const handleAnalyze = (symbol: string) => {
    router.push(`/analyze/${symbol.replace('.NS', '')}`)
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const d = await fetchLiveSignals()
      setSignals(d.signals)
      setMarket(d.market)
      setLastUpdate(new Date())
      toast.success('Signals refreshed')
    } catch {
      toast.error('Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'ALL' ? signals : signals.filter(s => s.signal_type === filter)

  return (
    <div className="min-h-screen grid-bg">
      <Navbar connected={connected} />
      <div className="pt-14">
        <MarketTicker market={market} />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="signal-dot live" />
              <span className="font-mono text-[10px] text-radar-accent tracking-widest">LIVE SIGNAL FEED</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-radar-text">Opportunity Radar</h1>
            <p className="text-xs text-radar-muted font-mono mt-0.5">
              AI debates every stock · Bull vs Bear vs Judge · {signals.length} signals active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-radar-border hidden md:block">
              Updated {lastUpdate.toLocaleTimeString('en-IN')}
            </span>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-radar-border bg-radar-surface text-xs font-mono text-radar-muted hover:text-radar-accent hover:border-radar-accent/40 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview market={market} />

        {/* Divergence Alert Banner */}
        {signals.some(s => s.fii_dii?.divergence_detected) && (
          <div className="mb-4 px-4 py-3 bg-radar-orange/10 border border-radar-orange/30 rounded-xl flex items-center gap-3 animate-fade-up">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-sm font-mono font-bold text-radar-orange">Retail-Institutional Divergence Detected</div>
              <div className="text-xs font-mono text-radar-muted">Social media bullish but FII quietly selling — flagged as Danger Signal</div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-radar-muted flex-shrink-0" />
          {SIGNAL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-shrink-0 text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                filter === t
                  ? 'bg-radar-accent/10 border-radar-accent/30 text-radar-accent'
                  : 'border-radar-border text-radar-muted hover:text-radar-text bg-radar-surface'
              }`}
            >
              {t}
              {t !== 'ALL' && (
                <span className="ml-1 text-radar-border">
                  ({signals.filter(s => s.signal_type === t).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Signal Grid */}
        {loading && !signals.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="radar-card p-4 h-44 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((signal, i) => (
              <div key={signal.id || i} style={{ animationDelay: `${i * 0.05}s` }}>
                <SignalCard signal={signal} onAnalyze={handleAnalyze} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-radar-muted font-mono text-sm">
                No {filter} signals right now · Radar is scanning...
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 radar-card p-6">
          <div className="font-mono text-xs text-radar-muted tracking-widest mb-4">// AGENTIC PIPELINE</div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0">
            {[
              { label: 'DATA INGEST', sub: 'NSE · FII · Sentiment', color: 'text-radar-blue' },
              { label: 'RESEARCHER', sub: 'Agent 1', color: 'text-radar-blue' },
              { label: 'BULL ↔ BEAR', sub: 'Debate Loop', color: 'text-radar-accent' },
              { label: 'JUDGE AGENT', sub: 'Score + Verdict', color: 'text-radar-yellow' },
              { label: 'ALERT AGENT', sub: 'WhatsApp · Telegram', color: 'text-radar-orange' },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="radar-card p-3 flex-1 min-w-0">
                  <div className={`text-[11px] font-mono font-bold ${step.color}`}>{step.label}</div>
                  <div className="text-[10px] font-mono text-radar-muted">{step.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-radar-border font-mono hidden md:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
