'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Bell, Share2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import CandlestickChart from '@/components/CandlestickChart'
import FIIDIIChart from '@/components/FIIDIIChart'
import SentimentPanel from '@/components/SentimentPanel'
import FilingsPanel from '@/components/FilingsPanel'
import AgentDebate from '@/components/AgentDebate'
import { fetchStock, analyzeStock, sendAlert } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

type Phase = 'idle' | 'fetching' | 'analyzing' | 'done' | 'error'

const PHASE_LABELS: Record<Phase, string> = {
  idle: '',
  fetching: 'Fetching market data...',
  analyzing: 'Running agent pipeline: Researcher → Bull → Bear → Judge...',
  done: 'Analysis complete',
  error: 'Analysis failed',
}

export default function AnalyzeSymbolPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = (params.symbol as string)?.toUpperCase()
  const { connected } = useWebSocket()

  const [stockData, setStockData] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [sendingAlert, setSendingAlert] = useState(false)
  const [activeTab, setActiveTab] = useState<'chart' | 'debate' | 'data'>('chart')

  useEffect(() => {
    if (!symbol) return
    runAnalysis()
  }, [symbol])

  const runAnalysis = async () => {
    try {
      setPhase('fetching')
      const stock = await fetchStock(symbol)
      setStockData(stock)

      setPhase('analyzing')
      const result = await analyzeStock(symbol)
      setAnalysis(result)
      setPhase('done')
      toast.success(`Analysis complete for ${symbol}`)
    } catch (err: any) {
      setPhase('error')
      toast.error(err.message || 'Analysis failed')
    }
  }

  const handleSendAlert = async () => {
    setSendingAlert(true)
    try {
      await sendAlert(symbol)
      toast.success('Alert sent! (WhatsApp stub — check console in production)')
    } catch {
      toast.error('Alert send failed')
    } finally {
      setSendingAlert(false)
    }
  }

  const stock = analysis?.stock_data || stockData?.stock
  const ohlcv = analysis?.ohlcv || stockData?.ohlcv
  const fiiDii = analysis?.fii_dii_data || stockData?.fii_dii
  const sentiment = analysis?.sentiment_data || stockData?.sentiment
  const filings = analysis?.sebi_filings || stockData?.filings
  const judgeVerdict = analysis?.judge_verdict
  const isPositive = stock?.change_pct > 0

  const scoreColor = (s: number) => s >= 7 ? 'text-radar-accent' : s >= 5 ? 'text-radar-yellow' : 'text-radar-red'

  return (
    <div className="min-h-screen grid-bg">
      <Navbar connected={connected} />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-12">
        {/* Back + Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-mono text-radar-muted hover:text-radar-accent mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-radar-text">{symbol}</h1>
              {stock && (
                <>
                  <span className="text-sm font-mono text-radar-muted">{stock.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-radar-surface border border-radar-border text-radar-muted">{stock.sector}</span>
                </>
              )}
            </div>
            {stock && (
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono font-bold text-xl text-radar-text">₹{stock.price?.toLocaleString('en-IN')}</span>
                <span className={`font-mono text-sm flex items-center gap-1 ${isPositive ? 'text-radar-accent' : 'text-radar-red'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{stock.change_pct?.toFixed(2)}%
                </span>
                {analysis?.danger_signal && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-radar-orange/10 border border-radar-orange/30 text-radar-orange animate-pulse">
                    ⚠ DANGER SIGNAL
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {analysis && (
              <button
                onClick={handleSendAlert}
                disabled={sendingAlert}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-radar-orange/30 bg-radar-orange/10 text-radar-orange text-xs font-mono hover:bg-radar-orange/20 transition-all disabled:opacity-50"
              >
                {sendingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                Send Alert
              </button>
            )}
            <button
              onClick={runAnalysis}
              disabled={phase === 'fetching' || phase === 'analyzing'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-radar-accent text-radar-bg text-xs font-mono font-bold hover:bg-radar-accent/90 disabled:opacity-50 transition-all"
            >
              {(phase === 'fetching' || phase === 'analyzing')
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Zap className="w-3.5 h-3.5" />}
              {phase === 'fetching' || phase === 'analyzing' ? 'Analyzing...' : 'Re-analyze'}
            </button>
          </div>
        </div>

        {/* Phase status */}
        {phase !== 'done' && phase !== 'idle' && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-radar-surface border border-radar-border">
            <Loader2 className={`w-4 h-4 text-radar-accent ${phase === 'error' ? 'hidden' : 'animate-spin'}`} />
            <div>
              <span className="text-xs font-mono text-radar-accent">{PHASE_LABELS[phase]}</span>
              {phase === 'analyzing' && (
                <div className="flex gap-1 mt-1">
                  {['Researcher', 'Bull Agent', 'Bear Agent', 'Judge', 'Alert'].map((a, i) => (
                    <span key={a} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-radar-card border border-radar-border text-radar-muted animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Judge Score Banner */}
        {judgeVerdict && (
          <div className="mb-5 radar-card p-4 flex flex-wrap items-center gap-6 animate-fade-up">
            <div className="text-center">
              <div className={`text-3xl font-bold font-mono ${scoreColor(judgeVerdict.judge_score)}`}>{judgeVerdict.judge_score?.toFixed(1)}</div>
              <div className="text-[10px] font-mono text-radar-muted">JUDGE SCORE</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono text-radar-blue">{judgeVerdict.risk_reward}</div>
              <div className="text-[10px] font-mono text-radar-muted">RISK:REWARD</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold font-mono ${judgeVerdict.verdict === 'Bull' ? 'text-radar-accent' : judgeVerdict.verdict === 'Bear' ? 'text-radar-red' : 'text-radar-yellow'}`}>
                {judgeVerdict.verdict?.toUpperCase()}
              </div>
              <div className="text-[10px] font-mono text-radar-muted">VERDICT</div>
            </div>
            <div className="text-center">
              <div className={`font-bold font-mono text-lg px-3 py-1 rounded border ${
                judgeVerdict.action === 'BUY' ? 'text-radar-accent border-radar-accent/40 bg-radar-accent/10' :
                judgeVerdict.action === 'SELL' ? 'text-radar-red border-radar-red/40 bg-radar-red/10' :
                judgeVerdict.action === 'WATCH' ? 'text-radar-yellow border-radar-yellow/40 bg-radar-yellow/10' :
                'text-radar-red border-radar-red/40 bg-radar-red/10'
              }`}>{judgeVerdict.action}</div>
              <div className="text-[10px] font-mono text-radar-muted mt-1">ACTION</div>
            </div>
            {judgeVerdict.key_insight && (
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-radar-muted mb-0.5">KEY INSIGHT</div>
                <div className="text-sm font-mono text-radar-text italic leading-snug">{judgeVerdict.key_insight}</div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-radar-border">
          {(['chart', 'debate', 'data'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-radar-accent text-radar-accent'
                  : 'border-transparent text-radar-muted hover:text-radar-text'
              }`}
            >
              {tab === 'chart' ? '📊 Charts' : tab === 'debate' ? '⚔️ Agent Debate' : '📋 Data'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            {ohlcv?.length ? (
              <CandlestickChart data={ohlcv} symbol={symbol} height={360} />
            ) : (
              <div className="radar-card h-80 skeleton" />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FIIDIIChart data={fiiDii} />
              <SentimentPanel sentiment={sentiment} />
            </div>
            {/* Stock stats */}
            {stock && (
              <div className="radar-card p-4">
                <div className="font-mono text-[10px] text-radar-muted tracking-widest mb-3">FUNDAMENTALS</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'P/E Ratio', value: stock.pe_ratio },
                    { label: 'P/BV', value: stock.pbv },
                    { label: '52W High', value: `₹${stock['52w_high']?.toLocaleString('en-IN')}` },
                    { label: '52W Low', value: `₹${stock['52w_low']?.toLocaleString('en-IN')}` },
                    { label: 'Market Cap', value: `₹${(stock.market_cap / 1000).toFixed(0)}Bn` },
                    { label: 'Volume', value: stock.volume?.toLocaleString('en-IN') },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-radar-surface rounded-lg p-3 border border-radar-border">
                      <div className="text-[10px] font-mono text-radar-muted mb-1">{label}</div>
                      <div className="text-sm font-mono font-bold text-radar-text">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'debate' && (
          <div>
            {analysis ? (
              <AgentDebate
                researcherReport={analysis.researcher_report}
                bullCase={analysis.bull_case}
                bearCase={analysis.bear_case}
                judgeVerdict={analysis.judge_verdict}
                alertMessage={analysis.alert_message}
                symbol={symbol}
              />
            ) : (
              <div className="text-center py-16 text-radar-muted font-mono text-sm">
                {phase === 'analyzing' ? 'Agents are debating...' : 'Run analysis to see the debate'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <FilingsPanel filings={filings} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FIIDIIChart data={fiiDii} />
              <SentimentPanel sentiment={sentiment} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
