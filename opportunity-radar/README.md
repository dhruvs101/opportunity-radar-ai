# 🎯 Opportunity Radar AI

> **AI-native investing intelligence for the Indian market**  
> Multi-agent debate architecture: Researcher → Bull → Bear → Judge → Alert

---

## What It Does

Opportunity Radar AI scans NSE stocks and runs a **live multi-agent debate** for every signal:

1. **Researcher Agent** — pulls price, FII/DII flows, social sentiment, SEBI filings
2. **Bull Agent** — builds the strongest buy case with price targets
3. **Bear Agent** — destroys the bull thesis, flags risks
4. **Judge Agent** — scores asymmetric risk/reward (1–10), delivers verdict + action
5. **Alert Agent** — formats WhatsApp/Telegram-ready alert

**Unique Features:**
- 🚨 **Divergence Detector** — flags when retail is bullish but institutions are quietly selling (the "Danger Signal" no other Indian tool has)
- ⚔️ **Bull vs Bear Debate** — live AI debate visible in the UI, not a black-box prediction
- 🇮🇳 **India-First** — SEBI filings, FII/DII, NSE data, Hindi/English NLP
- 📱 **WhatsApp/Telegram delivery** — real product feel, not just a dashboard

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11, FastAPI, LangGraph, Anthropic Claude Sonnet |
| Agents | LangGraph state machine (5-node pipeline) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | lightweight-charts (TradingView), Recharts |
| Real-time | WebSocket (FastAPI + Next.js) |
| Data | Mock NSE/FII/sentiment (production: NSE API, SEBI scraper) |
| Delivery | WhatsApp (Twilio), Telegram (python-telegram-bot) stub |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env → add your ANTHROPIC_API_KEY
bash run.sh
# Backend running at http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:3000
```

### 3. Docker (Full Stack)

```bash
# Create root .env
echo "ANTHROPIC_API_KEY=your_key_here" > .env
docker-compose up --build
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/market/overview` | Nifty, Sensex, VIX, FII/DII |
| GET | `/api/stocks` | All tracked stocks with live prices |
| GET | `/api/stocks/{symbol}` | Stock detail + OHLCV + FII + sentiment |
| GET | `/api/signals/live` | Live scanner signals |
| POST | `/api/analyze` | **Full multi-agent analysis** (calls Claude) |
| POST | `/api/alerts/send` | Send WhatsApp/Telegram alert |
| GET | `/api/screener` | Filter signals by sector/type/score |
| WS | `/ws/signals` | WebSocket live signal feed |

### Example: Run Full Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "TATAPOWER"}'
```

---

## Project Structure

```
opportunity-radar/
├── backend/
│   ├── agents/
│   │   └── pipeline.py        # LangGraph 5-agent pipeline
│   ├── api/
│   │   └── main.py            # FastAPI app + WebSocket
│   ├── data/
│   │   └── mock_data.py       # Mock NSE/FII/sentiment data
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.sh
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── analyze/
│   │   │   │   ├── page.tsx                # Search page
│   │   │   │   └── [symbol]/page.tsx       # Full analysis
│   │   │   └── screener/page.tsx           # Screener
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MarketTicker.tsx
│   │   │   ├── MarketOverview.tsx
│   │   │   ├── SignalCard.tsx
│   │   │   ├── AgentDebate.tsx
│   │   │   ├── CandlestickChart.tsx        # TradingView-style
│   │   │   ├── FIIDIIChart.tsx
│   │   │   ├── SentimentPanel.tsx
│   │   │   └── FilingsPanel.tsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts             # Auto-reconnecting WS
│   │   └── lib/
│   │       └── api.ts                      # API client
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Production Upgrade Path

| Feature | Mock (Hackathon) | Production |
|---------|-----------------|------------|
| Stock data | Generated OHLCV | NSE Python API / yfinance |
| FII/DII | Mock flows | NSE website scraper |
| Sentiment | Mock scores | Twitter API v2 / Reddit PRAW |
| SEBI filings | Mock | BSE/NSE filing parser |
| Alerts | Logged | Twilio WhatsApp + python-telegram-bot |
| DB | In-memory | PostgreSQL + Redis |

---

## Environment Variables

**Backend `.env`:**
```
ANTHROPIC_API_KEY=sk-ant-...
ENVIRONMENT=development
PORT=8000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

*Built for hackathon · India-first · Powered by Claude Sonnet*
