'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Radar, Search, Bell, Menu, X, TrendingUp, BarChart2 } from 'lucide-react'

export default function Navbar({ connected }: { connected?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const nav = [
    { href: '/', label: 'Dashboard', icon: Activity },
    { href: '/screener', label: 'Screener', icon: BarChart2 },
    { href: '/analyze', label: 'Analyze', icon: Search },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-radar-border bg-radar-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-radar-accent/10 border border-radar-accent/30 flex items-center justify-center group-hover:bg-radar-accent/20 transition-colors">
            <Radar className="w-4 h-4 text-radar-accent" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-radar-text tracking-tight">Opportunity</span>
            <span className="font-display font-bold text-sm text-radar-accent ml-1">Radar</span>
            <span className="font-mono text-[10px] text-radar-muted ml-1">AI</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === href
                  ? 'bg-radar-accent/10 text-radar-accent border border-radar-accent/20'
                  : 'text-radar-muted hover:text-radar-text hover:bg-radar-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={`signal-dot ${connected ? 'live' : 'bg-radar-muted'}`} />
            <span className={connected ? 'text-radar-accent' : 'text-radar-muted'}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="text-xs font-mono text-radar-muted border border-radar-border rounded px-2 py-1 bg-radar-surface">
            NSE • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Mobile menu */}
        <button className="md:hidden text-radar-muted" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-radar-border bg-radar-surface px-4 py-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === href ? 'bg-radar-accent/10 text-radar-accent' : 'text-radar-muted'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
