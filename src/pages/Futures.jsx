import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';
import { ChevronDown, X, Zap, Activity, TrendingUp, TrendingDown, BarChart2, Info } from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

const CONTRACTS = [
  { symbol: 'BTCUSDT', label: 'BTC-PERP', color: '#F7931A' },
  { symbol: 'ETHUSDT', label: 'ETH-PERP', color: '#627EEA' },
  { symbol: 'SOLUSDT', label: 'SOL-PERP', color: '#9945FF' },
  { symbol: 'BNBUSDT', label: 'BNB-PERP', color: '#F3BA2F' },
];

const LEVERAGES = [5, 10, 20, 50, 100, 125];

function CoinIcon({ ticker, color, size = 22 }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="rounded-full flex items-center justify-center font-black text-[9px]"
      style={{ width: size, height: size, background: `${color}25`, color }}>
      {ticker?.toUpperCase()?.slice(0,3)}
    </div>
  );
  return (
    <img src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker?.toLowerCase()}.png`}
      alt={ticker} onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0" style={{ width: size, height: size }} />
  );
}

export default function Futures() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const css = usePageBg();
  const isDark = theme === 'dark';
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const seriesRef = useRef(null);

  const [contract,    setContract]    = useState(CONTRACTS[0]);
  const [leverage,    setLeverage]    = useState(20);
  const [showContracts, setShowContracts] = useState(false);
  const [showLeverage,  setShowLeverage]  = useState(false);
  const [side,        setSide]        = useState('long');
  const [amount,      setAmount]      = useState('');
  const [price,       setPrice]       = useState('—');
  const [markPrice,   setMarkPrice]   = useState('—');
  const [change24h,   setChange24h]   = useState('0.00');
  const [isPositive,  setIsPositive]  = useState(true);
  const [fundingRate, setFundingRate] = useState('0.0100');
  const [volume,      setVolume]      = useState('—');
  const [positions,   setPositions]   = useState([]);
  const [activeTab,   setActiveTab]   = useState('positions');
  const [chartReady,  setChartReady]  = useState(false);
  const [orderCount,  setOrderCount]  = useState(0); // track orders placed

  const ticker = contract.symbol.replace('USDT', '').toLowerCase();

  // ── Chart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: isDark ? '#000000' : '#ffffff' }, textColor: '#666', fontSize: 10 },
      grid:   { vertLines: { color: isDark ? '#111' : '#f0f0f0' }, horzLines: { color: isDark ? '#111' : '#f0f0f0' } },
      width:  chartContainerRef.current.clientWidth,
      height: 240,
      timeScale: { borderVisible: false, timeVisible: true },
      rightPriceScale: { borderVisible: false },
      crosshair: {
        vertLine: { color: '#FFB800', labelBackgroundColor: '#FFB800' },
        horzLine: { color: '#FFB800', labelBackgroundColor: '#FFB800' },
      },
    });

    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#00c805', downColor: '#ff3b30',
      borderUpColor: '#00c805', borderDownColor: '#ff3b30',
      wickUpColor: '#00c805', wickDownColor: '#ff3b30',
    });
    chartRef.current = chart;

    const onResize = () => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    setChartReady(true);
    return () => {
      window.removeEventListener('resize', onResize);
      setChartReady(false);
      chartRef.current = null;
      seriesRef.current = null;
      chart.remove();
    };
  }, [isDark]);

  // ── Fetch klines from Binance Futures API ──────────────────────────────
  useEffect(() => {
    if (!chartReady || !seriesRef.current) return;
    const fetchKlines = async () => {
      try {
        const res = await fetch(
          `https://fapi.binance.com/fapi/v1/klines?symbol=${contract.symbol}&interval=1h&limit=60`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const candles = data.map(k => ({
          time: k[0]/1000, open: +k[1], high: +k[2], low: +k[3], close: +k[4],
        }));
        seriesRef.current.setData(candles);
        chartRef.current?.timeScale().fitContent();
      } catch {
        // fallback: spot klines
        try {
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${contract.symbol}&interval=1h&limit=60`);
          const data = await res.json();
          seriesRef.current.setData(data.map(k => ({ time: k[0]/1000, open: +k[1], high: +k[2], low: +k[3], close: +k[4] })));
          chartRef.current?.timeScale().fitContent();
        } catch {}
      }
    };
    fetchKlines();
  }, [chartReady, contract]);

  // ── Live ticker ────────────────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${contract.symbol.toLowerCase()}@ticker`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.c) return;
      const p = parseFloat(d.c), chg = parseFloat(d.P);
      setPrice(p.toLocaleString(undefined, { minimumFractionDigits: 2 }));
      setMarkPrice(p.toLocaleString(undefined, { minimumFractionDigits: 2 }));
      setChange24h(Math.abs(chg).toFixed(2));
      setIsPositive(chg >= 0);
      const vol = parseFloat(d.q);
      setVolume(vol >= 1e9 ? `${(vol/1e9).toFixed(2)}B` : vol >= 1e6 ? `${(vol/1e6).toFixed(0)}M` : '—');
    };
    setPrice('—'); setMarkPrice('—'); setChange24h('0.00');
    return () => { try { ws.close(); } catch {} };
  }, [contract]);

  // ── Simulated funding rate ─────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const base = 0.01 + (Math.random() - 0.5) * 0.005;
      setFundingRate(base.toFixed(4));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // ── Place order ────────────────────────────────────────────────────────
  const placeOrder = () => {
    const rawPrice = parseFloat(price.replace(/,/g, ''));
    const amt = parseFloat(amount);
    if (!amt || !rawPrice) return;
    const pos = {
      id:        Date.now(),
      symbol:    contract.label,
      side,
      size:      amt,
      leverage,
      entry:     rawPrice,
      markPrice: rawPrice,
      pnl:       0,
      pnlPct:    0,
      margin:    parseFloat((amt / leverage).toFixed(2)),
      color:     contract.color,
      ticker,
    };
    setPositions(p => [pos, ...p]);
    setAmount('');
    setActiveTab('positions');
    setOrderCount(c => c + 1);
  };

  // Simulate P&L drift on positions
  useEffect(() => {
    const id = setInterval(() => {
      const rawP = parseFloat(price.replace(/,/g, '')) || 0;
      if (!rawP) return;
      setPositions(prev => prev.map(pos => {
        const drift = (Math.random() - 0.495) * 0.001 * pos.entry;
        const newMark = pos.markPrice + drift;
        const mult = pos.side === 'long' ? 1 : -1;
        const pnl = parseFloat(((newMark - pos.entry) / pos.entry * pos.size * mult).toFixed(2));
        const pnlPct = parseFloat(((pnl / pos.margin) * 100).toFixed(2));
        return { ...pos, markPrice: parseFloat(newMark.toFixed(2)), pnl, pnlPct };
      }));
    }, 1500);
    return () => clearInterval(id);
  }, [price]);

  const est = () => {
    const a = parseFloat(amount), p = parseFloat(price.replace(/,/g,''));
    if (!a || !p) return '0';
    return (a / p).toFixed(6);
  };

  const bgPage = isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const bgCard = isDark ? 'bg-[#0b0e11] border-white/5' : 'bg-white border-gray-200';
  const bgAlt  = isDark ? 'bg-white/[0.025] border-white/5' : 'bg-gray-50 border-gray-200';
  const textSub = isDark ? 'text-gray-500' : 'text-gray-500';
  const inputCls = isDark ? 'bg-black/80 border-white/8 text-white' : 'bg-gray-100 border-gray-200 text-gray-900';

  return (
    <div className={`min-h-screen pb-24 font-sans ${bgPage}`}>

      {/* ── Header ── */}
      <div className={`px-4 pt-4 pb-0 sticky top-0 z-20 border-b ${isDark ? 'bg-black border-gray-900' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          {/* Contract selector */}
          <button onClick={() => setShowContracts(c => !c)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${bgAlt}`}>
            <CoinIcon ticker={ticker} color={contract.color} size={20} />
            <div className="text-left">
              <p className="text-sm font-black italic tracking-tight">{contract.label}</p>
              <p className={`text-[8px] uppercase tracking-widest font-bold ${textSub}`}>Perpetual</p>
            </div>
            <ChevronDown size={14} className={`${textSub} transition-transform ${showContracts ? 'rotate-180' : ''}`} />
          </button>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-black italic tracking-tighter leading-none">${price}</p>
              <p className={`text-[9px] font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : '-'}{change24h}%
              </p>
            </div>
            <div className={`px-2 py-1 rounded-lg border ${isPositive ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '▲' : '▼'} {change24h}%
              </span>
            </div>
          </div>
        </div>

        {/* Contract dropdown */}
        {showContracts && (
          <div className={`absolute left-4 top-16 rounded-2xl border shadow-2xl overflow-hidden z-50 w-56 ${bgCard}`}>
            {CONTRACTS.map(c => (
              <button key={c.symbol} onClick={() => { setContract(c); setShowContracts(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 transition-colors text-left ${
                  isDark ? 'border-white/5 hover:bg-white/[0.04]' : 'border-gray-100 hover:bg-gray-50'
                } ${contract.symbol === c.symbol ? isDark ? 'bg-yellow-500/5' : 'bg-yellow-50' : ''}`}>
                <CoinIcon ticker={c.symbol.replace('USDT','').toLowerCase()} color={c.color} size={24} />
                <div>
                  <p className="text-sm font-black italic">{c.label}</p>
                  <p className={`text-[9px] font-bold ${textSub}`}>Perpetual</p>
                </div>
                {contract.symbol === c.symbol && <span className="ml-auto text-yellow-500 font-black text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Stats strip */}
        <div className={`flex gap-5 pb-2.5 text-[10px] font-bold border-t pt-2 mt-1 overflow-x-auto ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <span className={textSub}>Mark <strong className={isDark ? 'text-white' : 'text-gray-900'}>${markPrice}</strong></span>
          <span className={textSub}>Vol <strong className={isDark ? 'text-white' : 'text-gray-900'}>{volume}</strong></span>
          <span className={textSub}>Funding <strong className="text-green-400">{fundingRate}%</strong></span>
          <span className={textSub}>Liq Rate <strong className="text-red-400">—</strong></span>
        </div>
      </div>

      {/* ── Chart ── */}
      <div ref={chartContainerRef} className="w-full" style={{ height: 240 }} />

      {/* ── Order Panel ── */}
      <div className="px-4 py-4 space-y-3">

        {/* Long / Short toggle */}
        <div className={`grid grid-cols-2 rounded-2xl p-1 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          <button onClick={() => setSide('long')}
            className={`py-3 rounded-xl font-black italic uppercase tracking-widest text-sm transition-all ${
              side === 'long' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : `${textSub}`
            }`}>
            Long / Buy
          </button>
          <button onClick={() => setSide('short')}
            className={`py-3 rounded-xl font-black italic uppercase tracking-widest text-sm transition-all ${
              side === 'short' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : `${textSub}`
            }`}>
            Short / Sell
          </button>
        </div>

        {/* Leverage selector */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${textSub}`}>Leverage</span>
            <button onClick={() => setShowLeverage(l => !l)}
              className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/25 px-3 py-1.5 rounded-xl text-[10px] font-black text-yellow-500 uppercase active:scale-95 transition-all">
              {leverage}x <ChevronDown size={11} className={`transition-transform ${showLeverage ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {showLeverage && (
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {LEVERAGES.map(lev => (
                <button key={lev} onClick={() => { setLeverage(lev); setShowLeverage(false); }}
                  className={`py-2 rounded-lg text-[10px] font-black border transition-all active:scale-95 ${
                    leverage === lev
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : `border-transparent ${bgAlt} ${textSub}`
                  }`}>{lev}x</button>
              ))}
            </div>
          )}
        </div>

        {/* Amount input */}
        <div className={`rounded-2xl border p-4 flex justify-between items-center focus-within:border-yellow-500/35 transition-colors ${inputCls}`}>
          <span className={`text-[9px] font-black uppercase tracking-widest ${textSub}`}>Margin (USDT)</span>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
            className="bg-transparent text-right font-black focus:outline-none text-xl w-28 italic" />
        </div>

        {/* Quick % */}
        <div className="grid grid-cols-4 gap-1.5">
          {[10, 25, 50, 100].map(p => (
            <button key={p} className={`py-1.5 rounded-lg text-[9px] font-black border transition-all active:scale-95 ${bgAlt} ${textSub} hover:border-yellow-500/30 hover:text-yellow-500`}>
              {p}%
            </button>
          ))}
        </div>

        {/* Info row */}
        {amount && (
          <div className={`rounded-xl border p-3 grid grid-cols-2 gap-3 ${bgAlt}`}>
            <div>
              <p className={`text-[8px] uppercase font-black mb-0.5 ${textSub}`}>Position Size</p>
              <p className="text-xs font-black">{(parseFloat(amount || 0) * leverage).toFixed(2)} USDT</p>
            </div>
            <div>
              <p className={`text-[8px] uppercase font-black mb-0.5 ${textSub}`}>Est. {contract.symbol.replace('USDT','')}</p>
              <p className="text-xs font-black">≈ {est()}</p>
            </div>
          </div>
        )}

        {/* Place order */}
        <button onClick={placeOrder} disabled={!amount || !parseFloat(amount)}
          className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-widest text-sm active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg ${
            side === 'long'
              ? 'bg-green-500 text-black shadow-green-500/20'
              : 'bg-red-500 text-white shadow-red-500/20'
          }`}>
          {side === 'long' ? '▲ Open Long' : '▼ Open Short'} {leverage}x
        </button>

      </div>

      {/* ── Positions / Orders tabs ── */}
      <div className={`mx-4 rounded-3xl border overflow-hidden ${bgCard}`}>
        <div className={`flex border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          {['positions','orders'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === t ? 'text-yellow-500 border-yellow-500' : `${textSub} border-transparent`
              }`}>
              {t}
              {t === 'positions' && positions.length > 0 && (
                <span className="ml-1.5 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">{positions.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'positions' && (
          <div>
            {positions.length === 0 ? (
              <div className={`py-12 text-center text-[10px] font-black uppercase tracking-widest ${textSub}`}>
                No open positions
              </div>
            ) : positions.map(pos => (
              <div key={pos.id} className={`p-4 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CoinIcon ticker={pos.ticker} color={pos.color} size={20} />
                    <span className="text-xs font-black italic">{pos.symbol}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      pos.side === 'long' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                    }`}>{pos.side} {pos.leverage}x</span>
                  </div>
                  <button onClick={() => setPositions(p => p.filter(x => x.id !== pos.id))}
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-colors ${
                      isDark ? 'border-white/10 text-gray-500 hover:border-red-500/40 hover:text-red-400' : 'border-gray-200 text-gray-400 hover:border-red-300'
                    }`}>Close</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className={`text-[8px] uppercase font-black ${textSub}`}>Entry</p>
                    <p className="text-[11px] font-black">${pos.entry.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                  </div>
                  <div>
                    <p className={`text-[8px] uppercase font-black ${textSub}`}>Mark</p>
                    <p className="text-[11px] font-black">${pos.markPrice.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[8px] uppercase font-black ${textSub}`}>PnL</p>
                    <p className={`text-[11px] font-black ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} ({pos.pnlPct.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className={`py-12 text-center text-[10px] font-black uppercase tracking-widest ${textSub}`}>
            No pending orders
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
