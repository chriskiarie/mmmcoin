import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

// ─── Static Data ───────────────────────────────────────────────────────────────

const CRYPTO_COINS = [
  { id: 'btc',  name: 'Bitcoin',   symbol: 'BTCUSDT',  ticker: 'btc'  },
  { id: 'eth',  name: 'Ethereum',  symbol: 'ETHUSDT',  ticker: 'eth'  },
  { id: 'sol',  name: 'Solana',    symbol: 'SOLUSDT',  ticker: 'sol'  },
  { id: 'bnb',  name: 'BNB',       symbol: 'BNBUSDT',  ticker: 'bnb'  },
  { id: 'xrp',  name: 'XRP',       symbol: 'XRPUSDT',  ticker: 'xrp'  },
  { id: 'ada',  name: 'Cardano',   symbol: 'ADAUSDT',  ticker: 'ada'  },
  { id: 'doge', name: 'Dogecoin',  symbol: 'DOGEUSDT', ticker: 'doge' },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAXUSDT', ticker: 'avax' },
  { id: 'link', name: 'Chainlink', symbol: 'LINKUSDT', ticker: 'link' },
  { id: 'dot',  name: 'Polkadot',  symbol: 'DOTUSDT',  ticker: 'dot'  },
];

const FOREX_PAIRS = [
  { id: 'eurusd', name: 'Euro / US Dollar',        symbol: 'EUR/USD', base: 'eu', quote: 'us', price: 1.0842, change:  0.12, spread: '0.8' },
  { id: 'gbpusd', name: 'Pound / US Dollar',        symbol: 'GBP/USD', base: 'gb', quote: 'us', price: 1.2643, change: -0.08, spread: '1.0' },
  { id: 'usdjpy', name: 'Dollar / Japanese Yen',    symbol: 'USD/JPY', base: 'us', quote: 'jp', price: 149.82, change:  0.24, spread: '0.9' },
  { id: 'audusd', name: 'Australian Dollar / USD',  symbol: 'AUD/USD', base: 'au', quote: 'us', price: 0.6521, change: -0.15, spread: '1.1' },
  { id: 'usdcad', name: 'Dollar / Canadian Dollar', symbol: 'USD/CAD', base: 'us', quote: 'ca', price: 1.3642, change:  0.07, spread: '1.2' },
  { id: 'usdchf', name: 'Dollar / Swiss Franc',     symbol: 'USD/CHF', base: 'us', quote: 'ch', price: 0.9012, change: -0.03, spread: '0.9' },
  { id: 'nzdusd', name: 'NZD / US Dollar',          symbol: 'NZD/USD', base: 'nz', quote: 'us', price: 0.5983, change:  0.10, spread: '1.3' },
  { id: 'eurjpy', name: 'Euro / Japanese Yen',      symbol: 'EUR/JPY', base: 'eu', quote: 'jp', price: 162.45, change:  0.34, spread: '1.0' },
];

const INDICES = [
  { id: 'spx',    name: 'S&P 500',     symbol: 'SPX500', price: 5842.50, change:  0.68, icon: '🇺🇸', color: '#4facfe' },
  { id: 'nas',    name: 'NASDAQ 100',  symbol: 'NAS100', price: 20453.2, change:  1.24, icon: '📈',  color: '#6c63ff' },
  { id: 'dow',    name: 'Dow Jones',   symbol: 'DJI30',  price: 42891.0, change:  0.45, icon: '🏛',  color: '#43e97b' },
  { id: 'dax',    name: 'DAX 40',      symbol: 'DAX40',  price: 18423.8, change:  0.82, icon: '🇩🇪', color: '#f5af19' },
  { id: 'gold',   name: 'Gold',         symbol: 'XAUUSD', price: 2042.30, change:  0.32, icon: '🥇',  color: '#FFB800' },
  { id: 'oil',    name: 'Crude Oil',    symbol: 'WTIUSD', price: 78.450,  change: -1.20, icon: '🛢',  color: '#ff6b35' },
  { id: 'silver', name: 'Silver',       symbol: 'XAGUSD', price: 22.840,  change:  0.18, icon: '🪙',  color: '#c0c0c0' },
];

