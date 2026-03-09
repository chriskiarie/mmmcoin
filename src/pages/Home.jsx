import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownLeft, Zap, Bell, Search,
  Eye, EyeOff, Megaphone, Banknote, User,
  ChevronRight, Hexagon, Trophy, RefreshCw, Users, Sun, Moon
} from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

// Crypto logo from CDN with fallback
function CoinLogo({ ticker, size = 38 }) {
  const [err, setErr] = useState(false);
  const COLORS = {
    btc: '#F7931A', eth: '#627EEA', sol: '#9945FF',
    bnb: '#F3BA2F', xrp: '#346AA9',
  };
  const color = COLORS[ticker] || '#FFB800';
  if (err) {
    return (
      <div className="rounded-full flex items-center justify-center font-black text-[10px] uppercase flex-shrink-0"
        style={{ width: size, height: size, background: `${color}22`, border: `1px solid ${color}55`, color }}>
        {ticker?.toUpperCase()?.slice(0, 3)}
      </div>
    );
  }
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker}.png`}
      alt={ticker}
      onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0"
      style={{ width: size, height: size, background: '#111' }}
    />
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const css = usePageBg();

  const [hideBalance, setHideBalance] = useState(false);
  const [currency,    setCurrency]    = useState('KES');
  const [livePrices,  setLivePrices]  = useState({
    BTCUSDT: { rawPrice: null, change: '0.00', positive: true },
    ETHUSDT: { rawPrice: null, change: '0.00', positive: true },
  });

  const exchangeRate = 130.50;
  const balanceKES   = 6850200;
  const breakdown    = { trading: balanceKES * 0.7, locked: balanceKES * 0.2, network: balanceKES * 0.1 };

  const fmt = (val) => {
    if (hideBalance) return '••••••';
    if (currency === 'KES') return `KES ${Math.round(val).toLocaleString()}`;
    return `$${(val / exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fmtLive = (raw) => {
    if (!raw) return '—';
    if (currency === 'KES') return `KES ${Math.round(raw * exchangeRate).toLocaleString()}`;
    return `$${raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Live Binance WebSocket for Market Pulse
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker');
    ws.onmessage = e => {
      const d = JSON.parse(e.data);
      if (!d.s) return;
      const p = parseFloat(d.c), chg = parseFloat(d.P);
      setLivePrices(prev => ({ ...prev, [d.s]: { rawPrice: p, change: Math.abs(chg).toFixed(2), positive: chg >= 0 } }));
    };
    return () => { try { ws.close(); } catch {} };
  }, []);

  const PULSE = [
    { symbol: 'BTCUSDT', ticker: 'btc', label: 'Bitcoin',  pair: `BTC/${currency}` },
    { symbol: 'ETHUSDT', ticker: 'eth', label: 'Ethereum', pair: `ETH/${currency}` },
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen pb-28 font-sans overflow-x-hidden ${css.page}`}>

      {/* ── Ticker ribbon ── */}
      <div className={`py-2 overflow-hidden border-b ${isDark ? 'bg-yellow-500/8 border-yellow-500/15' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex whitespace-nowrap animate-marquee items-center gap-10">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-10 flex-shrink-0">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500 tracking-widest">
                <Megaphone size={11} /> Referral Bonus — Invite friends & earn KES 5,000
              </span>
              <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                <Trophy size={11} className="text-yellow-500" /> New Listing: SOL/KES now live
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <header className={`px-5 py-4 sticky top-0 backdrop-blur-xl z-50 border-b ${css.header}`}>
        <div className="flex justify-between items-center mb-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <Hexagon size={28} className="text-yellow-500 fill-yellow-500/10" strokeWidth={2.5} />
              <span className="absolute text-[9px] font-black text-yellow-500 tracking-tighter">MMM</span>
            </div>
            <span className={`text-xl font-black tracking-tighter italic uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>
              MMM<span className="text-yellow-500">COIN</span>
            </span>
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search size={19} className="cursor-pointer hover:text-yellow-500 transition-colors" />
            <div className="relative cursor-pointer">
              <Bell size={19} className="hover:text-yellow-500 transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-500 rounded-full border-2"
                style={{ borderColor: isDark ? '#060708' : '#f0f2f5' }} />
            </div>
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className={`p-1.5 rounded-full transition-all active:scale-90 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
              {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Profile chip */}
        <div onClick={() => navigate('/account')}
          className={`flex items-center justify-between p-2 pr-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all border ${css.cardAlt}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-300 flex items-center justify-center">
              <User size={17} className="text-[#060708]" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${css.muted}`}>Portfolio Account</p>
              <p className={`text-sm font-black tracking-tight uppercase italic leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>Verified Trader</p>
            </div>
          </div>
          <ChevronRight size={15} className={css.muted} />
        </div>
      </header>

      <main className="px-5 pt-6 space-y-7">

        {/* ── Balance Card ── */}
        <section className={`p-6 rounded-[2.5rem] border relative overflow-hidden shadow-2xl ${
          isDark ? 'bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] border-white/5' : 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'
        }`}>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                Total Equity
                <button onClick={() => setHideBalance(h => !h)} className="text-gray-500 hover:text-white transition-colors ml-1">
                  {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <button onClick={() => setCurrency(c => c === 'KES' ? 'USD' : 'KES')}
                className="bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 active:scale-90 transition-all">
                <RefreshCw size={9} className="text-yellow-500" />
                <span className="text-[10px] font-black text-yellow-500">{currency}</span>
              </button>
            </div>

            {/* Balance */}
            <div className="mb-5">
              <h2 className="text-4xl font-black tracking-tighter tabular-nums text-white leading-none">
                {fmt(balanceKES)}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-500/15 text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                  +2.4% Today
                </span>
                <span className="text-gray-500 text-[9px] font-bold uppercase tracking-tight">
                  Profit {fmt(162040)}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            {!hideBalance && (
              <div className="flex gap-0 mb-6 py-3 border-y border-white/8">
                <div className="flex-1 px-1">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Trading</p>
                  <p className="text-[11px] font-black italic text-white leading-none">{fmt(breakdown.trading)}</p>
                </div>
                <div className="flex-1 border-x border-white/8 px-4">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Locked</p>
                  <p className="text-[11px] font-black italic text-white leading-none">{fmt(breakdown.locked)}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Network</p>
                  <p className="text-[11px] font-black italic text-white leading-none">{fmt(breakdown.network)}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/account')}
                className="bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-yellow-500/15">
                <ArrowDownLeft size={17} strokeWidth={3} /> Deposit
              </button>
              <button onClick={() => navigate('/account')}
                className="bg-white/8 border border-white/12 text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/12">
                <ArrowUpRight size={17} strokeWidth={3} /> Withdraw
              </button>
            </div>
          </div>
        </section>

        {/* ── Quick Services ── */}
        <section className="grid grid-cols-4 gap-3">
          {[
            { label: 'Events',  Icon: Trophy,  color: '#fb923c', to: null },
            { label: 'Loans',   Icon: Banknote, color: '#4ade80', to: '/loans' },
            { label: 'Network', Icon: Users,    color: '#60a5fa', to: null },
            { label: 'Markets', Icon: Zap,      color: '#FFB800', to: '/markets' },
          ].map(({ label, Icon, color, to }) => (
            <button key={label} onClick={() => to && navigate(to)}
              className={`flex flex-col items-center gap-2 active:scale-90 transition-transform`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${css.cardAlt}`}
                style={{ borderColor: `${color}20` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${css.sub}`}>{label}</span>
            </button>
          ))}
        </section>

        {/* ── MMM Credit Banner ── */}
        <section onClick={() => navigate('/loans')}
          className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-yellow-500/8 p-5 flex justify-between items-center cursor-pointer active:scale-[0.99] transition-all">
          <div className="absolute inset-y-0 left-0 w-1 bg-yellow-500 rounded-r" />
          <div className="pl-3">
            <p className="text-yellow-500 font-black text-sm uppercase tracking-tight italic">Instant MMM-Credit</p>
            <p className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${css.muted}`}>Borrow up to KES 26,100</p>
          </div>
          <button className="bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-yellow-500/20">
            Apply Now
          </button>
        </section>

        {/* ── Market Pulse — Live with proper logos ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-base font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Market Pulse
            </h3>
            <button onClick={() => navigate('/markets')}
              className="text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {PULSE.map(coin => {
              const live = livePrices[coin.symbol];
              return (
                <div key={coin.symbol}
                  onClick={() => navigate(`/trade/${coin.symbol}`)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${css.cardAlt}`}>
                  <div className="flex items-center gap-3">
                    <CoinLogo ticker={coin.ticker} size={38} />
                    <div>
                      <p className={`font-black text-sm uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{coin.pair}</p>
                      <p className={`text-[10px] font-bold ${css.muted}`}>{coin.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm tabular-nums tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {fmtLive(live?.rawPrice)}
                    </p>
                    <p className={`text-[10px] font-black ${live?.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {live?.positive ? '+' : '-'}{live?.change ?? '0.00'}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 22s linear infinite; }
      `}} />
    </div>
  );
}
