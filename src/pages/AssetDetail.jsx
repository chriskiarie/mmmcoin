import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, AreaSeries, ColorType } from 'lightweight-charts';
import {
  ChevronLeft, Share2, Star, X, Activity, TrendingUp,
  TrendingDown, BarChart2, Clock, Info, ChevronDown
} from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIM_BASES = {
  FX_EURUSD: 1.0842, FX_GBPUSD: 1.2643, FX_USDJPY: 149.82,
  FX_AUDUSD: 0.6521, FX_USDCAD: 1.3642, FX_USDCHF: 0.9012,
  IDX_SPX: 5842.5, IDX_NAS: 20453.2, IDX_DOW: 42891,
  IDX_DAX: 18423.8, IDX_GOLD: 2042.3, IDX_OIL: 78.45, IDX_SILVER: 22.84,
};

const QUICK_PAIRS = [
  { symbol: 'BTCUSDT', label: 'BTC', color: '#F7931A', ticker: 'btc' },
  { symbol: 'ETHUSDT', label: 'ETH', color: '#627EEA', ticker: 'eth' },
  { symbol: 'SOLUSDT', label: 'SOL', color: '#9945FF', ticker: 'sol' },
  { symbol: 'BNBUSDT', label: 'BNB', color: '#F3BA2F', ticker: 'bnb' },
  { symbol: 'XRPUSDT', label: 'XRP', color: '#346AA9', ticker: 'xrp' },
  { symbol: 'DOGEUSDT',label: 'DOGE',color: '#C2A633', ticker: 'doge' },
  { symbol: 'AVAXUSDT', label: 'AVAX',color: '#E84142', ticker: 'avax' },
  { symbol: 'ADAUSDT', label: 'ADA', color: '#0033AD', ticker: 'ada' },
];

const TIMEFRAMES = ['15m', '1H', '4H', '1D'];
const TF_INTERVAL = { '15m': '15m', '1H': '1h', '4H': '4h', '1D': '1d' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSimData(base, count = 60) {
  const now = Math.floor(Date.now() / 1000);
  const step = 3600;
  let close = base;
  return Array.from({ length: count }, (_, i) => {
    const open  = close;
    const move  = (Math.random() - 0.49) * base * 0.008;
    close = parseFloat((open + move).toFixed(base < 10 ? 4 : base < 100 ? 2 : 1));
    const hi = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.003)).toFixed(close < 10 ? 4 : 2));
    const lo = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.003)).toFixed(close < 10 ? 4 : 2));
    return { time: now - (count - i) * step, open, high: hi, low: lo, close };
  });
}

