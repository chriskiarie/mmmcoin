import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, ArrowDownLeft, Zap, Shield, 
  Bell, Search, Eye, EyeOff, Megaphone, 
  Banknote, Landmark, User, ChevronRight, Hexagon,
  Trophy, RefreshCw, PieChart, Users // Added Users here
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);
  const [currency, setCurrency] = useState('KES'); 

  // Mock Data
  const exchangeRate = 130.50; 
  const balanceInKES = 6850200;

  // Breakdown Data
  const breakdown = {
    available: balanceInKES * 0.7,
    loaned: balanceInKES * 0.2,
    referrals: balanceInKES * 0.1
  };

  const toggleCurrency = () => setCurrency(prev => prev === 'KES' ? 'USD' : 'KES');

  const formatDisplay = (val) => {
    if (hideBalance) return "••••••";
    if (currency === 'KES') return `KES ${val.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
    return `$${(val / exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };

  return (
    <div className="min-h-screen bg-[#060708] text-white pb-28 font-sans overflow-x-hidden">
      
      {/* 1. Animated News Ribbon */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-2 relative overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500 tracking-widest">
                <Megaphone size={12} /> Referral Bonus: Invite friends & earn 5,000 KES!
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest">
                <Trophy size={12} className="text-yellow-500" /> New Listing: SOL/KES live
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Header */}
      <header className="p-5 sticky top-0 bg-[#060708]/90 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <Hexagon size={28} className="text-yellow-500 fill-yellow-500/10" strokeWidth={2.5} />
              <span className="absolute text-[10px] font-black text-yellow-500 tracking-tighter uppercase">MMM</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase leading-none">
              MMM<span className="text-yellow-500 text-lg">COIN</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Search size={20} />
            <div className="relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-[#060708]"></span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-2 pr-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-all" onClick={() => navigate('/account')}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-200 flex items-center justify-center">
              <User size={18} className="text-[#060708] font-bold" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Portfolio Account</p>
              <p className="text-sm font-black tracking-tight uppercase italic leading-none">Verified Trader</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-600" />
        </div>
      </header>

      <main className="p-5 space-y-8 animate-in fade-in duration-500">
        
        {/* 3. Main Asset Card */}
        <section className="bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                Total Equity
                <button onClick={() => setHideBalance(!hideBalance)} className="ml-1 text-gray-500 hover:text-white transition-colors">
                  {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              <button 
                onClick={toggleCurrency}
                className="bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-90"
              >
                <RefreshCw size={10} className="text-yellow-500" />
                <span className="text-[10px] font-black text-yellow-500">{currency}</span>
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-4xl font-black tracking-tighter tabular-nums leading-none">
                {formatDisplay(balanceInKES)}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">+2.4% Today</span>
                <span className="text-gray-600 text-[9px] font-bold uppercase tracking-tighter">Profit {formatDisplay(162040)}</span>
              </div>
            </div>

            {/* Asset Breakdown Preview */}
            {!hideBalance && (
              <div className="flex gap-4 mb-8 py-3 border-y border-white/5">
                <div className="flex-1">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Trading</p>
                  <p className="text-[11px] font-black italic leading-none">{formatDisplay(breakdown.available)}</p>
                </div>
                <div className="flex-1 border-x border-white/5 px-4">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Locked</p>
                  <p className="text-[11px] font-black italic leading-none">{formatDisplay(breakdown.loaned)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Network</p>
                  <p className="text-[11px] font-black italic leading-none">{formatDisplay(breakdown.referrals)}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 active:scale-95">
                <ArrowDownLeft size={18} strokeWidth={3} /> Deposit
              </button>
              <button className="bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:bg-black hover:text-yellow-500 active:scale-95 group">
                <ArrowUpRight size={18} strokeWidth={3} className="group-hover:text-yellow-500 transition-colors" /> Withdraw
              </button>
            </div>
          </div>
        </section>

        {/* 4. Financial Services Grid */}
        <section className="grid grid-cols-4 gap-4">
          {[
            { label: 'Events', icon: <Trophy />, color: 'text-orange-400' },
            { label: 'Loans', icon: <Banknote />, color: 'text-green-400' },
            { label: 'Network', icon: <Users />, color: 'text-blue-400' }, // Now defined
            { label: 'Markets', icon: <Zap />, color: 'text-yellow-400' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group active:scale-90 transition-transform">
              <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-yellow-500/50 transition-all">
                {React.cloneElement(item.icon, { size: 22, className: item.color })}
              </div>
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-tighter">{item.label}</span>
            </div>
          ))}
        </section>

        {/* 5. Instant MMM-Credit Banner */}
        <section className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-3xl flex justify-between items-center relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-yellow-500"></div>
          <div>
            <h3 className="text-yellow-500 font-black text-sm uppercase tracking-tight italic leading-tight">Instant MMM-Credit</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Borrow up to 30,000 KES</p>
          </div>
          <button className="bg-yellow-500 text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-lg shadow-yellow-500/20">Apply</button>
        </section>

        {/* 6. Market Pulse */}
        <section>
          <div className="flex justify-between items-end mb-5 px-1">
            <h3 className="text-lg font-black uppercase italic tracking-tighter">Market Pulse</h3>
            <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:underline" onClick={() => navigate('/markets')}>View All</span>
          </div>
          <div className="space-y-3">
            {[`BTC/${currency}`, `ETH/${currency}`].map((pair, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center font-black text-[10px] italic">{pair[0]}</div>
                  <span className="font-black text-sm uppercase tracking-tight">{pair}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm tabular-nums tracking-tighter">
                    {currency === 'KES' ? '8,950,241' : '68,584.20'}
                  </p>
                  <p className="text-[10px] font-black text-green-500">+2.41%</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}} />
    </div>
  );
}