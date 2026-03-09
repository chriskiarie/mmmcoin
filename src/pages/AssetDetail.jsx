import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, AreaSeries, ColorType } from 'lightweight-charts';
import { ChevronLeft, Share2, Star, X, Activity, CandlestickChart, TrendingUp } from 'lucide-react';

const TIMEFRAMES = [
  { label: '15m', interval: '15m', limit: 96 },
  { label: '1H',  interval: '1h',  limit: 72 },
  { label: '4H',  interval: '4h',  limit: 60 },
  { label: '1D',  interval: '1d',  limit: 60 },
];

// Quick-switch popular pairs
const QUICK_PAIRS = [
  { symbol: 'BTCUSDT',  label: 'BTC' },
  { symbol: 'ETHUSDT',  label: 'ETH' },
  { symbol: 'SOLUSDT',  label: 'SOL' },
  { symbol: 'BNBUSDT',  label: 'BNB' },
  { symbol: 'XRPUSDT',  label: 'XRP' },
  { symbol: 'DOGEUSDT', label: 'DOGE' },
  { symbol: 'AVAXUSDT', label: 'AVAX' },
  { symbol: 'ADAUSDT',  label: 'ADA' },
];

const COIN_COLORS = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', BNB: '#F3BA2F',
  XRP: '#346AA9', ADA: '#0033AD', DOGE: '#C2A633', AVAX: '#E84142',
  LINK: '#2A5ADA', DOT: '#E6007A',
};

// Non-crypto (Forex/Indices) assets use simulated chart data
function generateSimData(base, volatility, count) {
  const data = [];
  let price = base;
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i >= 0; i--) {
    const open  = price;
    const chg   = (Math.random() - 0.495) * volatility * price;
    price      += chg;
    const close = price;
    const high  = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low   = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    data.push({ time: now - i * 3600, open, high, low, close });
  }
  return data;
}

const SIM_BASES = {
  FX_EURUSD: { base: 1.084,   vol: 0.0008 },
  FX_GBPUSD: { base: 1.264,   vol: 0.0010 },
  FX_USDJPY: { base: 149.8,   vol: 0.0009 },
  FX_AUDUSD: { base: 0.652,   vol: 0.0011 },
  FX_USDCAD: { base: 1.364,   vol: 0.0008 },
  FX_USDCHF: { base: 0.901,   vol: 0.0007 },
  FX_NZDUSD: { base: 0.598,   vol: 0.0012 },
  FX_EURJPY: { base: 162.4,   vol: 0.0009 },
  IDX_SPX:   { base: 5842.5,  vol: 0.0015 },
  IDX_NAS:   { base: 20453.0, vol: 0.0020 },
  IDX_DOW:   { base: 42891.0, vol: 0.0012 },
  IDX_DAX:   { base: 18423.0, vol: 0.0014 },
  IDX_GOLD:  { base: 2042.0,  vol: 0.0008 },
  IDX_OIL:   { base: 78.45,   vol: 0.0025 },
  IDX_SILVER:{ base: 22.84,   vol: 0.0018 },
};

