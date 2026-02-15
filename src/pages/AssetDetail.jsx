import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import { ChevronLeft, Share2, Star, X, Activity } from 'lucide-react';

const AssetDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [side, setSide] = useState('buy'); 
  const [price, setPrice] = useState('0.00');

  // 1. WebSocket for Live Price
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol?.toLowerCase()}@ticker`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.c) setPrice(parseFloat(data.c).toLocaleString(undefined, { minimumFractionDigits: 2 }));
    };
    return () => { if (ws.readyState === 1) ws.close(); };
  }, [symbol]);

  // 2. The Final Chart Fix
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Force clear the container in case of hot-reloads
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { 
        background: { type: ColorType.Solid, color: '#000000' }, 
        textColor: '#707070',
        fontSize: 11,
      },
      grid: { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
      width: chartContainerRef.current.clientWidth,
      height: 450, // Fixed height for visibility
      timeScale: { borderVisible: false, timeVisible: true },
      rightPriceScale: { borderVisible: false },
      handleScale: true,
      handleScroll: true,
    });

    // Safety: Ensure chart exists before adding series
    if (chart && typeof chart.addAreaSeries === 'function') {
      const areaSeries = chart.addAreaSeries({
        lineColor: '#FFB800',
        topColor: 'rgba(255, 184, 0, 0.15)',
        bottomColor: 'rgba(255, 184, 0, 0)',
        lineWidth: 2,
      });

      // Essential mock data to draw the line immediately
      areaSeries.setData([
        { time: '2026-02-10', value: 68200 },
        { time: '2026-02-11', value: 69100 },
        { time: '2026-02-12', value: 67500 },
        { time: '2026-02-13', value: 70200 },
        { time: '2026-02-14', value: 68900 },
        { time: '2026-02-15', value: 69500 },
        { time: '2026-02-16', value: 69007 },
      ]);
      
      chart.timeScale().fitContent();
      chartRef.current = chart;
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Precision Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 sticky top-0 bg-black z-50">
        <div className="flex items-center gap-4">
          <ChevronLeft className="text-gray-500" onClick={() => navigate('/markets')} />
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black italic tracking-tighter uppercase">{symbol} / USDT</h2>
            <div className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-500 border border-white/5 uppercase">Cross 20x</div>
          </div>
        </div>
        <div className="flex gap-4 text-gray-600"><Share2 size={18} /><Star size={18} /></div>
      </div>

      {/* Hero Ticker */}
      <div className="px-5 py-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-5xl font-black italic tracking-tighter leading-none">${price}</h1>
          <span className="text-[10px] font-black text-[#00c805] uppercase tracking-widest">Live</span>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <Activity size={12} className="text-gray-700" /> Vol: 2.1B
          </div>
          <div className="text-[10px] font-black text-[#ff3b30] uppercase tracking-widest bg-[#ff3b30]/10 px-2 py-0.5 border border-[#ff3b30]/20">
            -1.32% 24H
          </div>
        </div>
      </div>

      {/* Chart Terminal - Forced Height and Overflow */}
      <div 
        className="flex-1 w-full bg-black relative overflow-hidden min-h-[450px]" 
        ref={chartContainerRef} 
      />

      {/* Exposed Action UI */}
      {!showOrderCard && (
        <div className="p-4 bg-black border-t border-white/5 grid grid-cols-2 gap-3 fixed bottom-20 left-0 right-0 z-40 max-w-md mx-auto">
          <button 
            onClick={() => { setSide('buy'); setShowOrderCard(true); }}
            className="bg-[#00c805] h-14 font-black italic uppercase tracking-widest text-sm rounded-xl"
          >
            Long / Buy
          </button>
          <button 
            onClick={() => { setSide('sell'); setShowOrderCard(true); }}
            className="bg-[#ff3b30] h-14 font-black italic uppercase tracking-widest text-sm rounded-xl"
          >
            Short / Sell
          </button>
        </div>
      )}

      {/* Floating Order Card */}
      {showOrderCard && (
        <div className="fixed inset-x-0 bottom-20 z-50 animate-in slide-in-from-bottom max-w-md mx-auto">
          <div className="bg-[#0D0E10] border-t border-white/10 p-6 shadow-2xl rounded-t-3xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-6">
                <button onClick={() => setSide('buy')} className={`text-xs font-black uppercase italic pb-1 ${side === 'buy' ? 'text-[#00c805] border-b-2 border-[#00c805]' : 'text-gray-700'}`}>Market Buy</button>
                <button onClick={() => setSide('sell')} className={`text-xs font-black uppercase italic pb-1 ${side === 'sell' ? 'text-[#ff3b30] border-b-2 border-[#ff3b30]' : 'text-gray-700'}`}>Market Sell</button>
              </div>
              <X className="text-gray-500" onClick={() => setShowOrderCard(false)} />
            </div>

            <div className="space-y-4">
              <div className="bg-black border border-white/5 p-4 flex justify-between items-center rounded-xl">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Amount (USDT)</span>
                <input type="number" placeholder="0.00" className="bg-transparent text-right font-black focus:outline-none text-2xl w-32 text-white italic" />
              </div>
              <button className={`w-full h-16 font-black italic uppercase tracking-widest rounded-xl ${side === 'buy' ? 'bg-[#00c805] text-black' : 'bg-[#ff3b30] text-white'}`}>
                Confirm {side} Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;