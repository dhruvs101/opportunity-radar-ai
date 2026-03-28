'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import SignalCard from '@/components/SignalCard'
import { fetchScreener, fetchLiveSignals } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

const SECTORS = ['All', 'Energy', 'Consumer', 'Conglomerate', 'Banking', 'IT', 'Auto', 'Infrastructure', 'NBFC', 'Pharma', 'Telecom', 'FMCG']
const SIGNAL_TYPES = ['All', 'BREAKOUT', 'DIVERGENCE', 'REVERSAL', 'ANOMALY', 'DANGER']

export default function ScreenerPage() {
  const router = useRouter()
  const { connected } = useWebSocket()
  const [results, setResults] = useState<any[]>([])
  const [sector, setSector] = useState('All')
  const [signalType, setSignalType] = useState('All')
  const [minScore, setMinScore] = useState(6)
  const [loading, setLoading] = useState(false)

  const runScreener = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { min_score: minScore }
      if (sector !== 'All') params.sector = sector
      if (signalType !== 'All') params.signal_type = signalType
      const data = await fetchScreener(params)
      setResults(data.results)
    } catch {
      // Fallback to live signals
      const data = await fetchLiveSignals()
      let r = data.signals
      if (sector !== 'All') r = r.filter((s: any) => s.sector === sector)
      if (signalType !== 'All') r = r.filter((s: any) => s.signal_type === signalType)
      r = r.filter((s: any) => s.judge_score >= minScore)
      setResults(r)
    } finally {
      setLoading(false)
    }
  }, [sector, signalType, minScore])

  useEffect(() => { runScreener() }, [runScreener])

  return (
    <div className="min-h-screen grid-bg">
      <Navbar connected={connected} />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal className="w-4 h-4 text-radar-accent" />
              <span className="font-mono text-[10px] text-radar-accent tracking-widest">AI SCREENER</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-radar-text">Signal Screener</h1>
            <p className="text-xs text-radar-muted font-mono mt-0.5">{results.length} signals match your filters</p>
          </div>
          <button
            onClick={runScreener}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-radar-border bg-radar-surface text-xs font-mono text-radar-muted hover:text-radar-accent transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filter Panel */}
        <div className="radar-card p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sector */}
            <div>
              <div className="font-mono text-[10px] text-radar-muted mb-2 tracking-widest">SECTOR</div>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map(s => (
                  <button key={s} onClick={() => setSector(s)}
                    className={`text-[11px] font-mono px-2 py-1 rounded border transition-all ${sector === s ? 'bg-radar-accent/10 border-radar-accent/30 text-radar-accent' : 'border-radar-border text-radar-muted bg-radar-surface hover:text-radar-text'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Signal Type */}
            <div>
              <div className="font-mono text-[10px] text-radar-muted mb-2 tracking-widest">SIGNAL TYPE</div>
              <div className="flex flex-wrap gap-1.5">
                {SIGNAL_TYPES.map(t => (
                  <button key={t} onClick={() => setSignalType(t)}
                    className={`text-[11px] font-mono px-2 py-1 rounded border transition-all ${signalType === t ? 'bg-radar-accent/10 border-radar-accent/30 text-radar-accent' : 'border-radar-border text-radar-muted bg-radar-surface hover:text-radar-text'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Score */}
            <div>
              <div className="font-mono text-[10px] text-radar-muted mb-2 tracking-widest">
                MIN JUDGE SCORE: <span className="text-radar-accent">{minScore}.0</span>
              </div>
              <input
                type="range" min={4} max={9} step={0.5} value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-[#00FF88] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-radar-border mt-1">
                <span>4.0</span><span>6.5</span><span>9.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="radar-card h-44 skeleton" />)}
          </div>
        ) : results.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((signal, i) => (
              <div key={signal.id || i} style={{ animationDelay: `${i * 0.05}s` }}>
                <SignalCard signal={signal} onAnalyze={sym => router.push(`/analyze/${sym.replace('.NS', '')}`)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-radar-muted font-mono text-sm">
            No signals match your filters · Try loosening the criteria
          </div>
        )}
      </main>
    </div>
  )
}