function CoinIcon({ ticker, color, size = 20 }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="rounded-full flex items-center justify-center font-black text-[8px] flex-shrink-0"
      style={{ width: size, height: size, background: `${color}22`, color }}>
      {ticker?.toUpperCase()?.slice(0, 3)}
    </div>
  );
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker}.png`}
      alt={ticker} onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetDetail() {
  const { symbol }  = useParams();
  const navigate    = useNavigate();
  const { theme }   = useTheme();
  const isDark      = theme === 'dark';

  const chartContainerRef = useRef(null);
  const chartRef          = useRef(null);
  const seriesRef         = useRef(null);
  const wsRef             = useRef(null);
  const klineWsRef        = useRef(null);

  const isCrypto = !symbol?.startsWith('FX_') && !symbol?.startsWith('IDX_');
  const pairInfo = QUICK_PAIRS.find(p => p.symbol === symbol) || QUICK_PAIRS[0];
  const displaySymbol = isCrypto
    ? symbol?.replace('USDT', '') + ' / USDT'
    : symbol?.replace('FX_', '').replace('IDX_', '').replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');

  const [price,      setPrice]      = useState('—');
  const [change24h,  setChange24h]  = useState('0.00');
  const [isPositive, setIsPositive] = useState(true);
  const [volume,     setVolume]     = useState('—');
  const [high24h,    setHigh24h]    = useState('—');
  const [low24h,     setLow24h]     = useState('—');
  const [timeframe,  setTimeframe]  = useState('1H');
  const [chartType,  setChartType]  = useState('candle'); // candle | area
  const [showOrder,  setShowOrder]  = useState(false);
  const [side,       setSide]       = useState('buy');
  const [amount,     setAmount]     = useState('');
  const [chartReady, setChartReady] = useState(false);
  const [starred,    setStarred]    = useState(false);

  // ── Build chart ─────────────────────────────────────────────────────────
  const buildChart = useCallback(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';
    if (chartRef.current) { try { chartRef.current.remove(); } catch {} }

    const bg   = isDark ? '#000000' : '#ffffff';
    const grid = isDark ? '#0f0f0f' : '#f5f5f5';
    const text = isDark ? '#555555' : '#999999';

    const chart = createChart(chartContainerRef.current, {
      layout:  { background: { type: ColorType.Solid, color: bg }, textColor: text, fontSize: 10 },
      grid:    { vertLines: { color: grid }, horzLines: { color: grid } },
      width:   chartContainerRef.current.clientWidth,
      height:  300,
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderVisible: false },
      crosshair: {
        vertLine: { color: '#FFB800', labelBackgroundColor: '#FFB800' },
        horzLine: { color: '#FFB800', labelBackgroundColor: '#FFB800' },
      },
    });

    chartRef.current = chart;

    if (chartType === 'candle') {
      seriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: '#00c805', downColor: '#ff3b30',
        borderUpColor: '#00c805', borderDownColor: '#ff3b30',
        wickUpColor: '#00c805', wickDownColor: '#ff3b30',
      });
    } else {
      seriesRef.current = chart.addSeries(AreaSeries, {
        lineColor: '#FFB800',
        topColor: isDark ? 'rgba(255,184,0,0.15)' : 'rgba(255,184,0,0.12)',
        bottomColor: 'rgba(255,184,0,0)',
        lineWidth: 2,
      });
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    setChartReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      setChartReady(false);
    };
  }, [isDark, chartType]);

  useEffect(() => {
    const cleanup = buildChart();
    return () => {
      if (cleanup) cleanup();
      if (chartRef.current) { try { chartRef.current.remove(); } catch {} chartRef.current = null; }
      seriesRef.current = null;
      setChartReady(false);
    };
  }, [buildChart]);

  // ── Load klines ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartReady || !seriesRef.current) return;

    if (!isCrypto) {
      const base = SIM_BASES[symbol] || 100;
      seriesRef.current.setData(generateSimData(base, 72));
      chartRef.current?.timeScale().fitContent();
      return;
    }

    const interval = TF_INTERVAL[timeframe] || '1h';
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`)
      .then(r => r.json())
      .then(data => {
        if (!seriesRef.current || !Array.isArray(data)) return;
        const candles = data.map(k => ({
          time: k[0] / 1000,
          open: parseFloat(k[1]), high: parseFloat(k[2]),
          low:  parseFloat(k[3]), close: parseFloat(k[4]),
        }));
        seriesRef.current.setData(candles);
        chartRef.current?.timeScale().fitContent();
      })
      .catch(() => {});
  }, [chartReady, symbol, timeframe, isCrypto]);

  // ── Ticker WebSocket ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCrypto) {
      const base = SIM_BASES[symbol] || 100;
      setPrice(base.toFixed(base < 10 ? 4 : base < 1000 ? 2 : 1));
      setChange24h((Math.random() * 3).toFixed(2));
      setIsPositive(Math.random() > 0.5);

      const id = setInterval(() => {
        setPrice(p => {
          const cur = parseFloat(p) || base;
          const drift = (Math.random() - 0.49) * cur * 0.0006;
          return (cur + drift).toFixed(cur < 10 ? 4 : cur < 1000 ? 2 : 1);
        });
      }, 1800);
      return () => clearInterval(id);
    }

    if (wsRef.current) { try { wsRef.current.close(); } catch {} }
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.c) return;
      const p = parseFloat(d.c), chg = parseFloat(d.P);
      setPrice(p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setChange24h(Math.abs(chg).toFixed(2));
      setIsPositive(chg >= 0);
      const vol = parseFloat(d.q);
      setVolume(vol >= 1e9 ? `${(vol / 1e9).toFixed(2)}B` : vol >= 1e6 ? `${(vol / 1e6).toFixed(0)}M` : vol.toFixed(0));
      setHigh24h(parseFloat(d.h).toLocaleString(undefined, { minimumFractionDigits: 2 }));
      setLow24h(parseFloat(d.l).toLocaleString(undefined, { minimumFractionDigits: 2 }));
    };
    wsRef.current = ws;
    return () => { try { ws.close(); } catch {} };
  }, [symbol, isCrypto]);

  // ── Live kline updates ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCrypto || !chartReady) return;
    if (klineWsRef.current) { try { klineWsRef.current.close(); } catch {} }

    const interval = TF_INTERVAL[timeframe] || '1h';
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.k || !seriesRef.current) return;
      const k = d.k;
      const candle = {
        time: k.t / 1000,
        open: parseFloat(k.o), high: parseFloat(k.h),
        low:  parseFloat(k.l), close: parseFloat(k.c),
      };
      try { seriesRef.current.update(candle); } catch {}
    };
    klineWsRef.current = ws;
    return () => { try { ws.close(); } catch {} };
  }, [symbol, timeframe, isCrypto, chartReady]);

  // ─── Theme-dependent styles ──────────────────────────────────────────────
  const bg       = isDark ? 'bg-black'        : 'bg-white';
  const bgPage   = isDark ? 'bg-black text-white' : 'bg-white text-gray-900';
  const bgCard   = isDark ? 'bg-[#0a0c0f] border-white/5' : 'bg-gray-50 border-gray-200';
  const bgAlt    = isDark ? 'bg-white/[0.04] border-white/8' : 'bg-gray-100 border-gray-200';
  const textSub  = isDark ? 'text-gray-500'   : 'text-gray-500';
  const textMuted= isDark ? 'text-gray-700'   : 'text-gray-400';
  const divider  = isDark ? 'border-white/5'  : 'border-gray-100';
  const inputCls = isDark ? 'bg-black border-white/8 text-white placeholder-gray-600'
                          : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400';

  return (
    <div className={`min-h-screen font-sans pb-28 ${bgPage}`}>
      <style>{`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .slide-up { animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>

      {/* ── Header ── */}
      <div className={`px-4 py-3 flex items-center justify-between border-b sticky top-0 z-30 backdrop-blur-xl ${bg} ${divider}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {isCrypto && <CoinIcon ticker={pairInfo.ticker} color={pairInfo.color} size={22} />}
            <div>
              <h2 className="text-sm font-black italic tracking-tight uppercase leading-none">{displaySymbol}</h2>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${textMuted}`}>
                {isCrypto ? 'Spot · Live' : 'CFD · Simulated'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className={`p-1.5 rounded-full transition-colors ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
            <Share2 size={17} />
          </button>
          <button onClick={() => setStarred(s => !s)}
            className={`p-1.5 rounded-full transition-all ${starred ? 'text-yellow-500' : isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
            <Star size={17} fill={starred ? '#FFB800' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── Quick pair switcher ── */}
      <div className={`flex gap-0 px-4 py-3 border-b overflow-x-auto scrollbar-hide ${divider}`}>
        {QUICK_PAIRS.map(p => {
          const active = symbol === p.symbol;
          return (
            <button key={p.symbol} onClick={() => navigate(`/trade/${p.symbol}`)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl mr-1.5 text-[11px] font-black transition-all flex-shrink-0 ${
                active
                  ? isDark ? 'bg-white/8 text-white border border-white/10' : 'bg-gray-100 text-gray-900 border border-gray-200'
                  : `${textMuted} hover:text-yellow-500`
              }`}
              style={active ? { borderColor: `${p.color}40`, color: active ? p.color : undefined } : {}}>
              <CoinIcon ticker={p.ticker} color={p.color} size={14} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* ── Price hero ── */}
      <div className="px-5 py-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-black italic tracking-tighter leading-none">${price}</h1>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {isPositive ? '+' : '-'}{change24h}%
              </span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${textSub}`}>
              24h Vol: {volume}
            </p>
          </div>
          {/* H/L */}
          {high24h !== '—' && (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <TrendingUp size={10} className="text-green-400" />
                <span className={`text-[10px] font-bold ${textSub}`}>${high24h}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <TrendingDown size={10} className="text-red-400" />
                <span className={`text-[10px] font-bold ${textSub}`}>${low24h}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Chart controls ── */}
      <div className={`flex items-center justify-between px-5 mb-2`}>
        {/* Timeframes */}
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                timeframe === tf
                  ? 'bg-yellow-500 text-black'
                  : `${textMuted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`
              }`}>{tf}</button>
          ))}
        </div>
        {/* Chart type toggle */}
        <div className="flex gap-1">
          <button onClick={() => setChartType('candle')}
            className={`p-1.5 rounded-lg transition-all ${chartType === 'candle' ? 'text-yellow-500' : textMuted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
            <BarChart2 size={16} />
          </button>
          <button onClick={() => setChartType('area')}
            className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? 'text-yellow-500' : textMuted} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
            <Activity size={16} />
          </button>
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        ref={chartContainerRef}
        className={`w-full border-y ${divider}`}
        style={{ height: 300, background: isDark ? '#000' : '#fff' }}
      />

      {/* ── Stats grid ── */}
      <div className={`mx-4 mt-4 rounded-2xl border overflow-hidden ${bgCard}`}>
        <div className="grid grid-cols-2 divide-x divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {[
            { label: '24h High',    value: high24h !== '—' ? `$${high24h}` : '—' },
            { label: '24h Low',     value: low24h  !== '—' ? `$${low24h}`  : '—' },
            { label: '24h Volume',  value: volume },
            { label: 'Market Cap',  value: isCrypto ? '~$1.36T' : '—' },
          ].map((s, i) => (
            <div key={i} className={`p-4 border ${divider}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${textMuted}`}>{s.label}</p>
              <p className="text-sm font-black tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trade buttons (fixed bottom) ── */}
      {!showOrder && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 grid grid-cols-2 gap-3 py-3 border-t backdrop-blur-xl ${
          isDark ? 'bg-black/90 border-white/5' : 'bg-white/90 border-gray-200'
        }`}>
          <button
            onClick={() => { setSide('buy'); setShowOrder(true); }}
            className="h-14 bg-green-500 text-black font-black italic uppercase tracking-widest text-sm rounded-2xl active:scale-95 transition-all shadow-lg shadow-green-500/20">
            Long / Buy
          </button>
          <button
            onClick={() => { setSide('sell'); setShowOrder(true); }}
            className="h-14 bg-red-500 text-white font-black italic uppercase tracking-widest text-sm rounded-2xl active:scale-95 transition-all shadow-lg shadow-red-500/20">
            Short / Sell
          </button>
        </div>
      )}

      {/* ── Order sheet ── */}
      {showOrder && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto">
          {/* Scrim */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowOrder(false)} />
          {/* Sheet */}
          <div className={`slide-up rounded-t-3xl border-t p-6 pb-10 ${
            isDark ? 'bg-[#0d0f12] border-white/8' : 'bg-white border-gray-200'
          }`}>
            {/* Sheet header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-5">
                <button onClick={() => setSide('buy')}
                  className={`text-xs font-black uppercase italic pb-1 border-b-2 transition-colors ${
                    side === 'buy' ? 'text-green-400 border-green-400' : `${textMuted} border-transparent`
                  }`}>Market Buy</button>
                <button onClick={() => setSide('sell')}
                  className={`text-xs font-black uppercase italic pb-1 border-b-2 transition-colors ${
                    side === 'sell' ? 'text-red-400 border-red-400' : `${textMuted} border-transparent`
                  }`}>Market Sell</button>
              </div>
              <button onClick={() => setShowOrder(false)}
                className={`p-1.5 rounded-full ${isDark ? 'text-gray-600 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Price row */}
            <div className={`rounded-2xl border p-4 mb-3 flex justify-between items-center ${bgAlt}`}>
              <span className={`text-[9px] font-black uppercase tracking-widest ${textSub}`}>Market Price</span>
              <span className="font-black italic text-yellow-500">${price}</span>
            </div>

            {/* Amount */}
            <div className={`rounded-2xl border p-4 mb-4 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors ${inputCls}`}>
              <span className={`text-[9px] font-black uppercase tracking-widest flex-shrink-0 mr-4 ${textSub}`}>Amount (USDT)</span>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="bg-transparent text-right font-black focus:outline-none text-xl w-28 italic" />
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {[100, 250, 500, 1000].map(a => (
                <button key={a} onClick={() => setAmount(String(a))}
                  className={`py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all active:scale-95 ${bgAlt} ${textSub}`}>
                  ${a}
                </button>
              ))}
            </div>

            <button
              className={`w-full h-16 font-black italic uppercase tracking-widest rounded-2xl text-sm active:scale-[0.98] transition-all shadow-lg ${
                side === 'buy'
                  ? 'bg-green-500 text-black shadow-green-500/20'
                  : 'bg-red-500 text-white shadow-red-500/20'
              }`}>
              Confirm {side === 'buy' ? 'Long' : 'Short'} — ${amount || '0.00'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
