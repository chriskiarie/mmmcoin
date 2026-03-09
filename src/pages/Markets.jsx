import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';

const ALL_COINS = [
  { id: 'btc',  name: 'Bitcoin',   symbol: 'BTCUSDT', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',       category: 'Crypto' },
  { id: 'eth',  name: 'Ethereum',  symbol: 'ETHUSDT', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',      category: 'Crypto' },
  { id: 'sol',  name: 'Solana',    symbol: 'SOLUSDT', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',        category: 'Crypto' },
  { id: 'bnb',  name: 'BNB',       symbol: 'BNBUSDT', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',          category: 'Crypto' },
  { id: 'xrp',  name: 'XRP',       symbol: 'XRPUSDT', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',          category: 'Crypto' },
  { id: 'ada',  name: 'Cardano',   symbol: 'ADAUSDT', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png',       category: 'Crypto' },
  { id: 'doge', name: 'Dogecoin',  symbol: 'DOGEUSDT',logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',    category: 'Crypto' },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAXUSDT',logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',   category: 'Crypto' },
  { id: 'link', name: 'Chainlink', symbol: 'LINKUSDT',logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',   category: 'Crypto' },
  { id: 'dot',  name: 'Polkadot',  symbol: 'DOTUSDT', logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', category: 'Crypto' },
];

const initData = ALL_COINS.map(c => ({ ...c, price: '—', change: '0', status: '' }));

const Markets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Crypto');
  const [marketData, setMarketData] = useState(initData);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const streams = ALL_COINS.map(c => `${c.symbol.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.s) return;

      setMarketData(prev => prev.map(coin => {
        if (coin.symbol !== data.s) return coin;

        const newPrice  = parseFloat(data.c);
        const oldPrice  = parseFloat((coin.price || '0').replace(/,/g, ''));
        const flashStatus = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : '';

        return {
          ...coin,
          price:  newPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: parseFloat(data.P).toFixed(2),
          status: flashStatus,
        };
      }));

      // Clear flash after 400ms
      setTimeout(() => {
        setMarketData(prev => prev.map(c => c.symbol === data.s ? { ...c, status: '' } : c));
      }, 400);
    };

    return () => { try { ws.close(); } catch {} };
  }, []);

  // Filter coins
  const filtered = marketData.filter(coin => {
    const matchesTab = activeTab === 'All' || coin.category === activeTab;
    const matchesSearch = !searchQuery ||
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 pb-24 font-sans">
      <style>{`
        @keyframes flashGreen {
          0%   { background-color: rgba(0,200,5,0.35); }
          100% { background-color: transparent; }
        }
        @keyframes flashRed {
          0%   { background-color: rgba(255,59,48,0.35); }
          100% { background-color: transparent; }
        }
        .flash-up   { animation: flashGreen 0.4s ease-out; }
        .flash-down { animation: flashRed   0.4s ease-out; }
      `}</style>

      {/* ── Header ── */}
      <div className="p-4 sticky top-0 bg-[#000000] z-10 border-b border-gray-800/30">
        <div className="flex items-center justify-between mb-4">
          {showSearch ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search coins..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/40 transition-colors"
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black italic tracking-tighter uppercase">Markets</h1>
              <div className="flex gap-4">
                <button onClick={() => setShowSearch(true)}>
                  <Search className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
            </>
          )}
        </div>

        {/* Tab filters */}
        <div className="flex gap-6 overflow-x-auto text-sm font-bold border-b border-gray-900">
          {['All', 'Crypto', 'Forex', 'Indices'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-[#FFB800] border-b-2 border-[#FFB800]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Header ── */}
      <div className="mt-2 px-1">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase font-bold text-gray-600 border-b border-gray-900">
          <div className="col-span-6">Instrument</div>
          <div className="col-span-3 text-right">Price</div>
          <div className="col-span-3 text-right">24h</div>
        </div>

        {/* ── Coin Rows ── */}
        <div className="divide-y divide-gray-900/50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-[11px] font-black uppercase tracking-widest">
              No results found
            </div>
          ) : filtered.map(coin => (
            <div
              key={coin.id}
              onClick={() => navigate(`/trade/${coin.symbol}`)}
              className={`grid grid-cols-12 px-4 py-4 items-center cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors ${
                coin.status === 'up' ? 'flash-up' : coin.status === 'down' ? 'flash-down' : ''
              }`}
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 p-1.5 border border-gray-800 flex-shrink-0">
                  <img
                    src={coin.logo}
                    alt={coin.name}
                    className="w-full h-full object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none mb-1">
                    {coin.symbol.replace('USDT', '')}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">{coin.name}</div>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-3 text-right">
                <div className="text-sm font-bold tabular-nums">
                  ${coin.price}
                </div>
              </div>

              {/* Change badge */}
              <div className="col-span-3 flex justify-end">
                <div className={`px-2 py-1 rounded text-[11px] font-bold min-w-[60px] text-center ${
                  parseFloat(coin.change) >= 0
                    ? 'bg-[#00c80520] text-[#00c805]'
                    : 'bg-[#ff3b3020] text-[#ff3b30]'
                }`}>
                  {parseFloat(coin.change) >= 0 ? '+' : ''}{coin.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Markets;
