'use client'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function MarketOverview({ market }: { market: any }) {
  if (!market) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="radar-card p-4 skeleton h-20" />
      ))}
    </div>
  )

  const stats = [
    { label: 'NIFTY 50', value: market.nifty50?.value?.toLocaleString('en-IN'), change: market.nifty50?.change },
    { label: 'SENSEX', value: market.sensex?.value?.toLocaleString('en-IN'), change: market.sensex?.change },
    { label: 'INDIA VIX', value: market.india_vix?.toFixed(2), change: 0, noArrow: true },
    { label: 'FII NET TODAY', value: `₹${market.total_fii_net?.toFixed(0)}Cr`, change: market.total_fii_net, isCr: true },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map(({ label, value, change, noArrow, isCr }) => {
        const isPos = change > 0
        const color = noArrow ? 'text-radar-yellow' : isPos ? 'text-radar-accent' : 'text-radar-red'
        return (
          <div key={label} className="radar-card p-4">
            <div className="text-[10px] font-mono text-radar-muted mb-1 tracking-widest">{label}</div>
            <div className="text-xl font-bold font-mono text-radar-text mb-1">{value}</div>
            {!noArrow && (
              <div className={`flex items-center gap-1 text-xs font-mono ${color}`}>
                {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPos ? '+' : ''}{isCr ? value : `${change?.toFixed(2)}%`}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
