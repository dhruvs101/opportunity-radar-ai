"""
Opportunity Radar AI - Multi-Agent Pipeline
Uses LangGraph + Claude Sonnet for Bull/Bear/Judge debate architecture
"""
import os
import json
from typing import TypedDict, Annotated, List, Optional
from datetime import datetime
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from data.mock_data import (
    get_stock_price, get_fii_dii_data, get_sentiment_data,
    get_sebi_filings, generate_ohlcv, CHART_PATTERNS
)
import random

# Load backend/.env so local runs and CMD sessions can use file-based secrets.
load_dotenv()

hf_token = os.environ.get("HUGGINGFACEHUB_API_TOKEN") or os.environ.get("HF_TOKEN")
if not hf_token:
    raise RuntimeError(
        "Missing Hugging Face token. Set HUGGINGFACEHUB_API_TOKEN (or HF_TOKEN) in backend/.env or your shell."
    )

client = InferenceClient(api_key=hf_token)
MODEL = "meta-llama/Llama-3.3-70B-Instruct"


# ─── State Schema ─────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    symbol: str
    stock_data: dict
    fii_dii_data: dict
    sentiment_data: dict
    sebi_filings: list
    ohlcv: list
    researcher_report: str
    bull_case: str
    bear_case: str
    judge_verdict: str
    risk_reward_score: float
    signal_type: str
    alert_message: str
    divergence_detected: bool
    danger_signal: bool
    messages: Annotated[list, add_messages]


# ─── Agent: Researcher ────────────────────────────────────────────────────────

def researcher_agent(state: AgentState) -> AgentState:
    """Pulls and synthesizes all available data into a research brief"""
    symbol = state["symbol"]
    stock = state["stock_data"]
    fii = state["fii_dii_data"]
    sentiment = state["sentiment_data"]
    filings = state["sebi_filings"]

    prompt = f"""You are a senior equity research analyst covering Indian markets. 
Analyze the following data for {symbol} and produce a concise research brief.

STOCK DATA:
- Current Price: ₹{stock.get('price', 'N/A')}
- Change: {stock.get('change_pct', 0):.2f}%
- Sector: {stock.get('sector', 'N/A')}
- P/E Ratio: {stock.get('pe_ratio', 'N/A')}
- 52W High: ₹{stock.get('52w_high', 'N/A')} | 52W Low: ₹{stock.get('52w_low', 'N/A')}

FII/DII FLOWS (3-day net):
- FII Net: {fii.get('fii_net_label', 'N/A')} 
- DII Net: {fii.get('dii_net_label', 'N/A')}
- Divergence Detected: {fii.get('divergence_detected', False)}

SOCIAL SENTIMENT:
- Twitter Score: {sentiment.get('twitter_score', 0)} (scale -100 to +100)
- Overall: {sentiment.get('overall_sentiment', 'N/A')}
- Mention Volume 24h: {sentiment.get('mention_volume_24h', 0):,}
- Top Keywords: {', '.join(sentiment.get('top_keywords', []))}

RECENT SEBI FILINGS:
{chr(10).join([f"- [{f['date']}] {f['type']}: {f['description']}" for f in filings[:3]])}

Write a structured research brief in 4-5 bullet points covering:
1. Price action & technical setup
2. Institutional activity (FII/DII)  
3. Retail sentiment vs institutional divergence
4. Key risks from filings
5. Overall setup quality

Be specific, data-driven, and India-market aware. Mention NSE-specific context."""

    response = client.chat_completion(
        model=MODEL,
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )

    report = response.choices[0].message.content
    return {**state, "researcher_report": report}


# ─── Agent: Bull ──────────────────────────────────────────────────────────────

