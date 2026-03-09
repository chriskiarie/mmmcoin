import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownLeft, Zap, Bell, Search,
  Eye, EyeOff, Megaphone, Banknote, ChevronRight,
  Trophy, RefreshCw, Users, Sun, Moon, X, Check,
  TrendingUp, TrendingDown, Repeat, ShieldCheck
} from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const USER = {
  name:   'Ethan Mwangi',
  handle: '@ethan.mwangi',
  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=EthanMwangi&backgroundColor=b6e3f4&clothingColor=3c4f5c',
  verified: true,
};

const CURRENCIES = [
  { code: 'USD', symbol: '$',    flag: 'us', rate: 1      },
  { code: 'EUR', symbol: '€',    flag: 'eu', rate: 0.921  },
  { code: 'GBP', symbol: '£',    flag: 'gb', rate: 0.791  },
  { code: 'KES', symbol: 'KES ', flag: 'ke', rate: 130.5  },
  { code: 'AED', symbol: 'AED ', flag: 'ae', rate: 3.673  },
  { code: 'JPY', symbol: '¥',    flag: 'jp', rate: 149.8  },
];

const NOTIFICATIONS = [
  { id: 1, type: 'trade',    title: 'BTC Long Closed',         body: 'Your BTC position closed at +$142.80 profit',   time: '2m ago',  read: false },
  { id: 2, type: 'deposit',  title: 'Deposit Confirmed',        body: 'KES 5,000 successfully deposited via M-Pesa',   time: '18m ago', read: false },
  { id: 3, type: 'price',    title: 'SOL Price Alert',          body: 'Solana crossed $90 — up 6.2% in 24h',           time: '1h ago',  read: true  },
  { id: 4, type: 'loan',     title: 'Loan Payment Reminder',    body: 'Next instalment of KES 1,631 due in 3 days',    time: '3h ago',  read: true  },
  { id: 5, type: 'network',  title: 'New Referral Joined',      body: 'Samuel K. signed up with your referral link',   time: '5h ago',  read: true  },
  { id: 6, type: 'security', title: 'New Login Detected',       body: 'Sign-in from Nairobi, Kenya · Chrome on Windows','time': '1d ago', read: true },
];

