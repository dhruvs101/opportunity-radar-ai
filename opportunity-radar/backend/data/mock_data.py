"""
Mock data layer for Opportunity Radar AI
Simulates NSE stock data, FII/DII flows, sentiment, SEBI filings
"""
import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd

random.seed(42)

NIFTY_STOCKS = [
    {"symbol": "TATAPOWER.NS", "name": "Tata Power", "sector": "Energy", "market_cap": 45000},
    {"symbol": "ZOMATO.NS", "name": "Zomato", "sector": "Consumer", "market_cap": 180000},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "sector": "Conglomerate", "market_cap": 1950000},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "sector": "Banking", "market_cap": 1200000},
    {"symbol": "INFY.NS", "name": "Infosys", "sector": "IT", "market_cap": 620000},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors", "sector": "Auto", "market_cap": 320000},
    {"symbol": "ADANIPORTS.NS", "name": "Adani Ports", "sector": "Infrastructure", "market_cap": 280000},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance", "sector": "NBFC", "market_cap": 440000},
    {"symbol": "WIPRO.NS", "name": "Wipro", "sector": "IT", "market_cap": 260000},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "sector": "Banking", "market_cap": 680000},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "sector": "Banking", "market_cap": 870000},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical", "sector": "Pharma", "market_cap": 380000},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "sector": "Telecom", "market_cap": 950000},
    {"symbol": "ITC.NS", "name": "ITC Limited", "sector": "FMCG", "market_cap": 560000},
    {"symbol": "NESTLEIND.NS", "name": "Nestle India", "sector": "FMCG", "market_cap": 220000},
]

CHART_PATTERNS = [
    "Cup & Handle (Weekly)",
    "Bull Flag Breakout",
    "Double Bottom Reversal",
    "Head & Shoulders (Bearish)",
    "Ascending Triangle",
    "Descending Wedge Breakout",
    "Golden Cross (50/200 DMA)",
    "Inverse Head & Shoulders",
    "Rectangle Breakout",
    "Falling Wedge Reversal",
]

EARNINGS_ANOMALIES = [
    "Management used 'headwinds' 6x in Q3 call vs 1x prior",
    "Revenue guidance lowered by 8% mid-quarter",
    "CFO sold ₹4.2Cr in shares 3 days post-earnings",
    "Hedging language spike detected in earnings transcript",
    "Promoter pledge increased by 12% this quarter",
    "Audit committee chair resigned without explanation",
    "Inventory buildup 34% above 5-year seasonal average",
    "Deferred revenue recognition flagged by auditor",
]


def generate_ohlcv(base_price: float, days: int = 90, trend: str = "bullish") -> List[Dict]:
    """Generate realistic OHLCV data with trend"""
    data = []
    price = base_price
    trend_factor = 0.002 if trend == "bullish" else -0.001 if trend == "bearish" else 0.0

    for i in range(days):
        date = datetime.now() - timedelta(days=days - i)
        daily_return = np.random.normal(trend_factor, 0.018)
        open_price = price
        close_price = price * (1 + daily_return)
        high_price = max(open_price, close_price) * (1 + abs(np.random.normal(0, 0.008)))
        low_price = min(open_price, close_price) * (1 - abs(np.random.normal(0, 0.008)))
        volume = int(np.random.lognormal(15, 0.5))

        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume,
        })
        price = close_price
    return data


def get_stock_price(symbol: str) -> Dict:
    """Get current mock stock price"""
    stock = next((s for s in NIFTY_STOCKS if s["symbol"] == symbol), None)
    if not stock:
        return {}

    base_prices = {
        "TATAPOWER.NS": 418, "ZOMATO.NS": 248, "RELIANCE.NS": 2891,
        "HDFCBANK.NS": 1672, "INFY.NS": 1523, "TATAMOTORS.NS": 892,
        "ADANIPORTS.NS": 1234, "BAJFINANCE.NS": 7234, "WIPRO.NS": 467,
        "SBIN.NS": 812, "ICICIBANK.NS": 1156, "SUNPHARMA.NS": 1689,
        "BHARTIARTL.NS": 1456, "ITC.NS": 478, "NESTLEIND.NS": 2345,
    }
    base = base_prices.get(symbol, 1000)
    price = base * (1 + random.uniform(-0.03, 0.03))
    change = price - base
    change_pct = (change / base) * 100

    return {
        "symbol": symbol,
        "name": stock["name"],
        "sector": stock["sector"],
        "price": round(price, 2),
        "change": round(change, 2),
        "change_pct": round(change_pct, 2),
        "volume": random.randint(1_000_000, 50_000_000),
        "market_cap": stock["market_cap"],
        "52w_high": round(price * 1.35, 2),
        "52w_low": round(price * 0.65, 2),
        "pe_ratio": round(random.uniform(15, 65), 1),
        "pbv": round(random.uniform(1.2, 8.5), 2),
    }


