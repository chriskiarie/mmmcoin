import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added Navigation Hook
import { Search, Filter } from 'lucide-react';

const Markets = () => {
  const navigate = useNavigate(); // 2. Initialize Navigation
  const [activeTab, setActiveTab] = useState('Crypto');
  const [marketData, setMarketData] = useState([
    { id: 'btc', name: 'Bitcoin', symbol: 'BTCUSDT', price: '0', change: '0', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', status: '' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETHUSDT', price: '0', change: '0', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', status: '' },
    { id: 'sol', name: 'Solana', symbol: 'SOLUSDT', price: '0', change: '0', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png', status: '' },
    { id: 'bnb', name: 'BNB', symbol: 'BNBUSDT', price: '0', change: '0', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', status: '' },
    { id: 'xrp', name: 'XRP', symbol: 'XRPUSDT', price: '0', change: '0', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png', status: '' },
  ]);

  useEffect(() => {
    const streams = marketData.map(coin => `${coin.symbol.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      setMarketData(prevData => prevData.map(coin => {
        if (coin.symbol === data.s) {
          const newPrice = parseFloat(data.c);
          const oldPrice = parseFloat(coin.price.replace(/,/g, ''));
          
          let flashStatus = '';
          if (newPrice > oldPrice) flashStatus = 'up';
          else if (newPrice < oldPrice) flashStatus = 'down';

          return {
            ...coin,
            price: newPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            change: parseFloat(data.P).toFixed(2),
            status: flashStatus 
          };
        }
        return coin;
      }));

      setTimeout(() => {
        setMarketData(prev => prev.map(c => ({...c, status: ''})));
      }, 300);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 pb-24 font-sans">
      <style>{`
        @keyframes flashGreen {
          0% { background-color: rgba(0, 200, 5, 0.4); color: #00c805; }
          100% { background-color: transparent; }
        }
        @keyframes flashRed {
          0% { background-color: rgba(255, 59, 48, 0.4); color: #ff3b30; }
          100% { background-color: transparent; }
        }
        .flash-up { animation: flashGreen 0.4s ease-out; }
        .flash-down { animation: flashRed 0.4s ease-out; }
      `}</style>

      {/* Header */}
      <div className="p-4 sticky top-0 bg-[#000000] z-10 border-b border-gray-800/30">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Markets</h1>
          <div className="flex gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar text-sm font-bold border-b border-gray-900">
          {['All', 'Crypto', 'Forex', 'Indices'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-2 whitespace-nowrap transition-all ${activeTab === tab ? 'text-[#FFB800] border-b-2 border-[#FFB800]' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Market List */}
      <div className="mt-2 px-1">
        <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase font-bold text-gray-600 border-b border-gray-900">
          <div className="col-span-6">Instrument</div>
          <div className="col-span-3 text-right">Price</div>
          <div className="col-span-3 text-right">24h Change</div>
        </div>

        <div className="divide-y divide-gray-900/50">
          {marketData.map((coin) => (
            <div 
              key={coin.id} 
              // 3. Added navigation on click
              onClick={() => navigate(`/trade/${coin.symbol}`)}
              className="grid grid-cols-12 px-4 py-4 items-center cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 p-1.5 border border-gray-800">
                  <img src={coin.logo} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none mb-1">{coin.symbol.replace('USDT', '')}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{coin.name}</div>
                </div>
              </div>

              {/* Price with Flash Effect */}
              <div className="col-span-3 text-right">
                <div className={`text-sm font-bold tabular-nums rounded px-1 transition-all inline-block ${
                  coin.status === 'up' ? 'flash-up' : coin.status === 'down' ? 'flash-down' : ''
                }`}>
                  ${coin.price}
                </div>
              </div>

              {/* Change Badge */}
              <div className="col-span-3 flex justify-end">
                <div className={`px-2 py-1 rounded text-[11px] font-bold min-w-[65px] text-center ${
                  parseFloat(coin.change) >= 0 ? 'bg-[#00c80520] text-[#00c805]' : 'bg-[#ff3b3020] text-[#ff3b30]'
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