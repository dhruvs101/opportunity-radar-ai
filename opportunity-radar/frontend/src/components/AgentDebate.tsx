'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Scale, Search, Bell } from 'lucide-react'

interface AgentDebateProps {
  researcherReport: string
  bullCase: string
  bearCase: string
  judgeVerdict: any
  alertMessage: string
  symbol: string
}

function AgentPanel({
  label, icon: Icon, content, color, defaultOpen = false
}: {
  label: string; icon: any; content: string; color: string; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  const colorMap: Record<string, string> = {
    blue: 'border-radar-blue bg-radar-blue/5 text-radar-blue',
    green: 'border-radar-accent bg-radar-accent/5 text-radar-accent',
    red: 'border-radar-red bg-radar-red/5 text-radar-red',
    yellow: 'border-radar-yellow bg-radar-yellow/5 text-radar-yellow',
  }

  return (
    <div className={`border-l-2 rounded-r-lg mb-3 ${colorMap[color]}`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-mono font-semibold text-sm">{label}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <pre className="text-xs text-radar-text font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
        </div>
      )}
    </div>
  )
}

function JudgeVerdict({ verdict }: { verdict: any }) {
  if (!verdict) return null

  const scoreColor = verdict.judge_score >= 7 ? 'text-radar-accent' : verdict.judge_score >= 5 ? 'text-radar-yellow' : 'text-radar-red'
  const actionColors: Record<string, string> = {
    BUY: 'bg-radar-accent/20 text-radar-accent border-radar-accent/40',
    SELL: 'bg-radar-red/20 text-radar-red border-radar-red/40',
    WATCH: 'bg-radar-yellow/20 text-radar-yellow border-radar-yellow/40',
    AVOID: 'bg-radar-red/20 text-radar-red border-radar-red/40',
  }

  return (
    <div className="border border-radar-yellow/30 rounded-xl bg-radar-yellow/5 p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-radar-yellow" />
        <span className="font-mono font-bold text-sm text-radar-yellow">JUDGE VERDICT</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="text-center">
          <div className={`text-2xl font-bold font-mono ${scoreColor}`}>{verdict.judge_score?.toFixed(1)}</div>
          <div className="text-[10px] text-radar-muted font-mono">SCORE /10</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold font-mono text-radar-blue">{verdict.risk_reward || 'N/A'}</div>
          <div className="text-[10px] text-radar-muted font-mono">RISK:REWARD</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold font-mono ${verdict.verdict === 'Bull' ? 'text-radar-accent' : verdict.verdict === 'Bear' ? 'text-radar-red' : 'text-radar-yellow'}`}>
            {verdict.verdict?.toUpperCase()}
          </div>
          <div className="text-[10px] text-radar-muted font-mono">VERDICT</div>
        </div>
        <div className="text-center">
          <span className={`text-sm font-bold font-mono px-3 py-1 rounded border ${actionColors[verdict.action] || actionColors.WATCH}`}>
            {verdict.action}
          </span>
          <div className="text-[10px] text-radar-muted font-mono mt-1">ACTION</div>
        </div>
      </div>

      {verdict.key_insight && (
        <div className="bg-radar-surface rounded-lg px-3 py-2 border border-radar-border">
          <span className="text-[10px] text-radar-muted font-mono">KEY INSIGHT: </span>
          <span className="text-xs text-radar-text font-mono italic">{verdict.key_insight}</span>
        </div>
      )}

      {verdict.summary && (
        <p className="text-xs text-radar-muted mt-2 font-mono leading-relaxed">{verdict.summary}</p>
      )}
    </div>
  )
}

export default function AgentDebate({ researcherReport, bullCase, bearCase, judgeVerdict, alertMessage, symbol }: AgentDebateProps) {
  const [showAlert, setShowAlert] = useState(false)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-radar-accent animate-pulse" />
        <span className="font-mono text-xs text-radar-muted tracking-widest">AGENT DEBATE PIPELINE</span>
        <span className="font-mono text-[10px] text-radar-border">// {symbol}</span>
      </div>

      <AgentPanel
        label="01 · RESEARCHER AGENT"
        icon={Search}
        content={researcherReport}
        color="blue"
        defaultOpen={true}
      />
      <AgentPanel
        label="02 · BULL AGENT"
        icon={TrendingUp}
        content={bullCase}
        color="green"
        defaultOpen={true}
      />
      <AgentPanel
        label="03 · BEAR AGENT"
        icon={TrendingDown}
        content={bearCase}
        color="red"
        defaultOpen={true}
      />

      <JudgeVerdict verdict={judgeVerdict} />

      {/* Alert message */}
      <div className="border border-radar-border rounded-xl bg-radar-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-radar-orange" />
            <span className="font-mono text-xs text-radar-orange font-semibold">ALERT AGENT OUTPUT</span>
          </div>
          <button
            onClick={() => setShowAlert(!showAlert)}
            className="text-[10px] font-mono text-radar-muted hover:text-radar-text border border-radar-border rounded px-2 py-0.5"
          >
            {showAlert ? 'Hide' : 'Show'}
          </button>
        </div>
        {showAlert && (
          <pre className="text-xs font-mono text-radar-text whitespace-pre-wrap bg-radar-card rounded p-3 border border-radar-border leading-relaxed">
            {alertMessage}
          </pre>
        )}
      </div>
    </div>
  )
}