def get_fii_dii_data(symbol: str) -> Dict:
    """Mock FII/DII institutional flow data"""
    fii_net = random.randint(-800, 800)
    dii_net = random.randint(-500, 600)

    # Divergence signal: FII selling but retail buying
    divergence = False
    if fii_net < -200:
        divergence = True

    history = []
    for i in range(10):
        date = datetime.now() - timedelta(days=i)
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "fii_buy": random.randint(100, 1200),
            "fii_sell": random.randint(100, 1200),
            "fii_net": random.randint(-600, 600),
            "dii_buy": random.randint(80, 800),
            "dii_sell": random.randint(80, 800),
            "dii_net": random.randint(-400, 400),
        })

    return {
        "symbol": symbol,
        "fii_net_3d": fii_net,
        "dii_net_3d": dii_net,
        "fii_net_label": f"{'+'if fii_net>0 else ''}₹{fii_net}Cr",
        "dii_net_label": f"{'+'if dii_net>0 else ''}₹{dii_net}Cr",
        "divergence_detected": divergence,
        "history": history,
    }


def get_sentiment_data(symbol: str) -> Dict:
    """Mock social sentiment data"""
    twitter_score = random.randint(-100, 100)
    reddit_score = random.randint(-80, 80)
    news_score = random.randint(-60, 60)

    sentiment_label = "Bullish" if twitter_score > 20 else "Bearish" if twitter_score < -20 else "Neutral"

    return {
        "symbol": symbol,
        "twitter_score": twitter_score,
        "reddit_score": reddit_score,
        "news_score": news_score,
        "overall_sentiment": sentiment_label,
        "mention_volume_24h": random.randint(500, 15000),
        "sentiment_trend": random.choice(["Rising", "Falling", "Stable"]),
        "top_keywords": random.sample(
            ["breakout", "earnings", "buy", "sell", "target", "support", "resistance", "rally", "crash", "accumulate"],
            4
        ),
    }


def get_sebi_filings(symbol: str) -> List[Dict]:
    """Mock SEBI filings and insider trades"""
    filings = []
    filing_types = ["Insider Trade", "Block Deal", "Bulk Deal", "Promoter Pledge", "Board Meeting", "QIP"]

    for i in range(random.randint(2, 5)):
        date = datetime.now() - timedelta(days=random.randint(1, 30))
        ftype = random.choice(filing_types)
        amount = random.randint(1, 500)

        filings.append({
            "date": date.strftime("%Y-%m-%d"),
            "type": ftype,
            "description": f"{ftype} of ₹{amount}Cr detected",
            "sentiment": random.choice(["Bullish", "Bearish", "Neutral"]),
            "magnitude": random.choice(["High", "Medium", "Low"]),
        })

    return sorted(filings, key=lambda x: x["date"], reverse=True)


def generate_live_signals() -> List[Dict]:
    """Generate live trading signals for dashboard"""
    signals = []
    stocks_to_scan = random.sample(NIFTY_STOCKS, 8)

    signal_types = [
        ("BREAKOUT", "🟢", "bullish"),
        ("DIVERGENCE", "🔴", "bearish"),
        ("ANOMALY", "🟡", "neutral"),
        ("REVERSAL", "🟢", "bullish"),
        ("DANGER", "🔴", "bearish"),
    ]

    for stock in stocks_to_scan:
        symbol = stock["symbol"]
        price_data = get_stock_price(symbol)
        pattern = random.choice(CHART_PATTERNS)
        signal_type, emoji, bias = random.choice(signal_types)
        win_rate = random.randint(52, 84)
        judge_score = round(random.uniform(4.5, 9.2), 1)

        signals.append({
            "id": f"sig_{symbol}_{int(datetime.now().timestamp())}_{random.randint(100,999)}",
            "symbol": symbol,
            "name": stock["name"],
            "sector": stock["sector"],
            "signal_type": signal_type,
            "emoji": emoji,
            "bias": bias,
            "pattern": pattern,
            "price": price_data.get("price", 0),
            "change_pct": price_data.get("change_pct", 0),
            "win_rate": win_rate,
            "judge_score": judge_score,
            "timestamp": datetime.now().isoformat(),
            "fii_dii": get_fii_dii_data(symbol),
            "sentiment": get_sentiment_data(symbol),
        })

    return sorted(signals, key=lambda x: x["judge_score"], reverse=True)


def get_market_overview() -> Dict:
    """Get overall market stats"""
    return {
        "nifty50": {
            "value": round(22_450 + random.uniform(-200, 200), 2),
            "change": round(random.uniform(-1.5, 1.5), 2),
        },
        "sensex": {
            "value": round(73_800 + random.uniform(-500, 500), 2),
            "change": round(random.uniform(-1.5, 1.5), 2),
        },
        "niftybank": {
            "value": round(48_200 + random.uniform(-300, 300), 2),
            "change": round(random.uniform(-2, 2), 2),
        },
        "india_vix": round(random.uniform(12, 22), 2),
        "market_breadth": {
            "advances": random.randint(900, 1400),
            "declines": random.randint(600, 1200),
            "unchanged": random.randint(50, 150),
        },
        "total_fii_net": round(random.uniform(-3000, 3000), 2),
        "total_dii_net": round(random.uniform(-2000, 2500), 2),
        "timestamp": datetime.now().isoformat(),
    }