const AssetDetail = () => {
  const { symbol } = useParams();
  const navigate   = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef   = useRef(null);
  const seriesRef  = useRef(null);

  const [price,          setPrice]         = useState('0.00');
  const [change24h,      setChange24h]      = useState('0.00');
  const [volume,         setVolume]         = useState('—');
  const [isPositive,     setIsPositive]     = useState(true);
  const [activeTimeframe,setActiveTimeframe]= useState('1H');
  const [chartType,      setChartType]      = useState('candle');
  const [chartReady,     setChartReady]     = useState(false);
  const [showOrderCard,  setShowOrderCard]  = useState(false);
  const [side,           setSide]           = useState('buy');
  const [amount,         setAmount]         = useState('');

  const isCrypto = !symbol?.startsWith('FX_') && !symbol?.startsWith('IDX_');
  const base     = isCrypto ? (symbol?.replace('USDT', '') || '') : (symbol?.split('_')[1] || symbol || '');

  // ── Chart Init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: '#505050', fontSize: 11 },
      grid:   { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
      width:  chartContainerRef.current.clientWidth,
      height: 360,
      timeScale:       { borderVisible: false, timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderVisible: false },
      handleScale: true, handleScroll: true,
      crosshair: {
        vertLine: { color: '#FFB800', width: 1, style: 3, labelBackgroundColor: '#FFB800' },
        horzLine: { color: '#FFB800', width: 1, style: 3, labelBackgroundColor: '#FFB800' },
      },
    });

    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#00c805', downColor: '#ff3b30',
      borderUpColor: '#00c805', borderDownColor: '#ff3b30',
      wickUpColor: '#00c805', wickDownColor: '#ff3b30',
    });
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    setChartReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      setChartReady(false);
      chartRef.current  = null;
      seriesRef.current = null;
      chart.remove();
    };
  }, []);

  // ── Fetch / Load kline data ────────────────────────────────────────────────
  const loadData = useCallback(async (tfLabel) => {
    if (!seriesRef.current || !chartRef.current) return;

    if (!isCrypto) {
      // Simulated chart for Forex / Indices
      const cfg = SIM_BASES[symbol] || { base: 1000, vol: 0.001 };
      const data = generateSimData(cfg.base, cfg.vol, 60);
      seriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
      if (data.length) setPrice(data[data.length - 1].close.toFixed(cfg.base > 1000 ? 1 : cfg.base > 10 ? 2 : 4));
      return;
    }

    const tf = TIMEFRAMES.find(t => t.label === tfLabel);
    if (!tf) return;
    try {
      const res  = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tf.interval}&limit=${tf.limit}`);
      const data = await res.json();
      const candles = data.map(k => ({
        time: k[0] / 1000, open: parseFloat(k[1]), high: parseFloat(k[2]),
        low:  parseFloat(k[3]), close: parseFloat(k[4]),
      }));
      seriesRef.current.setData(candles);
      chartRef.current.timeScale().fitContent();
    } catch (e) { console.error('Klines error:', e); }
  }, [symbol, isCrypto]);

  useEffect(() => { if (chartReady) loadData(activeTimeframe); }, [chartReady, activeTimeframe, loadData]);

  // ── Series type switch ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartReady || !chartRef.current) return;
    try { chartRef.current.removeSeries(seriesRef.current); } catch {}
    if (chartType === 'candle') {
      seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#00c805', downColor: '#ff3b30',
        borderUpColor: '#00c805', borderDownColor: '#ff3b30',
        wickUpColor: '#00c805', wickDownColor: '#ff3b30',
      });
    } else {
      seriesRef.current = chartRef.current.addSeries(AreaSeries, {
        lineColor: '#FFB800', topColor: 'rgba(255,184,0,0.18)', bottomColor: 'rgba(255,184,0,0)', lineWidth: 2,
      });
    }
    loadData(activeTimeframe);
  }, [chartType]); // eslint-disable-line

  // ── Live ticker WS (crypto only) ─────────────────────────────────────────
  useEffect(() => {
    if (!isCrypto) return;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol?.toLowerCase()}@ticker`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.c) return;
      setPrice(parseFloat(d.c).toLocaleString(undefined, { minimumFractionDigits: 2 }));
      const chg = parseFloat(d.P);
      setChange24h(chg.toFixed(2));
      setIsPositive(chg >= 0);
      const vol = parseFloat(d.q);
      setVolume(vol >= 1e9 ? `${(vol/1e9).toFixed(2)}B` : vol >= 1e6 ? `${(vol/1e6).toFixed(0)}M` : vol.toFixed(0));
    };
    return () => { try { ws.close(); } catch {} };
  }, [symbol, isCrypto]);

  // ── Live kline WS (crypto only) ──────────────────────────────────────────
  useEffect(() => {
    if (!isCrypto || !chartReady) return;
    const tf = TIMEFRAMES.find(t => t.label === activeTimeframe);
    if (!tf) return;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol?.toLowerCase()}@kline_${tf.interval}`);
    ws.onmessage = e => {
      const k = JSON.parse(e.data)?.k;
      if (!k || !seriesRef.current) return;
      const upd = { time: k.t/1000, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c) };
      if (chartType === 'area') upd.value = upd.close;
      try { seriesRef.current.update(upd); } catch {}
    };
    return () => { try { ws.close(); } catch {} };
  }, [symbol, activeTimeframe, chartReady, chartType, isCrypto]);

  const estimatedBase = () => {
    const a = parseFloat(amount);
    const p = parseFloat(price.replace(/,/g, ''));
    if (!a || !p) return '0.000000';
    return (a / p).toFixed(6);
  };

  const accentColor = COIN_COLORS[base] || '#FFB800';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 sticky top-0 bg-black z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/markets')} className="p-1 active:scale-90 transition-transform">
            <ChevronLeft size={22} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex-shrink-0"
              style={{ background: `${accentColor}33`, border: `1px solid ${accentColor}66` }} />
            <h2 className="text-sm font-black italic tracking-tighter uppercase">{base} / USDT</h2>
            <div className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-500 border border-white/5 uppercase">
              {isCrypto ? 'Cross 20x' : 'CFD'}
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-gray-600">
          <Share2 size={18} className="cursor-pointer hover:text-gray-300 transition-colors" />
          <Star    size={18} className="cursor-pointer hover:text-yellow-500 transition-colors" />
        </div>
      </div>

      {/* ── Quick Pair Switcher (Crypto only) ── */}
      {isCrypto && (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-white/5 no-scrollbar">
          {QUICK_PAIRS.map(pair => {
            const active  = symbol === pair.symbol;
            const pColor  = COIN_COLORS[pair.label] || '#FFB800';
            return (
              <button
                key={pair.symbol}
                onClick={() => navigate(`/trade/${pair.symbol}`)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                  active
                    ? 'text-black border-transparent'
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
                }`}
                style={active ? { background: pColor, borderColor: pColor } : {}}
              >
                {pair.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Hero Ticker ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-black italic tracking-tighter leading-none">${price}</h1>
          <span className="text-[9px] font-black text-[#00c805] uppercase tracking-[0.2em] animate-pulse">● Live</span>
        </div>
        <div className="flex gap-3 mt-2">
          {isCrypto && (
            <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <Activity size={11} className="text-gray-700" /> Vol: {volume}
            </div>
          )}
          <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border transition-colors ${
            isPositive ? 'text-[#00c805] bg-[#00c805]/10 border-[#00c805]/20' : 'text-[#ff3b30] bg-[#ff3b30]/10 border-[#ff3b30]/20'
          }`}>
            {isPositive ? '+' : ''}{change24h}% 24H
          </div>
        </div>
      </div>

      {/* ── Timeframe + Chart type ── */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf.label} onClick={() => setActiveTimeframe(tf.label)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                activeTimeframe === tf.label ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-500 hover:text-gray-300'
              }`}>{tf.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button onClick={() => setChartType('candle')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'candle' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>
            <CandlestickChart size={14} />
          </button>
          <button onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>
            <TrendingUp size={14} />
          </button>
        </div>
      </div>

      {/* ── Chart ── */}
      <div ref={chartContainerRef} className="w-full bg-black" style={{ height: 360, minHeight: 360 }} />

      {/* Spacer */}
      <div className="h-24" />

      {/* ── Action Buttons ── */}
      {!showOrderCard && (
        <div className="p-4 bg-black border-t border-white/5 grid grid-cols-2 gap-3 fixed bottom-[72px] left-0 right-0 z-40 max-w-md mx-auto">
          <button onClick={() => { setSide('buy'); setShowOrderCard(true); }}
            className="bg-[#00c805] h-14 font-black italic uppercase tracking-widest text-sm rounded-xl active:scale-95 transition-transform shadow-lg shadow-[#00c805]/20">
            Long / Buy
          </button>
          <button onClick={() => { setSide('sell'); setShowOrderCard(true); }}
            className="bg-[#ff3b30] h-14 font-black italic uppercase tracking-widest text-sm rounded-xl active:scale-95 transition-transform shadow-lg shadow-[#ff3b30]/20">
            Short / Sell
          </button>
        </div>
      )}

      {/* ── Order Card ── */}
      {showOrderCard && (
        <div className="fixed inset-x-0 bottom-[72px] z-50 max-w-md mx-auto">
          <div className="bg-[#0D0E10] border-t border-white/10 px-6 pt-5 pb-8 shadow-2xl rounded-t-3xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex gap-5">
                <button onClick={() => setSide('buy')}
                  className={`text-xs font-black uppercase italic pb-1.5 border-b-2 transition-all ${side === 'buy' ? 'text-[#00c805] border-[#00c805]' : 'text-gray-600 border-transparent'}`}>
                  Buy / Long
                </button>
                <button onClick={() => setSide('sell')}
                  className={`text-xs font-black uppercase italic pb-1.5 border-b-2 transition-all ${side === 'sell' ? 'text-[#ff3b30] border-[#ff3b30]' : 'text-gray-600 border-transparent'}`}>
                  Sell / Short
                </button>
              </div>
              <button onClick={() => setShowOrderCard(false)} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Market Price</span>
                <span className="font-black text-sm italic" style={{ color: accentColor }}>${price}</span>
              </div>

              <div className="bg-black border border-white/8 p-4 flex justify-between items-center rounded-2xl focus-within:border-yellow-500/30 transition-colors">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Amount (USDT)</span>
                <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                  className="bg-transparent text-right font-black focus:outline-none text-2xl w-32 text-white italic" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} className="bg-white/5 border border-white/5 py-1.5 rounded-lg text-[10px] font-black text-gray-500 hover:border-yellow-500/30 hover:text-yellow-500 active:scale-95 transition-all">
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Est. {base}</span>
                <span className="text-[11px] font-black tabular-nums">≈ {estimatedBase()} {base}</span>
              </div>

              <button className={`w-full h-14 font-black italic uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] ${
                side === 'buy' ? 'bg-[#00c805] text-black shadow-lg shadow-[#00c805]/20' : 'bg-[#ff3b30] text-white shadow-lg shadow-[#ff3b30]/20'
              }`}>
                {side === 'buy' ? '▲ Open Long Position' : '▼ Open Short Position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
