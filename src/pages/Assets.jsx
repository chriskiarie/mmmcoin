import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowUpRight, RefreshCw,
  TrendingUp, TrendingDown, Clock, Copy,
  CheckCircle2, Eye, EyeOff, Repeat
} from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

const EX_RATE = 130.5;

const HOLDINGS = [
  { id: 'usdt', ticker: 'usdt', name: 'Tether',   balance: 4295.14, price: 1.00,     change:  0.01, color: '#26a17b' },
  { id: 'btc',  ticker: 'btc',  name: 'Bitcoin',  balance: 0.04812, price: 69041.0,  change:  2.63, color: '#F7931A' },
  { id: 'eth',  ticker: 'eth',  name: 'Ethereum', balance: 0.8420,  price: 2032.80,  change:  3.79, color: '#627EEA' },
  { id: 'sol',  ticker: 'sol',  name: 'Solana',   balance: 12.500,  price: 85.79,    change:  4.36, color: '#9945FF' },
  { id: 'bnb',  ticker: 'bnb',  name: 'BNB',      balance: 2.300,   price: 637.75,   change:  3.23, color: '#F3BA2F' },
];

const TXS = [
  { id: 1, type: 'deposit',  asset: 'USDT', amount: 1000,    date: 'Mar 08', status: 'completed' },
  { id: 2, type: 'trade',    asset: 'BTC',  amount: 0.01,    date: 'Mar 07', status: 'completed' },
  { id: 3, type: 'trade',    asset: 'ETH',  amount: 0.42,    date: 'Mar 06', status: 'completed' },
  { id: 4, type: 'withdraw', asset: 'USDT', amount: 500,     date: 'Mar 05', status: 'completed' },
  { id: 5, type: 'deposit',  asset: 'USDT', amount: 2000,    date: 'Mar 03', status: 'completed' },
  { id: 6, type: 'trade',    asset: 'SOL',  amount: 12.5,    date: 'Mar 02', status: 'completed' },
];