const TYPE_STYLE = {
  trade:    { bg: 'bg-green-500/10',  dot: 'bg-green-500',  icon: TrendingUp },
  deposit:  { bg: 'bg-blue-500/10',   dot: 'bg-blue-400',   icon: ArrowDownLeft },
  price:    { bg: 'bg-yellow-500/10', dot: 'bg-yellow-500', icon: TrendingUp },
  loan:     { bg: 'bg-orange-500/10', dot: 'bg-orange-400', icon: Repeat },
  network:  { bg: 'bg-purple-500/10', dot: 'bg-purple-400', icon: Users },
  security: { bg: 'bg-red-500/10',    dot: 'bg-red-400',    icon: ShieldCheck },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CoinLogo({ ticker, size = 38 }) {
  const [err, setErr] = useState(false);
  const COLORS = { btc:'#F7931A', eth:'#627EEA', sol:'#9945FF', bnb:'#F3BA2F', xrp:'#346AA9' };
  const color = COLORS[ticker] || '#FFB800';
  if (err) return (
    <div className="rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0"
      style={{ width:size, height:size, background:`${color}22`, border:`1px solid ${color}55`, color }}>
      {ticker?.toUpperCase()?.slice(0,3)}
    </div>
  );
  return (
    <img src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/${ticker}.png`}
      alt={ticker} onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0"
      style={{ width:size, height:size, background:'#111' }} />
  );
}

// Animated MMM Logo SVG
function MmmLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#FFB800" fillOpacity="0.12" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="#FFB800" strokeOpacity="0.3" />
      {/* Triple M letterform — geometric */}
      <path d="M5 28V13l7 8 7-8v15" stroke="#FFB800" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M19 28V13l7 8 7-8v15" stroke="#FFB800" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

// Expanding account button — square avatar on idle → full card on hover
function AccountButton({ isDark, navigate }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const timerRef = useRef(null);

  const handleClick = () => {
    setClicked(true);
    timerRef.current = setTimeout(() => navigate('/account'), 380);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const cardBg = isDark
    ? 'bg-[#0f1115] border-white/8 shadow-xl shadow-black/40'
    : 'bg-white border-gray-200 shadow-xl shadow-gray-200/60';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      className={`
        relative overflow-hidden border rounded-2xl cursor-pointer
        transition-all duration-300 ease-out
        ${hovered || clicked ? 'w-full' : 'w-12 h-12'}
        ${cardBg}
        ${clicked ? 'scale-[0.97] opacity-80' : 'active:scale-[0.98]'}
      `}
      style={{ height: hovered || clicked ? '60px' : '48px' }}
    >
      {/* Always visible: avatar */}
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 z-10 bg-gradient-to-tr from-yellow-500 to-yellow-300">
        <img src={USER.avatar} alt={USER.name} className="w-full h-full object-cover" />
      </div>

      {/* Expanded content */}
      <div className={`absolute left-[52px] top-1/2 -translate-y-1/2 transition-all duration-300 whitespace-nowrap ${
        hovered || clicked ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
      }`}>
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-black tracking-tight italic leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {USER.name}
          </p>
          {USER.verified && <ShieldCheck size={12} className="text-yellow-500 flex-shrink-0" />}
        </div>
        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Verified Trader
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight
        size={14}
        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          hovered || clicked ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        } ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const css = usePageBg();
  const isDark = theme === 'dark';

  const [hideBalance, setHideBalance] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]); // USD default
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [livePrices, setLivePrices] = useState({
    BTCUSDT: { rawPrice: null, change: '0.00', positive: true },
    ETHUSDT: { rawPrice: null, change: '0.00', positive: true },
  });

  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Portfolio values (base in USD) ────────────────────────────────────────
  const balanceUSD  = 52490.50;
  const breakdownUSD = { trading: balanceUSD * 0.7, locked: balanceUSD * 0.2, network: balanceUSD * 0.1 };

  const fmtCurrency = (usd) => {
    if (hideBalance) return '••••••';
    const val = usd * selectedCurrency.rate;
    if (selectedCurrency.code === 'JPY') return `¥${Math.round(val).toLocaleString()}`;
    if (selectedCurrency.code === 'KES') return `KES ${Math.round(val).toLocaleString()}`;
    const decimals = selectedCurrency.code === 'JPY' ? 0 : 2;
    return `${selectedCurrency.symbol}${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  const fmtLivePrice = (raw) => {
    if (!raw) return '—';
    const val = raw * selectedCurrency.rate;
    const sym = selectedCurrency.symbol;
    if (selectedCurrency.code === 'JPY') return `${sym}${Math.round(val).toLocaleString()}`;
    if (selectedCurrency.code === 'KES') return `KES ${Math.round(val).toLocaleString()}`;
    return `${sym}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Live prices
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

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const PULSE = [
    { symbol: 'BTCUSDT', ticker: 'btc', name: 'Bitcoin',  label: `BTC/${selectedCurrency.code}` },
    { symbol: 'ETHUSDT', ticker: 'eth', name: 'Ethereum', label: `ETH/${selectedCurrency.code}` },
  ];

  return (
    <div className={`min-h-screen pb-28 font-sans overflow-x-hidden ${css.page}`}>

      {/* ── Ticker ribbon ── */}
      <div className={`py-2 overflow-hidden border-b ${isDark ? 'bg-yellow-500/8 border-yellow-500/15' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex whitespace-nowrap animate-marquee items-center gap-10">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-10 flex-shrink-0">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500 tracking-widest">
                <Megaphone size={11} /> Referral Bonus — Invite friends & earn $38
              </span>
              <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                <Trophy size={11} className="text-yellow-500" /> New Listing: SOL/USD now live
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <header className={`px-5 py-4 sticky top-0 backdrop-blur-xl z-50 border-b ${css.header}`}>
        {/* Top row: logo + actions */}
        <div className="flex justify-between items-center mb-4">
          {/* MMM Logo */}
          <div className="flex items-center gap-2.5">
            <MmmLogo size={36} />
            <div>
              <span className={`text-xl font-black tracking-tighter italic uppercase leading-none block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                MMM<span className="text-yellow-500">COIN</span>
              </span>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Trading Platform
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
              <Search size={18} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(v => !v)}
                className={`p-2 rounded-full transition-colors relative ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-yellow-500 rounded-full border-2 flex items-center justify-center text-[8px] font-black text-black"
                    style={{ borderColor: isDark ? '#060708' : '#f0f2f5' }}>
                    {unread}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 top-10 w-80 rounded-3xl border shadow-2xl overflow-hidden z-50 ${
                  isDark ? 'bg-[#0d0f12] border-white/8 shadow-black/60' : 'bg-white border-gray-200 shadow-gray-300/40'
                }`}>
                  {/* Header */}
                  <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-tight">Notifications</p>
                      {unread > 0 && (
                        <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">{unread} unread</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead}
                          className="text-[9px] font-black uppercase text-yellow-500 hover:underline tracking-wider">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)}
                        className={`p-1.5 rounded-full ${isDark ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => {
                      const st = TYPE_STYLE[n.type] || TYPE_STYLE.trade;
                      const Icon = st.icon;
                      return (
                        <div key={n.id}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          className={`flex items-start gap-3 px-5 py-3.5 border-b last:border-0 cursor-pointer transition-colors ${
                            isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50'
                          } ${!n.read ? isDark ? 'bg-yellow-500/[0.03]' : 'bg-yellow-50/50' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${st.bg}`}>
                            <Icon size={13} className={`text-${st.dot.replace('bg-','')}`} style={{ color: st.dot.includes('yellow') ? '#FFB800' : undefined }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-black truncate">{n.title}</p>
                              {!n.read && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />}
                            </div>
                            <p className={`text-[10px] font-medium leading-snug mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {n.body}
                            </p>
                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
                              {n.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className={`p-2 rounded-full transition-all active:scale-90 ${isDark ? 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        {/* ── Expanding Account Button ── */}
        <AccountButton isDark={isDark} navigate={navigate} />
      </header>

      <main className="px-5 pt-6 space-y-7">

        {/* ── Balance Card ── */}
        <section className={`p-6 rounded-[2.5rem] border relative overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-[#1a1e24] to-[#0a0d10] border-white/5'
            : 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700'
        }`}>
          {/* Glow orb */}
          <div className="absolute top-0 right-0 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle, #FFB80020 0%, transparent 70%)' }} />

          <div className="relative z-10">
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                Total Equity
                <button onClick={() => setHideBalance(h => !h)} className="text-gray-500 hover:text-white transition-colors">
                  {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              {/* Currency selector */}
              <div className="relative">
                <button onClick={() => setShowCurrencyPicker(v => !v)}
                  className="bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1.5 rounded-xl flex items-center gap-2 active:scale-90 transition-all">
                  <img src={`https://flagcdn.com/w20/${selectedCurrency.flag}.png`} alt={selectedCurrency.code}
                    className="w-4 h-3 object-cover rounded-sm" />
                  <span className="text-[10px] font-black text-yellow-500">{selectedCurrency.code}</span>
                  <RefreshCw size={9} className="text-yellow-500/60" />
                </button>

                {/* Currency Dropdown */}
                {showCurrencyPicker && (
                  <div className={`absolute right-0 top-9 rounded-2xl border shadow-2xl overflow-hidden z-50 w-44 ${
                    isDark ? 'bg-[#0d0f12] border-white/8' : 'bg-white border-gray-200'
                  }`}>
                    {CURRENCIES.map(cur => (
                      <button key={cur.code}
                        onClick={() => { setSelectedCurrency(cur); setShowCurrencyPicker(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-b last:border-0 transition-colors text-left ${
                          isDark ? 'border-white/5 hover:bg-white/[0.04]' : 'border-gray-100 hover:bg-gray-50'
                        } ${selectedCurrency.code === cur.code ? isDark ? 'bg-yellow-500/5' : 'bg-yellow-50' : ''}`}>
                        <img src={`https://flagcdn.com/w20/${cur.flag}.png`} alt={cur.code}
                          className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
                        <span className="text-sm font-black">{cur.code}</span>
                        {selectedCurrency.code === cur.code && (
                          <Check size={12} className="ml-auto text-yellow-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Balance */}
            <div className="mb-5">
              <h2 className="text-4xl font-black tracking-tighter tabular-nums text-white leading-none">
                {fmtCurrency(balanceUSD)}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-500/15 text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                  +2.41% Today
                </span>
                <span className="text-gray-500 text-[9px] font-bold uppercase tracking-tight">
                  Profit {fmtCurrency(1241.80)}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            {!hideBalance && (
              <div className="flex mb-6 py-3 border-y border-white/8">
                <div className="flex-1 px-1">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Trading</p>
                  <p className="text-[11px] font-black italic text-white leading-none">{fmtCurrency(breakdownUSD.trading)}</p>
                </div>
                <div className="flex-1 border-x border-white/8 px-4">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Locked</p>
                  <p className="text-[11px] font-black italic text-white leading-none">{fmtCurrency(breakdownUSD.locked)}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Network</p>
                  <p className="text-[11px] font-black italic text-white leading-none">{fmtCurrency(breakdownUSD.network)}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/account')}
                className="bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-yellow-500/20">
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
              className="flex flex-col items-center gap-2 active:scale-90 transition-transform group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${css.cardAlt} group-hover:border-opacity-60`}
                style={{ '--tw-border-opacity': 1, borderColor: `${color}18` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${css.sub}`}>{label}</span>
            </button>
          ))}
        </section>

        {/* ── MMM Credit Banner ── */}
        <section onClick={() => navigate('/loans')}
          className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-yellow-500/8 p-5 flex justify-between items-center cursor-pointer active:scale-[0.99] transition-all group hover:border-yellow-500/40">
          <div className="absolute inset-y-0 left-0 w-1 bg-yellow-500 rounded-r" />
          <div className="pl-3">
            <p className="text-yellow-500 font-black text-sm uppercase tracking-tight italic">Instant MMM-Credit</p>
            <p className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${css.muted}`}>
              Borrow up to {fmtCurrency(200)}
            </p>
          </div>
          <button className="bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/30">
            Apply Now
          </button>
        </section>

        {/* ── Market Pulse — Live ── */}
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
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${css.cardAlt} hover:border-yellow-500/15`}>
                  <div className="flex items-center gap-3">
                    <CoinLogo ticker={coin.ticker} size={38} />
                    <div>
                      <p className={`font-black text-sm uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {coin.label}
                      </p>
                      <p className={`text-[10px] font-bold ${css.muted}`}>{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm tabular-nums tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {fmtLivePrice(live?.rawPrice)}
                    </p>
                    <p className={`text-[10px] font-black ${live?.positive ? 'text-green-400' : 'text-red-400'}`}>
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
        .animate-marquee { animation: marquee 24s linear infinite; }
      `}} />
    </div>
  );
}
