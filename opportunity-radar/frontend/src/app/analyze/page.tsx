'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Zap, Clock, TrendingUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useWebSocket } from '@/hooks/useWebSocket'

const QUICK_PICKS = [
  'TATAPOWER', 'ZOMATO', 'RELIANCE', 'HDFCBANK', 'INFY',
  'TATAMOTORS', 'BAJFINANCE', 'SBIN', 'ICICIBANK', 'BHARTIARTL',
]

export default function AnalyzePage() {
  const router = useRouter()
  const { connected } = useWebSocket()
  const [query, setQuery] = useState('')

  const handleSearch = (symbol: string) => {
    const clean = symbol.replace('.NS', '').trim().toUpperCase()
    if (clean) router.push(`/analyze/${clean}`)
  }

  return (
    <div className="min-h-screen grid-bg">
      <Navbar connected={connected} />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-radar-accent/20 bg-radar-accent/5 mb-4">
            <Zap className="w-3 h-3 text-radar-accent" />
            <span className="text-[11px] font-mono text-radar-accent">MULTI-AGENT ANALYSIS</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-radar-text mb-2">Analyze Any Stock</h1>
          <p className="text-sm text-radar-muted font-mono">
            Researcher → Bull Agent → Bear Agent → Judge Agent<br />
            Full AI debate in ~20 seconds
          </p>
        </div>

        {/* Search */}
        <div className="radar-card p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-radar-muted" />
              <input
                className="w-full bg-radar-surface border border-radar-border rounded-lg pl-9 pr-4 py-3 text-sm font-mono text-radar-text placeholder:text-radar-muted focus:outline-none focus:border-radar-accent/50 focus:ring-1 focus:ring-radar-accent/20 transition-all"
                placeholder="Enter NSE symbol (e.g. TATAPOWER, ZOMATO...)"
                value={query}
                onChange={e => setQuery(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
              />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={!query.trim()}
              className="px-5 py-3 bg-radar-accent text-radar-bg font-mono font-bold text-sm rounded-lg hover:bg-radar-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Quick picks */}
        <div className="radar-card p-5 mb-6">
          <div className="font-mono text-[10px] text-radar-muted tracking-widest mb-3">QUICK ANALYZE</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PICKS.map(sym => (
              <button
                key={sym}
                onClick={() => handleSearch(sym)}
                className="font-mono text-xs px-3 py-1.5 rounded-lg border border-radar-border bg-radar-surface text-radar-muted hover:text-radar-accent hover:border-radar-accent/30 transition-all"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Search, label: 'Researcher', desc: 'Gathers price, FII, sentiment, filings data', color: 'text-radar-blue' },
            { icon: TrendingUp, label: 'Bull vs Bear', desc: 'Two AI agents debate the stock thesis live', color: 'text-radar-accent' },
            { icon: Zap, label: 'Judge', desc: 'Scores risk/reward 1–10, sends WhatsApp alert', color: 'text-radar-yellow' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="radar-card p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className={`font-mono text-xs font-bold ${color} mb-1`}>{label}</div>
              <div className="text-[11px] text-radar-muted font-mono leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-radar-muted justify-center">
          <Clock className="w-3 h-3" />
          Analysis takes ~15–25 seconds · Powered by Claude Sonnet via Anthropic API
        </div>
      </main>
    </div>
  )
}