const COIN_COLORS = {
  btc: '#F7931A', eth: '#627EEA', sol: '#9945FF', bnb: '#F3BA2F',
  xrp: '#346AA9', ada: '#0033AD', doge: '#C2A633', avax: '#E84142',
  link: '#2A5ADA', dot: '#E6007A',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function useLiveSimulation(initial) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => prev.map(item => {
        const drift   = (Math.random() - 0.499) * 0.0008 * item.price;
        const digits  = item.price < 10 ? 4 : item.price < 100 ? 3 : item.price < 10000 ? 2 : 1;
        const newPrice = parseFloat((item.price + drift).toFixed(digits));
        const newChg  = parseFloat((item.change + (Math.random() - 0.499) * 0.02).toFixed(2));
        return { ...item, price: newPrice, change: newChg };
      }));
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return data;
}

function CryptoIcon({ ticker }) {
  const [err, setErr] = useState(false);
  const color = COIN_COLORS[ticker] || '#FFB800';
  const src   = `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker}.png`;
  if (err) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[9px] uppercase flex-shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
        {ticker.slice(0, 3)}
      </div>
    );
  }
  return (
    <img src={src} alt={ticker} onError={() => setErr(true)}
      className="w-9 h-9 rounded-full flex-shrink-0 object-contain bg-gray-900 p-0.5" />
  );
}

function ForexIcon({ base, quote }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 44, height: 32 }}>
      <img src={`https://flagcdn.com/w40/${base}.png`} alt={base}
        className="w-8 h-8 rounded-full object-cover border border-white/10 absolute left-0 top-0" />
      <img src={`https://flagcdn.com/w40/${quote}.png`} alt={quote}
        className="w-6 h-6 rounded-full object-cover border-2 border-black absolute right-0 bottom-0" />
    </div>
  );
}

