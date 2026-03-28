'use client'
import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Shield } from 'lucide-react'

const SIGNAL_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  BREAKOUT: { color: 'text-radar-accent', bg: 'bg-radar-accent/10', border: 'border-radar-accent/30', icon: Zap, label: 'BREAKOUT' },
  DIVERGENCE: { color: 'text-radar-orange', bg: 'bg-radar-orange/10', border: 'border-radar-orange/30', icon: AlertTriangle, label: 'DIVERGENCE' },
  REVERSAL: { color: 'text-radar-blue', bg: 'bg-radar-blue/10', border: 'border-radar-blue/30', icon: TrendingUp, label: 'REVERSAL' },
  ANOMALY: { color: 'text-radar-yellow', bg: 'bg-radar-yellow/10', border: 'border-radar-yellow/30', icon: Shield, label: 'ANOMALY' },
  DANGER: { color: 'text-radar-red', bg: 'bg-radar-red/10', border: 'border-radar-red/30', icon: AlertTriangle, label: 'DANGER' },
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * score) / 10
  const color = score >= 7 ? '#00FF88' : score >= 5 ? '#FFD700' : '#FF3B30'

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1A3A5C" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out', filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="text-center">
        <div className="text-sm font-bold font-mono" style={{ color }}>{score.toFixed(1)}</div>
        <div className="text-[9px] text-radar-muted font-mono">/10</div>
      </div>
    </div>
  )
}

export default function SignalCard({ signal, onAnalyze }: { signal: any; onAnalyze?: (symbol: string) => void }) {
  const cfg = SIGNAL_CONFIG[signal.signal_type] || SIGNAL_CONFIG.ANOMALY
  const Icon = cfg.icon
  const isPositive = signal.change_pct > 0
  const hasDivergence = signal.fii_dii?.divergence_detected

  return (
    <div
      className={`radar-card p-4 cursor-pointer hover:glow-green transition-all duration-200 animate-fade-up ${hasDivergence ? 'border-radar-orange/40' : ''}`}
      onClick={() => onAnalyze?.(signal.symbol)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono font-bold text-sm text-radar-text">{signal.symbol.replace('.NS', '')}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color} flex items-center gap-1`}>
              <Icon className="w-2.5 h-2.5" />
              {cfg.label}
            </span>
            {hasDivergence && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-radar-orange/10 border-radar-orange/30 text-radar-orange animate-pulse">
                ⚠ DIVERGENCE
              </span>
            )}
          </div>
          <div className="text-xs text-radar-muted font-mono">{signal.name} · {signal.sector}</div>
        </div>
        <ScoreRing score={signal.judge_score} />
      </div>

      {/* Price */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono font-bold text-lg text-radar-text">₹{signal.price?.toLocaleString('en-IN')}</span>
        <span className={`font-mono text-sm font-medium flex items-center gap-0.5 ${isPositive ? 'text-radar-accent' : 'text-radar-red'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{signal.change_pct?.toFixed(2)}%
        </span>
      </div>

      {/* Pattern */}
      <div className="text-xs font-mono text-radar-muted mb-3 truncate">
        📊 {signal.pattern}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-radar-muted">
            FII: <span className={signal.fii_dii?.fii_net_3d > 0 ? 'text-radar-accent' : 'text-radar-red'}>
              {signal.fii_dii?.fii_net_label}
            </span>
          </span>
          <span className="text-radar-muted">
            Sentiment: <span className={
              signal.sentiment?.overall_sentiment === 'Bullish' ? 'text-radar-accent' :
              signal.sentiment?.overall_sentiment === 'Bearish' ? 'text-radar-red' : 'text-radar-yellow'
            }>
              {signal.sentiment?.overall_sentiment}
            </span>
          </span>
        </div>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
          {signal.win_rate}% hist.
        </span>
      </div>
    </div>
  )
}
