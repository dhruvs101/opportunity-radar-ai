"""
Opportunity Radar AI - FastAPI Backend
Routes: stock analysis, live signals, market overview, WebSocket live feed
"""
import os
import json
import asyncio
import random
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from agents.pipeline import run_full_analysis
from data.mock_data import (
    get_stock_price, get_fii_dii_data, get_sentiment_data,
    get_sebi_filings, generate_ohlcv, generate_live_signals,
    get_market_overview, NIFTY_STOCKS
)

# ─── WebSocket Manager ────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


# ─── Background Signal Generator ──────────────────────────────────────────────

async def signal_broadcaster():
    """Continuously broadcast live signals to WebSocket clients"""
    while True:
        try:
            if manager.active_connections:
                signals = generate_live_signals()
                market = get_market_overview()

                await manager.broadcast({
                    "type": "live_signals",
                    "data": signals[:5],
                    "market": market,
                    "timestamp": datetime.now().isoformat(),
                })
        except Exception as e:
            print(f"Broadcast error: {e}")
        await asyncio.sleep(8)  # Update every 8 seconds


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(signal_broadcaster())
    yield
    task.cancel()


# ─── App Init ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Opportunity Radar AI",
    description="AI-native investing intelligence for the Indian market",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    symbol: str


class AlertRequest(BaseModel):
    symbol: str
    channel: str = "whatsapp"  # whatsapp | telegram
    phone: Optional[str] = None


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "Opportunity Radar AI",
        "version": "1.0.0",
        "status": "operational",
        "agents": ["Researcher", "Bull", "Bear", "Judge", "Alert"],
        "stocks_covered": len(NIFTY_STOCKS),
    }


@app.get("/api/market/overview")
async def market_overview():
    """Get live market overview - Nifty, Sensex, FII/DII"""
    return get_market_overview()


@app.get("/api/stocks")
async def list_stocks():
    """List all tracked stocks with current prices"""
    stocks = []
    for s in NIFTY_STOCKS:
        price_data = get_stock_price(s["symbol"])
        stocks.append(price_data)
    return {"stocks": stocks, "count": len(stocks)}


@app.get("/api/stocks/{symbol}")
async def get_stock(symbol: str):
    """Get stock details + OHLCV + FII/DII + sentiment"""
    symbol = symbol.upper()
    if not symbol.endswith(".NS"):
        symbol = f"{symbol}.NS"

    stock = get_stock_price(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    trend = "bullish" if stock.get("change_pct", 0) > 0 else "bearish"
    return {
        "stock": stock,
        "ohlcv": generate_ohlcv(stock["price"], days=90, trend=trend),
        "fii_dii": get_fii_dii_data(symbol),
        "sentiment": get_sentiment_data(symbol),
        "filings": get_sebi_filings(symbol),
    }


@app.get("/api/signals/live")
async def live_signals():
    """Get current live signals from scanner"""
    signals = generate_live_signals()
    market = get_market_overview()
    return {
        "signals": signals,
        "market": market,
        "timestamp": datetime.now().isoformat(),
        "signals_count": len(signals),
    }


@app.post("/api/analyze")
async def analyze_stock(request: AnalysisRequest):
    """
    Run full multi-agent analysis (Researcher → Bull → Bear → Judge → Alert)
    This calls Claude API - takes 15-30 seconds
    """
    symbol = request.symbol.upper()
    if not symbol.endswith(".NS"):
        symbol = f"{symbol}.NS"

    # Check if valid symbol
    valid_symbols = [s["symbol"] for s in NIFTY_STOCKS]
    if symbol not in valid_symbols:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} not tracked. Valid symbols: {valid_symbols}"
        )

    try:
        result = await run_full_analysis(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/alerts/send")
async def send_alert(request: AlertRequest):
    """
    Stub for WhatsApp/Telegram alert delivery
    In production: integrate Twilio (WhatsApp) or python-telegram-bot
    """
    symbol = request.symbol.upper()
    if not symbol.endswith(".NS"):
        symbol = f"{symbol}.NS"

    stock = get_stock_price(symbol)
    fii = get_fii_dii_data(symbol)
    sentiment = get_sentiment_data(symbol)

    # Mock alert message
    alert_msg = f"""🚀 OPPORTUNITY RADAR ALERT
━━━━━━━━━━━━━━━━━━━━
{symbol} | ₹{stock.get('price', 'N/A')}
📈 {stock.get('change_pct', 0):+.2f}% today

FII: {fii.get('fii_net_label', 'N/A')} | Sentiment: {sentiment.get('overall_sentiment', 'N/A')}

⚠️ {'DANGER SIGNAL: Retail bullish but FII selling!' if fii.get('divergence_detected') else 'No divergence detected'}

View analysis → OpportunityRadar.ai"""

    # Production: send via Twilio/Telegram here
    return {
        "success": True,
        "channel": request.channel,
        "message": alert_msg,
        "note": "In production: sends via Twilio WhatsApp API or python-telegram-bot",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/screener")
async def screener(
    sector: Optional[str] = None,
    signal_type: Optional[str] = None,
    min_score: float = 6.0
):
    """Screen stocks by sector, signal type, min judge score"""
    signals = generate_live_signals()

    if sector:
        signals = [s for s in signals if s.get("sector", "").lower() == sector.lower()]
    if signal_type:
        signals = [s for s in signals if s.get("signal_type", "").upper() == signal_type.upper()]
    signals = [s for s in signals if s.get("judge_score", 0) >= min_score]

    return {
        "results": signals,
        "count": len(signals),
        "filters": {"sector": sector, "signal_type": signal_type, "min_score": min_score},
    }


@app.get("/api/sectors")
async def get_sectors():
    """Get available sectors"""
    sectors = list(set(s["sector"] for s in NIFTY_STOCKS))
    return {"sectors": sorted(sectors)}


# ─── WebSocket ────────────────────────────────────────────────────────────────

@app.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    """WebSocket endpoint for live signal streaming"""
    await manager.connect(websocket)
    try:
        # Send initial data immediately
        signals = generate_live_signals()
        market = get_market_overview()
        await websocket.send_json({
            "type": "initial",
            "data": signals[:5],
            "market": market,
            "timestamp": datetime.now().isoformat(),
        })

        # Keep connection alive
        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=30)
                if msg == "ping":
                    await websocket.send_json({"type": "pong"})
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "heartbeat"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
