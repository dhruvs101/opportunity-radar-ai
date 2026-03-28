'use client'
import { FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function FilingsPanel({ filings }: { filings: any[] }) {
  if (!filings?.length) return null

  const sentimentIcon = (s: string) => {
    if (s === 'Bullish') return <TrendingUp className="w-3 h-3 text-radar-accent" />
    if (s === 'Bearish') return <TrendingDown className="w-3 h-3 text-radar-red" />
    return <Minus className="w-3 h-3 text-radar-yellow" />
  }

  const magnitudeColor = (m: string) => m === 'High' ? 'text-radar-red' : m === 'Medium' ? 'text-radar-yellow' : 'text-radar-muted'

  return (
    <div className="radar-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-3.5 h-3.5 text-radar-muted" />
        <span className="font-mono text-xs text-radar-muted tracking-widest">SEBI FILINGS</span>
      </div>
      <div className="space-y-2">
        {filings.map((f, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-radar-border/50 last:border-0">
            <div className="flex-shrink-0 mt-0.5">{sentimentIcon(f.sentiment)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold text-radar-text">{f.type}</span>
                <span className={`text-[9px] font-mono ${magnitudeColor(f.magnitude)}`}>{f.magnitude}</span>
              </div>
              <div className="text-[11px] font-mono text-radar-muted truncate">{f.description}</div>
              <div className="text-[10px] font-mono text-radar-border mt-0.5">{f.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