function ChangeBadge({ change }) {
  const pos = parseFloat(change) >= 0;
  return (
    <div className={`px-2 py-1 rounded text-[11px] font-bold min-w-[60px] text-center tabular-nums ${
      pos ? 'bg-[#00c80515] text-[#00c805]' : 'bg-[#ff3b3015] text-[#ff3b30]'}`}>
      {pos ? '+' : ''}{change}%
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

const Markets = () => {
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState('Crypto');
  const [showSearch,  setShowSearch]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Live crypto via Binance WS
  const [cryptoData, setCryptoData] = useState(
    CRYPTO_COINS.map(c => ({ ...c, price: '—', change: '0', status: '' }))
  );
  useEffect(() => {
    const streams = CRYPTO_COINS.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.s) return;
      const newP = parseFloat(d.c);
      setCryptoData(prev => prev.map(coin => {
        if (coin.symbol !== d.s) return coin;
        const oldP = parseFloat((coin.price + '').replace(/,/g, '')) || 0;
        return {
          ...coin,
          price:  newP.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: parseFloat(d.P).toFixed(2),
          status: newP > oldP ? 'up' : newP < oldP ? 'down' : '',
        };
      }));
      setTimeout(() => setCryptoData(p => p.map(c => c.symbol === d.s ? { ...c, status: '' } : c)), 400);
    };
    return () => { try { ws.close(); } catch {} };
  }, []);

  // Simulated live for Forex + Indices
  const forexData   = useLiveSimulation(FOREX_PAIRS);
  const indicesData = useLiveSimulation(INDICES);

  const q = searchQuery.toLowerCase();
  const filter = item => !q || item.name.toLowerCase().includes(q) || item.symbol.toLowerCase().includes(q);

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      <style>{`
        @keyframes fG{0%{background:rgba(0,200,5,.28)}100%{background:transparent}}
        @keyframes fR{0%{background:rgba(255,59,48,.28)}100%{background:transparent}}
        .fu{animation:fG .4s ease-out} .fd{animation:fR .4s ease-out}
      `}</style>

      {/* Header */}
      <div className="px-4 pt-5 sticky top-0 bg-black z-20 border-b border-gray-900">
        <div className="flex items-center justify-between mb-4">
          {showSearch ? (
            <div className="flex items-center gap-2 flex-1">
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-yellow-500/40 text-white placeholder-gray-600" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-gray-500 p-1.5"><X size={18} /></button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Markets</h1>
              <button onClick={() => setShowSearch(true)} className="text-gray-500 hover:text-white p-1 transition-colors"><Search size={20} /></button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex">
          {['Crypto', 'Forex', 'Indices'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 pr-7 text-sm font-black uppercase tracking-tight border-b-2 transition-all ${
                activeTab === tab ? 'text-[#FFB800] border-[#FFB800]' : 'text-gray-600 border-transparent hover:text-gray-400'
              }`}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 px-5 py-2 text-[9px] uppercase font-bold text-gray-700 border-b border-gray-900/80 bg-black/50">
        <div className="col-span-6">Instrument</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-3 text-right">24h Change</div>
      </div>

      {/* ── CRYPTO ── */}
      {activeTab === 'Crypto' && (
        <div className="divide-y divide-gray-900/50">
          {cryptoData.filter(filter).map(coin => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)}
              className={`grid grid-cols-12 px-5 py-4 items-center cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.07] transition-colors ${
                coin.status === 'up' ? 'fu' : coin.status === 'down' ? 'fd' : ''
              }`}>
              <div className="col-span-6 flex items-center gap-3">
                <CryptoIcon ticker={coin.ticker} />
                <div>
                  <div className="text-sm font-bold leading-none mb-1">{coin.symbol.replace('USDT', '')}</div>
                  <div className="text-[10px] text-gray-600">{coin.name}</div>
                </div>
              </div>
              <div className="col-span-3 text-right text-sm font-bold tabular-nums">${coin.price}</div>
              <div className="col-span-3 flex justify-end"><ChangeBadge change={coin.change} /></div>
            </div>
          ))}
        </div>
      )}

      {/* ── FOREX ── */}
      {activeTab === 'Forex' && (
        <div className="divide-y divide-gray-900/50">
          <div className="px-5 py-2.5 bg-blue-500/5 border-b border-blue-500/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/80">
              Simulated FX · Spreads from 0.8 pips · 24/5 Market Hours
            </span>
          </div>
          {forexData.filter(filter).map(pair => (
            <div key={pair.id} onClick={() => navigate(`/trade/FX_${pair.id.toUpperCase()}`)}
              className="grid grid-cols-12 px-5 py-4 items-center cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.07] transition-colors">
              <div className="col-span-6 flex items-center gap-3">
                <ForexIcon base={pair.base} quote={pair.quote} />
                <div>
                  <div className="text-sm font-bold leading-none mb-1">{pair.symbol}</div>
                  <div className="text-[10px] text-gray-600">Spread: {pair.spread} pip</div>
                </div>
              </div>
              <div className="col-span-3 text-right text-sm font-bold tabular-nums">
                {pair.price.toFixed(pair.price > 10 ? 2 : 4)}
              </div>
              <div className="col-span-3 flex justify-end"><ChangeBadge change={pair.change.toFixed(2)} /></div>
            </div>
          ))}
        </div>
      )}

      {/* ── INDICES ── */}
      {activeTab === 'Indices' && (
        <div className="divide-y divide-gray-900/50">
          <div className="px-5 py-2.5 bg-yellow-500/5 border-b border-yellow-500/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/60">
              Global Indices & Commodities · CFD Paper Trading
            </span>
          </div>
          {indicesData.filter(filter).map(idx => (
            <div key={idx.id} onClick={() => navigate(`/trade/IDX_${idx.id.toUpperCase()}`)}
              className="grid grid-cols-12 px-5 py-4 items-center cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.07] transition-colors">
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 border"
                  style={{ background: `${idx.color}18`, borderColor: `${idx.color}30` }}>
                  {idx.icon}
                </div>
                <div>
                  <div className="text-sm font-bold leading-none mb-1">{idx.symbol}</div>
                  <div className="text-[10px] text-gray-600">{idx.name}</div>
                </div>
              </div>
              <div className="col-span-3 text-right text-sm font-bold tabular-nums">
                {idx.price >= 1000 ? idx.price.toLocaleString(undefined, { minimumFractionDigits: 1 }) : idx.price.toFixed(2)}
              </div>
              <div className="col-span-3 flex justify-end"><ChangeBadge change={idx.change.toFixed(2)} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Markets;
