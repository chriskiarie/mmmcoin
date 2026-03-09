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

const AssetDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [price, setPrice]             = useState('0.00');
  const [change24h, setChange24h]     = useState('0.00');
  const [volume, setVolume]           = useState('—');
  const [isPositive, setIsPositive]   = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [chartType, setChartType]     = useState('candle'); // 'candle' | 'area'
  const [chartReady, setChartReady]   = useState(false);
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [side, setSide]               = useState('buy');
  const [amount, setAmount]           = useState('');

  // Clean symbol display: BTCUSDT → BTC
  const base = symbol?.replace('USDT', '') || '';

  // ─── 1. Chart Initialisation ───────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#555555',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#111111' },
        horzLines: { color: '#111111' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 360,
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderVisible: false },
      handleScale: true,
      handleScroll: true,
      crosshair: {
        vertLine: { color: '#FFB800', width: 1, style: 3, labelBackgroundColor: '#FFB800' },
        horzLine: { color: '#FFB800', width: 1, style: 3, labelBackgroundColor: '#FFB800' },
      },
    });

    // v5 API: chart.addSeries(SeriesClass, options)
    const series = chart.addSeries(CandlestickSeries, {
      upColor:        '#00c805',
      downColor:      '#ff3b30',
      borderUpColor:  '#00c805',
      borderDownColor:'#ff3b30',
      wickUpColor:    '#00c805',
      wickDownColor:  '#ff3b30',
    });

    chartRef.current  = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    setChartReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      setChartReady(false);
      chartRef.current = null;
      seriesRef.current = null;
      chart.remove();
    };
  }, []);

  // ─── 2. Fetch Klines from Binance REST ─────────────────────────────────────
  const fetchKlines = useCallback(async (tfLabel) => {
    if (!seriesRef.current || !chartRef.current) return;
    const tf = TIMEFRAMES.find(t => t.label === tfLabel);
    if (!tf) return;

    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tf.interval}&limit=${tf.limit}`
      );
      if (!res.ok) return;
      const data = await res.json();

      // Rebuild series as candle or area depending on chartType state
      const candles = data.map(k => ({
        time:  k[0] / 1000,
        open:  parseFloat(k[1]),
        high:  parseFloat(k[2]),
        low:   parseFloat(k[3]),
        close: parseFloat(k[4]),
      }));

      seriesRef.current.setData(candles);
      chartRef.current.timeScale().fitContent();
    } catch (e) {
      console.error('Klines fetch error:', e);
    }
  }, [symbol]);

  // Fetch when chart is ready or timeframe changes
  useEffect(() => {
    if (!chartReady) return;
    fetchKlines(activeTimeframe);
  }, [chartReady, activeTimeframe, fetchKlines]);

  // ─── 3. Swap Series Type (Candle ↔ Area) ───────────────────────────────────
  useEffect(() => {
    if (!chartReady || !chartRef.current) return;

    // Remove old series and recreate with new type
    // We re-fetch klines which also calls setData on the new series
    const chart = chartRef.current;

    // Remove existing
    if (seriesRef.current) {
      try { chart.removeSeries(seriesRef.current); } catch {}
    }

    if (chartType === 'candle') {
      seriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: '#00c805', downColor: '#ff3b30',
        borderUpColor: '#00c805', borderDownColor: '#ff3b30',
        wickUpColor: '#00c805', wickDownColor: '#ff3b30',
      });
    } else {
      seriesRef.current = chart.addSeries(AreaSeries, {
        lineColor: '#FFB800',
        topColor: 'rgba(255,184,0,0.18)',
        bottomColor: 'rgba(255,184,0,0)',
        lineWidth: 2,
      });
    }

    fetchKlines(activeTimeframe);
  }, [chartType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 4. WebSocket — Live Ticker (price, 24h change, volume) ───────────────
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol?.toLowerCase()}@ticker`
    );
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.c) {
        setPrice(parseFloat(d.c).toLocaleString(undefined, { minimumFractionDigits: 2 }));
        const chg = parseFloat(d.P);
        setChange24h(chg.toFixed(2));
        setIsPositive(chg >= 0);
        const vol = parseFloat(d.q); // quote asset volume (USDT)
        setVolume(
          vol >= 1e9 ? `${(vol / 1e9).toFixed(2)}B` :
          vol >= 1e6 ? `${(vol / 1e6).toFixed(0)}M` : vol.toFixed(0)
        );
      }
    };
    return () => { try { ws.close(); } catch {} };
  }, [symbol]);

  // ─── 5. WebSocket — Live Kline Updates ─────────────────────────────────────
  useEffect(() => {
    const tf = TIMEFRAMES.find(t => t.label === activeTimeframe);
    if (!tf || !chartReady) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol?.toLowerCase()}@kline_${tf.interval}`
    );
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.k && seriesRef.current) {
        const k = d.k;
        const update = {
          time:  k.t / 1000,
          open:  parseFloat(k.o),
          high:  parseFloat(k.h),
          low:   parseFloat(k.l),
          close: parseFloat(k.c),
        };
        // Area series needs { time, value }
        if (chartType === 'area') update.value = update.close;
        try { seriesRef.current.update(update); } catch {}
      }
    };
    return () => { try { ws.close(); } catch {} };
  }, [symbol, activeTimeframe, chartReady, chartType]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const estimatedBase = () => {
    const a = parseFloat(amount);
    const p = parseFloat(price.replace(/,/g, ''));
    if (!a || !p) return '0.000000';
    return (a / p).toFixed(6);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 sticky top-0 bg-black z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/markets')} className="p-1 active:scale-90 transition-transform">
            <ChevronLeft className="text-gray-500" size={22} />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black italic tracking-tighter uppercase">{base} / USDT</h2>
            <div className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-500 border border-white/5 uppercase">Cross 20x</div>
          </div>
        </div>
        <div className="flex gap-4 text-gray-600">
          <Share2 size={18} className="cursor-pointer hover:text-gray-400 transition-colors" />
          <Star size={18} className="cursor-pointer hover:text-yellow-500 transition-colors" />
        </div>
      </div>

      {/* ── Hero Ticker ── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-black italic tracking-tighter leading-none">${price}</h1>
          <span className="text-[9px] font-black text-[#00c805] uppercase tracking-[0.2em] animate-pulse">● Live</span>
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <Activity size={11} className="text-gray-700" />
            Vol: {volume}
          </div>
          <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border transition-colors ${
            isPositive
              ? 'text-[#00c805] bg-[#00c805]/10 border-[#00c805]/20'
              : 'text-[#ff3b30] bg-[#ff3b30]/10 border-[#ff3b30]/20'
          }`}>
            {isPositive ? '+' : ''}{change24h}% 24H
          </div>
        </div>
      </div>

      {/* ── Timeframe + Chart Type ── */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.label}
              onClick={() => setActiveTimeframe(tf.label)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                activeTimeframe === tf.label
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setChartType('candle')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'candle' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
            title="Candlestick"
          >
            <CandlestickChart size={14} />
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
            title="Area"
          >
            <TrendingUp size={14} />
          </button>
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        ref={chartContainerRef}
        className="w-full bg-black"
        style={{ height: '360px', minHeight: '360px' }}
      />

      {/* ── Spacer so buttons don't cover chart ── */}
      <div className="h-24" />

      {/* ── Action Buttons ── */}
      {!showOrderCard && (
        <div className="p-4 bg-black border-t border-white/5 grid grid-cols-2 gap-3 fixed bottom-[72px] left-0 right-0 z-40 max-w-md mx-auto">
          <button
            onClick={() => { setSide('buy'); setShowOrderCard(true); }}
            className="bg-[#00c805] h-14 font-black italic uppercase tracking-widest text-sm rounded-xl active:scale-95 transition-transform shadow-lg shadow-[#00c805]/20"
          >
            Long / Buy
          </button>
          <button
            onClick={() => { setSide('sell'); setShowOrderCard(true); }}
            className="bg-[#ff3b30] h-14 font-black italic uppercase tracking-widest text-sm rounded-xl active:scale-95 transition-transform shadow-lg shadow-[#ff3b30]/20"
          >
            Short / Sell
          </button>
        </div>
      )}

      {/* ── Order Card ── */}
      {showOrderCard && (
        <div className="fixed inset-x-0 bottom-[72px] z-50 max-w-md mx-auto">
          <div className="bg-[#0D0E10] border-t border-white/10 px-6 pt-6 pb-8 shadow-2xl rounded-t-3xl">

            {/* Header row */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex gap-6">
                <button
                  onClick={() => setSide('buy')}
                  className={`text-xs font-black uppercase italic pb-1.5 transition-all ${
                    side === 'buy' ? 'text-[#00c805] border-b-2 border-[#00c805]' : 'text-gray-600'
                  }`}
                >
                  Market Buy
                </button>
                <button
                  onClick={() => setSide('sell')}
                  className={`text-xs font-black uppercase italic pb-1.5 transition-all ${
                    side === 'sell' ? 'text-[#ff3b30] border-b-2 border-[#ff3b30]' : 'text-gray-600'
                  }`}
                >
                  Market Sell
                </button>
              </div>
              <button onClick={() => setShowOrderCard(false)} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X className="text-gray-400" size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Market price */}
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Market Price</span>
                <span className="font-black text-sm text-yellow-500 italic">${price}</span>
              </div>

              {/* Amount input */}
              <div className="bg-black border border-white/8 p-4 flex justify-between items-center rounded-2xl focus-within:border-yellow-500/40 transition-colors">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Amount (USDT)</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="bg-transparent text-right font-black focus:outline-none text-2xl w-32 text-white italic"
                />
              </div>

              {/* Quick % buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    className="bg-white/5 border border-white/5 py-1.5 rounded-lg text-[10px] font-black text-gray-500 hover:border-yellow-500/40 hover:text-yellow-500 active:scale-95 transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Estimated amount */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Est. {base}</span>
                <span className="text-[11px] font-black text-white tabular-nums">≈ {estimatedBase()} {base}</span>
              </div>

              {/* Confirm button */}
              <button
                className={`w-full h-14 font-black italic uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] ${
                  side === 'buy'
                    ? 'bg-[#00c805] text-black shadow-lg shadow-[#00c805]/20'
                    : 'bg-[#ff3b30] text-white shadow-lg shadow-[#ff3b30]/20'
                }`}
              >
                {side === 'buy' ? '⬆ Open Long Position' : '⬇ Open Short Position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