function CoinIcon({ ticker, color, size = 36 }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0"
      style={{ width: size, height: size, background: `${color}22`, border: `1px solid ${color}44`, color }}>
      {ticker.toUpperCase().slice(0,3)}
    </div>
  );
  return (
    <img src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker}.png`}
      alt={ticker} onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0" style={{ width: size, height: size }} />
  );
}

function TxIcon({ type }) {
  const map = {
    deposit:  { Icon: ArrowDownLeft, bg: 'bg-green-500/10',  color: 'text-green-400' },
    withdraw: { Icon: ArrowUpRight,  bg: 'bg-red-500/10',    color: 'text-red-400'   },
    trade:    { Icon: Repeat,        bg: 'bg-blue-500/10',   color: 'text-blue-400'  },
  };
  const { Icon, bg, color } = map[type] || map.trade;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon size={15} className={color} />
    </div>
  );
}

export default function Assets() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const css = usePageBg();
  const isDark = theme === 'dark';

  const [currency,  setCurrency]  = useState('USD');
  const [hideVal,   setHideVal]   = useState(false);
  const [activeTab, setActiveTab] = useState('holdings');
  const [prices,    setPrices]    = useState({});
  const [copied,    setCopied]    = useState(false);

  // Live prices for holdings
  useEffect(() => {
    const symbols = ['btcusdt','ethusdt','solusdt','bnbusdt'];
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols.map(s=>`${s}@ticker`).join('/')}`);
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.s) return;
      setPrices(prev => ({ ...prev, [d.s.replace('USDT','').toLowerCase()]: parseFloat(d.c) }));
    };
    return () => { try { ws.close(); } catch {} };
  }, []);

  // Merge live prices into holdings
  const holdings = HOLDINGS.map(h => ({
    ...h,
    price: prices[h.ticker] || h.price,
    valueUSD: (prices[h.ticker] || h.price) * h.balance,
  }));

  const totalUSD = holdings.reduce((s, h) => s + h.valueUSD, 0);
  const totalKES = totalUSD * EX_RATE;
  const totalPnlUSD = holdings.reduce((s, h) => s + h.valueUSD * (h.change / 100), 0);

  const fmtTotal = () => {
    if (hideVal) return '••••••';
    if (currency === 'USD') return `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `KES ${Math.round(totalKES).toLocaleString()}`;
  };

  const fmtValue = (usd) => {
    if (hideVal) return '••••';
    if (currency === 'USD') return `$${usd.toFixed(2)}`;
    return `KES ${Math.round(usd * EX_RATE).toLocaleString()}`;
  };

  const copyAddress = () => {
    navigator.clipboard?.writeText('0x8F2a3E9bD12c4F7A5B91e0D3C6F8a2B4E7D9c1F3');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bgPage = isDark ? 'bg-[#060708] text-white' : 'bg-[#f0f2f5] text-gray-900';
  const bgCard = isDark ? 'bg-[#0b0e11] border-white/5' : 'bg-white border-gray-200';
  const bgAlt  = isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200';
  const textSub = isDark ? 'text-gray-500' : 'text-gray-500';
  const divider = isDark ? 'divide-white/5' : 'divide-gray-100';
  const bdrB    = isDark ? 'border-white/5' : 'border-gray-200';

  return (
    <div className={`min-h-screen pb-28 font-sans ${bgPage}`}>

      {/* ── Header ── */}
      <div className={`px-5 py-4 sticky top-0 backdrop-blur-xl z-20 border-b ${isDark ? 'bg-[#060708]/90 border-white/5' : 'bg-white/90 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">
            My <span className="text-yellow-500">Assets</span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setHideVal(v => !v)} className={`p-1.5 rounded-full ${textSub}`}>
              {hideVal ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
            <button onClick={() => setCurrency(c => c === 'USD' ? 'KES' : 'USD')}
              className="bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 active:scale-90 transition-all">
              <RefreshCw size={9} className="text-yellow-500" />
              <span className="text-[9px] font-black text-yellow-500">{currency}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="px-5 pt-5 space-y-5">

        {/* ── Portfolio Summary ── */}
        <section className={`rounded-[2.5rem] border p-6 relative overflow-hidden shadow-2xl ${
          isDark ? 'bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] border-white/5' : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
        }`}>
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-yellow-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Total Portfolio Value</p>
            <div className="text-4xl font-black italic tracking-tighter text-white mb-1">
              {fmtTotal()}
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${
                totalPnlUSD >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {totalPnlUSD >= 0 ? '+' : ''}{currency === 'USD'
                  ? `$${totalPnlUSD.toFixed(2)}`
                  : `KES ${Math.round(totalPnlUSD * EX_RATE).toLocaleString()}`
                } Today
              </span>
            </div>

            {/* Allocation bar */}
            <div className="h-2 rounded-full overflow-hidden flex gap-0.5 mb-3">
              {holdings.map(h => (
                <div key={h.id} className="rounded-full transition-all"
                  style={{ width: `${(h.valueUSD/totalUSD*100).toFixed(1)}%`, background: h.color }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {holdings.map(h => (
                <div key={h.id} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                  <span className="text-[9px] font-black text-gray-400 uppercase">{h.ticker.toUpperCase()}</span>
                  <span className="text-[9px] font-bold text-gray-600">{(h.valueUSD/totalUSD*100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button onClick={() => navigate('/account')}
              className="bg-yellow-500 text-black py-3.5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
              <ArrowDownLeft size={15} strokeWidth={3} /> Deposit
            </button>
            <button onClick={() => navigate('/account')}
              className="bg-white/8 border border-white/12 text-white py-3.5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
              <ArrowUpRight size={15} strokeWidth={3} /> Withdraw
            </button>
          </div>
        </section>

        {/* ── Tabs ── */}
        <div className={`flex gap-0 border-b ${bdrB}`}>
          {['holdings','history'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`pb-3 pr-7 text-sm font-black uppercase tracking-tight border-b-2 transition-all ${
                activeTab === t ? 'text-yellow-500 border-yellow-500' : `${textSub} border-transparent`
              }`}>{t}</button>
          ))}
        </div>

        {/* ── Holdings ── */}
        {activeTab === 'holdings' && (
          <div className={`rounded-3xl border overflow-hidden ${bgCard}`}>
            <div className={`divide-y ${divider}`}>
              {holdings.map(h => (
                <div key={h.id} onClick={() => h.ticker !== 'usdt' && navigate(`/trade/${h.ticker.toUpperCase()}USDT`)}
                  className={`flex items-center justify-between px-5 py-4 transition-colors ${
                    h.ticker !== 'usdt' ? `cursor-pointer ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}` : ''
                  }`}>
                  <div className="flex items-center gap-3">
                    <CoinIcon ticker={h.ticker} color={h.color} size={34} />
                    <div>
                      <p className="text-sm font-black leading-none mb-0.5">{h.ticker.toUpperCase()}</p>
                      <p className={`text-[10px] font-medium ${textSub}`}>{h.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tabular-nums">{fmtValue(h.valueUSD)}</p>
                    <p className={`text-[10px] font-bold tabular-nums ${h.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {h.balance.toFixed(h.balance < 1 ? 5 : 2)} {h.ticker.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── History ── */}
        {activeTab === 'history' && (
          <div className={`rounded-3xl border overflow-hidden ${bgCard}`}>
            <div className={`divide-y ${divider}`}>
              {TXS.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                  <TxIcon type={tx.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black capitalize leading-none mb-0.5">
                      {tx.type === 'deposit' ? 'Deposit' : tx.type === 'withdraw' ? 'Withdrawal' : 'Trade'} {tx.asset}
                    </p>
                    <p className={`text-[10px] font-medium ${textSub}`}>{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black tabular-nums ${
                      tx.type === 'deposit' ? 'text-green-400' : tx.type === 'withdraw' ? 'text-red-400' : isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : ''}
                      {tx.amount} {tx.asset}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-[9px] font-bold text-green-400 uppercase">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Receive Address ── */}
        <section className={`rounded-3xl border p-5 ${bgCard}`}>
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-4 ${textSub}`}>Receive Address</p>
          <div className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${bgAlt}`}>
            <p className={`text-[10px] font-bold truncate ${textSub}`}>
              0x8F2a3E9bD12c4F7A5B91e0D3C6F8a2B4E7D9c1F3
            </p>
            <button onClick={copyAddress}
              className="flex-shrink-0 p-2 rounded-xl bg-yellow-500/10 active:scale-90 transition-all">
              {copied ? <CheckCircle2 size={15} className="text-green-400" /> : <Copy size={15} className="text-yellow-500" />}
            </button>
          </div>
          <p className={`text-[9px] font-bold mt-2 ${textSub}`}>ERC-20 / BEP-20 compatible · Minimum 10 USDT</p>
        </section>

      </main>
    </div>
  );
}
