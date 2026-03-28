'use client'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

export default function SentimentPanel({ sentiment }: { sentiment: any }) {
  if (!sentiment) return null

  const radarData = [
    { subject: 'Twitter', value: Math.max(0, sentiment.twitter_score + 100) / 2 },
    { subject: 'Reddit', value: Math.max(0, sentiment.reddit_score + 80) / 1.6 },
    { subject: 'News', value: Math.max(0, sentiment.news_score + 60) / 1.2 },
    { subject: 'Volume', value: Math.min(100, sentiment.mention_volume_24h / 150) },
  ]

  const overallColor =
    sentiment.overall_sentiment === 'Bullish' ? '#00FF88' :
    sentiment.overall_sentiment === 'Bearish' ? '#FF3B30' : '#FFD700'

  return (
    <div className="radar-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-radar-muted tracking-widest">SENTIMENT RADAR</span>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded`} style={{ color: overallColor }}>
          {sentiment.overall_sentiment?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Twitter', value: sentiment.twitter_score, max: 100 },
          { label: 'Reddit', value: sentiment.reddit_score, max: 80 },
          { label: 'News', value: sentiment.news_score, max: 60 },
        ].map(({ label, value, max }) => (
          <div key={label} className="bg-radar-surface rounded-lg p-2 border border-radar-border text-center">
            <div className={`text-base font-bold font-mono ${value > 0 ? 'text-radar-accent' : value < 0 ? 'text-radar-red' : 'text-radar-yellow'}`}>
              {value > 0 ? '+' : ''}{value}
            </div>
            <div className="text-[10px] text-radar-muted font-mono">{label}</div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#1A3A5C" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A6B8A', fontSize: 10, fontFamily: 'monospace' }} />
          <Radar dataKey="value" stroke={overallColor} fill={overallColor} fillOpacity={0.15} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-radar-muted">
        <span>24h mentions: <span className="text-radar-text">{sentiment.mention_volume_24h?.toLocaleString()}</span></span>
        <span>Trend: <span className={sentiment.sentiment_trend === 'Rising' ? 'text-radar-accent' : sentiment.sentiment_trend === 'Falling' ? 'text-radar-red' : 'text-radar-yellow'}>{sentiment.sentiment_trend}</span></span>
      </div>

      {sentiment.top_keywords?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {sentiment.top_keywords.map((kw: string) => (
            <span key={kw} className="text-[10px] font-mono px-2 py-0.5 rounded bg-radar-surface border border-radar-border text-radar-muted">#{kw}</span>
          ))}
        </div>
      )}
    </div>
  )
}
