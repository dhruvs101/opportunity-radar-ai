'use client'
import { useEffect, useRef } from 'react'

interface OHLCVData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ChartProps {
  data: OHLCVData[]
  symbol: string
  height?: number
}

export default function CandlestickChart({ data, symbol, height = 320 }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    if (!chartRef.current || !data?.length) return

    let chart: any
    let candleSeries: any
    let volumeSeries: any

    const initChart = async () => {
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts')

      chart = createChart(chartRef.current!, {
        width: chartRef.current!.clientWidth,
        height,
        layout: {
          textColor: '#4A6B8A',
          background: { color: '#ffffff' },
        },
        grid: {
          vertLines: { color: '#1A3A5C', style: 1 },
          horzLines: { color: '#1A3A5C', style: 1 },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: '#00FF88', labelBackgroundColor: '#00FF88' },
          horzLine: { color: '#00FF88', labelBackgroundColor: '#00FF88' },
        },
        rightPriceScale: {
          borderColor: '#1A3A5C',
          textColor: '#4A6B8A',
        },
        timeScale: {
          borderColor: '#1A3A5C',
          // textColor: '#4A6B8A',
          timeVisible: true,
        },
        handleScroll: true,
        handleScale: true,
      })

      candleSeries = chart.addCandlestickSeries({
        upColor: '#00FF88',
        downColor: '#FF3B30',
        borderUpColor: '#00FF88',
        borderDownColor: '#FF3B30',
        wickUpColor: '#00FF88',
        wickDownColor: '#FF3B30',
      })

      const candleData = data.map(d => ({
        time: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))

      candleSeries.setData(candleData)

      // Volume histogram
      volumeSeries = chart.addHistogramSeries({
        color: '#1A3A5C',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })

      const volumeData = data.map(d => ({
        time: d.date,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 59, 48, 0.3)',
      }))

      volumeSeries.setData(volumeData)
      chart.timeScale().fitContent()

      chartInstance.current = chart
    }

    initChart()

    // Resize handler
    const handleResize = () => {
      if (chartRef.current && chartInstance.current) {
        chartInstance.current.applyOptions({ width: chartRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.remove()
    }
  }, [data, height])

  return (
    <div className="radar-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-radar-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-radar-muted">PRICE ACTION</span>
          <span className="font-mono text-xs text-radar-border">·</span>
          <span className="font-mono text-xs text-radar-text">{symbol}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-radar-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-radar-accent rounded-sm inline-block" />Bullish</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-radar-red rounded-sm inline-block" />Bearish</span>
          <span className="text-radar-border">90D</span>
        </div>
      </div>
      <div ref={chartRef} style={{ height }} />
    </div>
  )
}
