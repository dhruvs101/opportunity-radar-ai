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
| Data | Mock NSE/FII/sentiment 

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
### 1. Backend

```bash
cd backend
cp .env.example .env
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
echo "API_KEY=your_key_here" > .env
docker-compose up --build
```

---


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

## Environment Variables

**Backend `.env`:**
```
API_KEY=hf-ABC-...
ENVIRONMENT=development
PORT=8000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```
---