def bull_agent(state: AgentState) -> AgentState:
    """Builds the strongest possible bullish case"""
    symbol = state["symbol"]
    researcher_report = state["researcher_report"]
    stock = state["stock_data"]
    pattern = random.choice(CHART_PATTERNS)

    prompt = f"""You are an aggressive bull case analyst. Your job is to find every reason to BUY {symbol}.

RESEARCHER BRIEF:
{researcher_report}

Chart Pattern Detected: {pattern}
Current Price: ₹{stock.get('price', 'N/A')}

Build the STRONGEST possible bull case in exactly 5 points. Be specific with price targets, 
historical win rates, catalyst timelines. Reference Indian market dynamics (FII flows, budget cycles, 
sector tailwinds). End with a target price and expected timeframe.

Format:
BULL CASE for {symbol}:
• [Point 1]
• [Point 2]
• [Point 3]
• [Point 4]
• [Point 5]
TARGET: ₹[price] in [timeframe]
CONVICTION: [High/Medium] | WIN RATE HISTORICAL: [X]%"""

    response = client.chat_completion(
        model=MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return {**state, "bull_case": response.choices[0].message.content}


# ─── Agent: Bear ──────────────────────────────────────────────────────────────

def bear_agent(state: AgentState) -> AgentState:
    """Stress-tests every bull claim and builds bear case"""
    symbol = state["symbol"]
    bull_case = state["bull_case"]
    fii = state["fii_dii_data"]
    sentiment = state["sentiment_data"]
    stock = state["stock_data"]

    divergence_note = ""
    if fii.get("divergence_detected"):
        divergence_note = f"\n⚠️ DANGER: Twitter sentiment is {sentiment.get('twitter_score',0)} (bullish) but FII sold ₹{abs(fii.get('fii_net_3d',0))}Cr in 3 days. Classic retail trap."

    prompt = f"""You are a contrarian bear case analyst. DESTROY the bull thesis for {symbol}.
Your job: find every flaw, risk, and red flag.

BULL CASE TO REFUTE:
{bull_case}
{divergence_note}

FII Net (3 days): {fii.get('fii_net_label', 'N/A')} (negative = institutional selling)
Retail Sentiment: {sentiment.get('overall_sentiment', 'N/A')} ({sentiment.get('twitter_score', 0)}/100)

Build 5 specific bear points that refute the bull thesis. Reference:
- Institutional selling patterns
- Valuation concerns in Indian market context  
- Regulatory/SEBI risks
- Macro headwinds (RBI policy, INR, FII outflows)
- Any retail-institutional divergence as a trap signal

Format:
BEAR CASE for {symbol}:
• [Point 1 — directly refutes bull point]
• [Point 2]
• [Point 3]
• [Point 4]
• [Point 5]
STOP LOSS: ₹[price]
RISK: [High/Medium/Low] | DOWNSIDE: [X]%"""

    response = client.chat_completion(
        model=MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return {**state, "bear_case": response.choices[0].message.content}


# ─── Agent: Judge ─────────────────────────────────────────────────────────────

def judge_agent(state: AgentState) -> AgentState:
    """Synthesizes bull vs bear debate into asymmetric risk/reward score"""
    symbol = state["symbol"]
    bull_case = state["bull_case"]
    bear_case = state["bear_case"]
    researcher_report = state["researcher_report"]
    fii = state["fii_dii_data"]
    sentiment = state["sentiment_data"]

    divergence_penalty = -1.5 if fii.get("divergence_detected") else 0

    prompt = f"""You are the Chief Investment Officer and final arbiter. You've heard both sides.
Synthesize the debate for {symbol} and deliver a final verdict.

RESEARCHER BRIEF:
{researcher_report}

BULL CASE:
{bull_case}

BEAR CASE:
{bear_case}

DIVERGENCE SIGNAL: {"⚠️ YES - Retail bullish but institutions selling. Apply -1.5 penalty to score." if fii.get('divergence_detected') else "No divergence detected"}

Deliver:
1. VERDICT: Bull/Bear/Neutral
2. JUDGE SCORE: X.X/10 (where 10 = perfect asymmetric setup, account for divergence penalty of {divergence_penalty})
3. ASYMMETRIC SETUP: Risk/Reward ratio (e.g., "Risk ₹15 to make ₹60 = 1:4")
4. KEY INSIGHT: One sentence that explains the core thesis in plain Hindi-English (Hinglish ok)
5. SIGNAL TYPE: BREAKOUT / DIVERGENCE / REVERSAL / ANOMALY / DANGER
6. ACTION: BUY / SELL / WATCH / AVOID

Format your response as JSON:
{{
  "verdict": "Bull|Bear|Neutral",
  "judge_score": 7.4,
  "risk_reward": "1:3.5",
  "key_insight": "...",
  "signal_type": "BREAKOUT|DIVERGENCE|REVERSAL|ANOMALY|DANGER",
  "action": "BUY|SELL|WATCH|AVOID",
  "summary": "2-3 sentence explanation for retail investor"
}}"""

    response = client.chat_completion(
        model=MODEL,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.choices[0].message.content
    try:
        # Extract JSON from response
        start = raw.find("{")
        end = raw.rfind("}") + 1
        verdict_data = json.loads(raw[start:end])
    except:
        verdict_data = {
            "verdict": "Neutral",
            "judge_score": 5.0,
            "risk_reward": "1:2",
            "key_insight": "Analysis inconclusive - more data needed",
            "signal_type": "ANOMALY",
            "action": "WATCH",
            "summary": "Insufficient data for high-conviction signal."
        }

    return {
        **state,
        "judge_verdict": json.dumps(verdict_data),
        "risk_reward_score": verdict_data.get("judge_score", 5.0),
        "signal_type": verdict_data.get("signal_type", "ANOMALY"),
        "danger_signal": fii.get("divergence_detected", False) and verdict_data.get("verdict") != "Bear",
    }


# ─── Agent: Alert ─────────────────────────────────────────────────────────────

def alert_agent(state: AgentState) -> AgentState:
    """Formats signal into WhatsApp/Telegram-ready alert"""
    symbol = state["symbol"]
    stock = state["stock_data"]

    try:
        verdict = json.loads(state["judge_verdict"])
    except:
        verdict = {}

    score = verdict.get("judge_score", state.get("risk_reward_score", 5.0))
    signal_type = verdict.get("signal_type", state.get("signal_type", "ANOMALY"))
    action = verdict.get("action", "WATCH")
    insight = verdict.get("key_insight", "")

    emoji_map = {
        "BREAKOUT": "🚀", "DIVERGENCE": "⚠️", "REVERSAL": "🔄",
        "ANOMALY": "🔍", "DANGER": "🚨"
    }
    action_emoji = {"BUY": "✅", "SELL": "❌", "WATCH": "👁️", "AVOID": "🚫"}

    alert = f"""
{emoji_map.get(signal_type, '📊')} *OPPORTUNITY RADAR ALERT*
━━━━━━━━━━━━━━━━━━━━
*{symbol}* | ₹{stock.get('price', 'N/A')}
📈 {stock.get('change_pct', 0):+.2f}% today

🎯 Signal: *{signal_type}*
⚖️ Judge Score: *{score}/10*
📊 R:R Ratio: {verdict.get('risk_reward', 'N/A')}
{action_emoji.get(action, '👁️')} Action: *{action}*

💡 Insight: {insight}

🔗 View full analysis → OpportunityRadar.ai
━━━━━━━━━━━━━━━━━━━━
_Powered by Opportunity Radar AI_
""".strip()

    return {**state, "alert_message": alert}


# ─── Graph Builder ────────────────────────────────────────────────────────────

def build_agent_graph():
    """Build the LangGraph pipeline"""
    graph = StateGraph(AgentState)

    graph.add_node("researcher", researcher_agent)
    graph.add_node("bull", bull_agent)
    graph.add_node("bear", bear_agent)
    graph.add_node("judge", judge_agent)
    graph.add_node("alert", alert_agent)

    graph.set_entry_point("researcher")
    graph.add_edge("researcher", "bull")
    graph.add_edge("bull", "bear")
    graph.add_edge("bear", "judge")
    graph.add_edge("judge", "alert")
    graph.add_edge("alert", END)

    return graph.compile()


# ─── Main Analysis Runner ─────────────────────────────────────────────────────

async def run_full_analysis(symbol: str) -> dict:
    """Run full multi-agent analysis for a stock"""
    # Gather all data
    stock_data = get_stock_price(symbol)
    fii_dii_data = get_fii_dii_data(symbol)
    sentiment_data = get_sentiment_data(symbol)
    sebi_filings = get_sebi_filings(symbol)
    ohlcv = generate_ohlcv(
        base_price=stock_data.get("price", 1000),
        days=90,
        trend="bullish" if stock_data.get("change_pct", 0) > 0 else "bearish"
    )

    initial_state: AgentState = {
        "symbol": symbol,
        "stock_data": stock_data,
        "fii_dii_data": fii_dii_data,
        "sentiment_data": sentiment_data,
        "sebi_filings": sebi_filings,
        "ohlcv": ohlcv,
        "researcher_report": "",
        "bull_case": "",
        "bear_case": "",
        "judge_verdict": "",
        "risk_reward_score": 0.0,
        "signal_type": "",
        "alert_message": "",
        "divergence_detected": fii_dii_data.get("divergence_detected", False),
        "danger_signal": False,
        "messages": [],
    }

    graph = build_agent_graph()
    final_state = graph.invoke(initial_state)

    try:
        verdict = json.loads(final_state["judge_verdict"])
    except:
        verdict = {}

    return {
        "symbol": symbol,
        "stock_data": final_state["stock_data"],
        "fii_dii_data": final_state["fii_dii_data"],
        "sentiment_data": final_state["sentiment_data"],
        "sebi_filings": final_state["sebi_filings"],
        "ohlcv": final_state["ohlcv"],
        "researcher_report": final_state["researcher_report"],
        "bull_case": final_state["bull_case"],
        "bear_case": final_state["bear_case"],
        "judge_verdict": verdict,
        "risk_reward_score": final_state["risk_reward_score"],
        "signal_type": final_state["signal_type"],
        "alert_message": final_state["alert_message"],
        "divergence_detected": final_state["divergence_detected"],
        "danger_signal": final_state["danger_signal"],
        "analyzed_at": datetime.now().isoformat(),
    }
