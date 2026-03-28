'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

interface FIIDIIChartProps {
  data: any
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-radar-card border border-radar-border rounded-lg p-3 text-xs font-mono">
      <div className="text-radar-muted mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill }} className="flex justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-bold">₹{p.value?.toFixed(0)}Cr</span>
        </div>
      ))}
    </div>
  )
}

export default function FIIDIIChart({ data }: FIIDIIChartProps) {
  if (!data?.history?.length) return null

  const chartData = data.history.slice(0, 7).reverse().map((d: any) => ({
    date: d.date.slice(5),
    FII: d.fii_net,
    DII: d.dii_net,
  }))

  return (
    <div className="radar-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-radar-muted tracking-widest">FII / DII FLOWS</span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-radar-blue"><span className="w-2 h-2 bg-radar-blue rounded-sm inline-block" />FII</span>
          <span className="flex items-center gap-1 text-radar-orange"><span className="w-2 h-2 bg-radar-orange rounded-sm inline-block" />DII</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-radar-surface rounded-lg p-3 border border-radar-border">
          <div className="text-[10px] text-radar-muted font-mono mb-1">FII (3-day net)</div>
          <div className={`text-lg font-bold font-mono ${data.fii_net_3d > 0 ? 'text-radar-accent' : 'text-radar-red'}`}>
            {data.fii_net_label}
          </div>
        </div>
        <div className="bg-radar-surface rounded-lg p-3 border border-radar-border">
          <div className="text-[10px] text-radar-muted font-mono mb-1">DII (3-day net)</div>
          <div className={`text-lg font-bold font-mono ${data.dii_net_3d > 0 ? 'text-radar-accent' : 'text-radar-red'}`}>
            {data.dii_net_label}
          </div>
        </div>
      </div>

      {data.divergence_detected && (
        <div className="mb-3 px-3 py-2 bg-radar-orange/10 border border-radar-orange/30 rounded-lg flex items-center gap-2">
          <span className="text-radar-orange text-lg">⚠️</span>
          <span className="text-xs font-mono text-radar-orange">Retail-Institutional Divergence Detected — Possible Trap Signal</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barGap={2}>
          <XAxis dataKey="date" tick={{ fill: '#4A6B8A', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4A6B8A', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `₹${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#1A3A5C" />
          <Bar dataKey="FII" radius={[2, 2, 0, 0]}>
            {chartData.map((d: any, i: number) => (
              <Cell key={i} fill={d.FII > 0 ? '#00BFFF' : '#FF3B30'} />
            ))}
          </Bar>
          <Bar dataKey="DII" radius={[2, 2, 0, 0]}>
            {chartData.map((d: any, i: number) => (
              <Cell key={i} fill={d.DII > 0 ? '#FF6B35' : '#FF3B30'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
