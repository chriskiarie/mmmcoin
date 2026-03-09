import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, BarChart2, Activity, Droplets, Cpu, Globe } from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

// ─── Data ─────────────────────────────────────────────────────────────────────

const CRYPTO = [
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

const FOREX = [
  { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro / US Dollar',        base: 'eu', quote: 'us', price: 1.0842, change:  0.12, spread: '0.8' },
  { id: 'gbpusd', symbol: 'GBP/USD', name: 'Pound / US Dollar',       base: 'gb', quote: 'us', price: 1.2643, change: -0.08, spread: '1.0' },
  { id: 'usdjpy', symbol: 'USD/JPY', name: 'Dollar / Japanese Yen',   base: 'us', quote: 'jp', price: 149.82, change:  0.24, spread: '0.9' },
  { id: 'audusd', symbol: 'AUD/USD', name: 'Australian Dollar / USD', base: 'au', quote: 'us', price: 0.6521, change: -0.15, spread: '1.1' },
  { id: 'usdcad', symbol: 'USD/CAD', name: 'Dollar / Canadian Dollar',base: 'us', quote: 'ca', price: 1.3642, change:  0.07, spread: '1.2' },
  { id: 'usdchf', symbol: 'USD/CHF', name: 'Dollar / Swiss Franc',    base: 'us', quote: 'ch', price: 0.9012, change: -0.03, spread: '0.9' },
  { id: 'nzdusd', symbol: 'NZD/USD', name: 'NZD / US Dollar',         base: 'nz', quote: 'us', price: 0.5983, change:  0.10, spread: '1.3' },
  { id: 'eurjpy', symbol: 'EUR/JPY', name: 'Euro / Japanese Yen',     base: 'eu', quote: 'jp', price: 162.45, change:  0.34, spread: '1.0' },
];

// Professional index config — Lucide icon + color + short code
const INDICES = [
  { id: 'spx',    symbol: 'SPX500', name: 'S&P 500',     code: 'SPX',  Icon: TrendingUp, color: '#4facfe', price: 5842.50, change:  0.68 },
  { id: 'nas',    symbol: 'NAS100', name: 'NASDAQ 100',  code: 'NAS',  Icon: BarChart2,  color: '#a78bfa', price: 20453.2, change:  1.24 },
  { id: 'dow',    symbol: 'DJI30',  name: 'Dow Jones 30',code: 'DJI',  Icon: Activity,   color: '#34d399', price: 42891.0, change:  0.45 },
  { id: 'dax',    symbol: 'DAX40',  name: 'DAX 40',      code: 'DAX',  Icon: TrendingUp, color: '#fbbf24', price: 18423.8, change:  0.82 },
  { id: 'gold',   symbol: 'XAUUSD', name: 'Gold Spot',   code: 'XAU',  Icon: Cpu,        color: '#FFB800', price: 2042.30, change:  0.32 },
  { id: 'oil',    symbol: 'WTIUSD', name: 'Crude Oil WTI',code:'WTI',  Icon: Droplets,   color: '#f97316', price: 78.450,  change: -1.20 },
  { id: 'silver', symbol: 'XAGUSD', name: 'Silver Spot', code: 'XAG',  Icon: Globe,      color: '#94a3b8', price: 22.840,  change:  0.18 },
];

const COIN_COLORS = {
  btc:'#F7931A',eth:'#627EEA',sol:'#9945FF',bnb:'#F3BA2F',
  xrp:'#346AA9',ada:'#0033AD',doge:'#C2A633',avax:'#E84142',
  link:'#2A5ADA',dot:'#E6007A',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useSim(initial) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => prev.map(item => {
        const drift = (Math.random() - 0.499) * 0.0007 * item.price;
        const digits = item.price < 10 ? 4 : item.price < 100 ? 3 : item.price < 1000 ? 2 : 1;
        return {
          ...item,
          price:  parseFloat((item.price + drift).toFixed(digits)),
          change: parseFloat((item.change + (Math.random() - 0.499) * 0.015).toFixed(2)),
        };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return data;
}

function CryptoIcon({ ticker }) {
  const [err, setErr] = useState(false);
  const color = COIN_COLORS[ticker] || '#FFB800';
  if (err) return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0"
      style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}>
      {ticker?.toUpperCase()?.slice(0,3)}
    </div>
  );
  return (
    <img src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker}.png`}
      alt={ticker} onError={() => setErr(true)}
      className="w-9 h-9 rounded-full object-contain flex-shrink-0" style={{ background: '#111' }} />
  );
}

function ForexIcon({ base, quote }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 44, height: 32 }}>
      <img src={`https://flagcdn.com/w40/${base}.png`} alt={base}
        className="w-8 h-8 rounded-full object-cover border border-white/15 absolute left-0 top-0" />
      <img src={`https://flagcdn.com/w40/${quote}.png`} alt={quote}
        className="w-[22px] h-[22px] rounded-full object-cover border-2 absolute right-0 bottom-0"
        style={{ borderColor: '#000' }} />
    </div>
  );
}

function IndexIcon({ Icon, color, code }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border"
      style={{ background: `${color}18`, borderColor: `${color}35` }}>
      <Icon size={16} style={{ color }} />
    </div>
  );
}

