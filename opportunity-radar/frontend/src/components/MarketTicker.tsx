'use client'

interface TickerItem {
  label: string
  value: string
  change: number
}

export default function MarketTicker({ market }: { market: any }) {
  if (!market) return null

  const items: TickerItem[] = [
    { label: 'NIFTY 50', value: market.nifty50?.value?.toLocaleString('en-IN'), change: market.nifty50?.change },
    { label: 'SENSEX', value: market.sensex?.value?.toLocaleString('en-IN'), change: market.sensex?.change },
    { label: 'NIFTY BANK', value: market.niftybank?.value?.toLocaleString('en-IN'), change: market.niftybank?.change },
    { label: 'INDIA VIX', value: market.india_vix?.toFixed(2), change: 0 },
    { label: 'FII NET', value: `₹${market.total_fii_net?.toFixed(0)}Cr`, change: market.total_fii_net },
    { label: 'DII NET', value: `₹${market.total_dii_net?.toFixed(0)}Cr`, change: market.total_dii_net },
  ]

  const doubled = [...items, ...items]

  return (
    <div className="w-full overflow-hidden bg-radar-surface border-b border-radar-border h-8 flex items-center">
      <div className="flex-shrink-0 px-3 border-r border-radar-border h-full flex items-center">
        <span className="text-[10px] font-mono text-radar-accent font-bold tracking-widest">LIVE</span>
      </div>
      <div className="ticker-wrap flex-1">
        <div className="ticker-content">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-5 font-mono text-xs">
              <span className="text-radar-muted">{item.label}</span>
              <span className="text-radar-text font-medium">{item.value}</span>
              {item.change !== 0 && (
                <span className={item.change > 0 ? 'text-radar-accent' : 'text-radar-red'}>
                  {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </span>
              )}
              <span className="text-radar-border ml-2">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