function Badge({ change }) {
  const pos = parseFloat(change) >= 0;
  return (
    <div className={`px-2 py-1 rounded text-[11px] font-bold min-w-[60px] text-center tabular-nums ${
      pos ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
    }`}>
      {pos ? '+' : ''}{change}%
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Markets() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const css = usePageBg();
  const isDark = theme === 'dark';

  const [tab,         setTab]         = useState('Crypto');
  const [showSearch,  setShowSearch]  = useState(false);
  const [query,       setQuery]       = useState('');

  const [cryptoData, setCryptoData] = useState(
    CRYPTO.map(c => ({ ...c, price: '—', change: '0', status: '' }))
  );

  useEffect(() => {
    const streams = CRYPTO.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.s) return;
      const newP = parseFloat(d.c);
      setCryptoData(prev => prev.map(c => {
        if (c.symbol !== d.s) return c;
        const oldP = parseFloat((c.price + '').replace(/,/g,'')) || 0;
        return { ...c,
          price:  newP.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: parseFloat(d.P).toFixed(2),
          status: newP > oldP ? 'up' : newP < oldP ? 'down' : '',
        };
      }));
      setTimeout(() => setCryptoData(p => p.map(c => c.symbol === d.s ? { ...c, status: '' } : c)), 400);
    };
    return () => { try { ws.close(); } catch {} };
  }, []);

  const forexData   = useSim(FOREX);
  const indicesData = useSim(INDICES);

  const q = query.toLowerCase();
  const filter = item => !q || item.name?.toLowerCase().includes(q) || item.symbol?.toLowerCase().includes(q);

  const headerBg = isDark ? 'bg-black' : 'bg-white';
  const pageBg   = isDark ? 'bg-black' : 'bg-gray-50';

  return (
    <div className={`min-h-screen pb-24 font-sans ${pageBg} ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <style>{`
        @keyframes fG{0%{background:rgba(0,200,5,.22)}100%{background:transparent}}
        @keyframes fR{0%{background:rgba(239,68,68,.22)}100%{background:transparent}}
        .fu{animation:fG .4s ease-out} .fd{animation:fR .4s ease-out}
      `}</style>

      {/* Header */}
      <div className={`px-4 pt-5 sticky top-0 z-20 border-b ${headerBg} ${isDark ? 'border-gray-900' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          {showSearch ? (
            <div className="flex items-center gap-2 flex-1">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${tab}...`}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-yellow-500/40 border transition-colors ${css.input}`} />
              <button onClick={() => { setShowSearch(false); setQuery(''); }} className="text-gray-500 p-1.5">
                <X size={17} />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Markets</h1>
              <button onClick={() => setShowSearch(true)} className="text-gray-400 hover:text-yellow-500 transition-colors p-1">
                <Search size={19} />
              </button>
            </>
          )}
        </div>

        <div className="flex">
          {['Crypto','Forex','Indices'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 pr-7 text-sm font-black uppercase tracking-tight border-b-2 transition-all ${
                tab === t ? 'text-yellow-500 border-yellow-500' : `${isDark ? 'text-gray-600' : 'text-gray-400'} border-transparent`
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className={`grid grid-cols-12 px-5 py-2.5 text-[9px] uppercase font-bold tracking-widest border-b ${
        isDark ? 'text-gray-700 border-gray-900/80' : 'text-gray-400 border-gray-200'
      }`}>
        <div className="col-span-6">Instrument</div>
        <div className="col-span-3 text-right">Price</div>
        <div className="col-span-3 text-right">24h</div>
      </div>

      {/* ── CRYPTO ── */}
      {tab === 'Crypto' && (
        <div className={`divide-y ${isDark ? 'divide-gray-900/60' : 'divide-gray-100'}`}>
          {cryptoData.filter(filter).map(coin => (
            <div key={coin.id} onClick={() => navigate(`/trade/${coin.symbol}`)}
              className={`grid grid-cols-12 px-5 py-3.5 items-center cursor-pointer transition-colors ${
                coin.status === 'up' ? 'fu' : coin.status === 'down' ? 'fd' : ''
              } ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
              <div className="col-span-6 flex items-center gap-3">
                <CryptoIcon ticker={coin.ticker} />
                <div>
                  <div className="text-sm font-bold leading-none mb-0.5">{coin.symbol.replace('USDT','')}</div>
                  <div className={`text-[10px] font-medium ${css.muted}`}>{coin.name}</div>
                </div>
              </div>
              <div className="col-span-3 text-right text-sm font-bold tabular-nums">${coin.price}</div>
              <div className="col-span-3 flex justify-end"><Badge change={coin.change} /></div>
            </div>
          ))}
        </div>
      )}

      {/* ── FOREX ── */}
      {tab === 'Forex' && (
        <div className={`divide-y ${isDark ? 'divide-gray-900/60' : 'divide-gray-100'}`}>
          <div className={`px-5 py-2 border-b text-[9px] font-black uppercase tracking-widest text-blue-400 ${isDark ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
            Simulated Forex · Spreads from 0.8 pips · 24/5
          </div>
          {forexData.filter(filter).map(pair => (
            <div key={pair.id} onClick={() => navigate(`/trade/FX_${pair.id.toUpperCase()}`)}
              className={`grid grid-cols-12 px-5 py-3.5 items-center cursor-pointer transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
              <div className="col-span-6 flex items-center gap-3">
                <ForexIcon base={pair.base} quote={pair.quote} />
                <div>
                  <div className="text-sm font-bold leading-none mb-0.5">{pair.symbol}</div>
                  <div className={`text-[10px] font-medium ${css.muted}`}>Spread: {pair.spread} pip</div>
                </div>
              </div>
              <div className="col-span-3 text-right text-sm font-bold tabular-nums">
                {pair.price.toFixed(pair.price > 10 ? 2 : 4)}
              </div>
              <div className="col-span-3 flex justify-end"><Badge change={pair.change.toFixed(2)} /></div>
            </div>
          ))}
        </div>
      )}

      {/* ── INDICES ── */}
      {tab === 'Indices' && (
        <div className={`divide-y ${isDark ? 'divide-gray-900/60' : 'divide-gray-100'}`}>
          <div className={`px-5 py-2 border-b text-[9px] font-black uppercase tracking-widest text-yellow-500/70 ${isDark ? 'bg-yellow-500/5 border-yellow-500/10' : 'bg-yellow-50 border-yellow-100'}`}>
            Global Indices & Commodities · CFD Trading
          </div>
          {indicesData.filter(filter).map(idx => (
            <div key={idx.id} onClick={() => navigate(`/trade/IDX_${idx.id.toUpperCase()}`)}
              className={`grid grid-cols-12 px-5 py-3.5 items-center cursor-pointer transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
              <div className="col-span-6 flex items-center gap-3">
                <IndexIcon Icon={idx.Icon} color={idx.color} code={idx.code} />
                <div>
                  <div className="text-sm font-bold leading-none mb-0.5">{idx.symbol}</div>
                  <div className={`text-[10px] font-medium ${css.muted}`}>{idx.name}</div>
                </div>
              </div>
              <div className="col-span-3 text-right text-sm font-bold tabular-nums">
                {idx.price >= 1000
                  ? idx.price.toLocaleString(undefined, { minimumFractionDigits: 1 })
                  : idx.price.toFixed(2)}
              </div>
              <div className="col-span-3 flex justify-end"><Badge change={idx.change.toFixed(2)} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
