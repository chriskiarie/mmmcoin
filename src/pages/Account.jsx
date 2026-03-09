import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, ShieldCheck, ChevronRight, 
  Users, Trophy, Zap, Banknote, 
  CreditCard, Wallet, RefreshCw, LogOut,
  X, ArrowUpRight, ArrowDownLeft,
  PieChart, Activity, Gift, Edit3, Save,
  Copy, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function Account() {
  const navigate = useNavigate();
  
  const [currency, setCurrency]       = useState('KES');
  const [activeModal, setActiveModal] = useState(null);
  const [timer, setTimer]             = useState(5);
  const [alloc, setAlloc]             = useState({ trading: 70, locked: 20, referral: 10 });
  const [copied, setCopied]           = useState(false);

  // Deposit form state
  const [depositAmount, setDepositAmount]   = useState('');
  const [depositMethod, setDepositMethod]   = useState('mpesa');
  const [depositPhone, setDepositPhone]     = useState('');
  const [depositStatus, setDepositStatus]   = useState(null); // null | 'pending' | 'success'

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa');
  const [withdrawPhone, setWithdrawPhone]   = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(null);

  const exchangeRate    = 130.50;
  const totalBalanceKES = 6850200;

  const accountDetails = {
    email: 'trader.mmm@example.com',
    uid:   '88239102',
    tradingVolumeUSD:  450,
    totalDepositedUSD: 85,
    loanInterest:      '4.2%',
    referralList: [
      { id: 1, name: 'Kevin Omari', date: '2026-02-10', status: 'Active' },
      { id: 2, name: 'Sarah J.',    date: '2026-01-28', status: 'Pending' },
      { id: 3, name: 'Mike Tyson',  date: '2026-01-15', status: 'Active' },
    ],
    eventList: [
      { id: 1, name: 'SOL Summer Sprint',  date: 'Open',              joined: true },
      { id: 2, name: 'KES Deposit Bonus',  date: 'Closed 2026-02-01', joined: false },
    ],
  };

  // Allocation edit warning timer
  useEffect(() => {
    let interval;
    if (activeModal === 'warning' && timer > 0) {
      interval = setInterval(() => setTimer(p => p - 1), 1000);
    } else if (activeModal === 'warning' && timer === 0) {
      setActiveModal('edit_allocation');
      setTimer(5);
    }
    return () => clearInterval(interval);
  }, [activeModal, timer]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!activeModal) {
      setDepositStatus(null);
      setWithdrawStatus(null);
      setDepositAmount('');
      setWithdrawAmount('');
    }
  }, [activeModal]);

  const handleSliderChange = (key, value) => {
    const val = parseInt(value);
    setAlloc(prev => {
      const diff = val - prev[key];
      const newState = { ...prev, [key]: val };
      if (key !== 'trading') newState.trading = Math.max(0, prev.trading - diff);
      else newState.locked = Math.max(0, prev.locked - diff);
      return newState;
    });
  };

  const formatVal = (kesAmount) => {
    if (currency === 'KES') return `KES ${kesAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    return `$${(kesAmount / exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCopyUID = () => {
    navigator.clipboard?.writeText(accountDetails.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = () => {
    if (!depositAmount || !depositPhone) return;
    setDepositStatus('pending');
    // Simulate STK push delay
    setTimeout(() => setDepositStatus('success'), 2500);
  };

  const handleWithdrawSubmit = () => {
    if (!withdrawAmount || !withdrawPhone) return;
    setWithdrawStatus('pending');
    setTimeout(() => setWithdrawStatus('success'), 2500);
  };

  const PAYMENT_METHODS = [
    { id: 'mpesa',  label: 'M-Pesa',      sub: 'Instant' },
    { id: 'bank',   label: 'Bank Transfer', sub: '1-3 Days' },
    { id: 'crypto', label: 'Crypto',        sub: 'On-chain' },
  ];

  return (
    <div className="min-h-screen bg-[#060708] text-white pb-10 font-sans relative overflow-x-hidden">
      
      {/* ── Header ── */}
      <header className="p-5 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#060708]/90 backdrop-blur-xl z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black uppercase tracking-tighter italic">
            Account <span className="text-yellow-500">Center</span>
          </h1>
        </div>
        <button
          onClick={() => setCurrency(p => p === 'KES' ? 'USD' : 'KES')}
          className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all"
        >
          <RefreshCw size={12} className="text-yellow-500" />
          <span className="text-[10px] font-black text-yellow-500">{currency}</span>
        </button>
      </header>

      <main className="p-5 space-y-6">

        {/* ── Profile ── */}
        <section className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-5 rounded-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <User size={28} className="text-[#060708]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-black text-sm tracking-tight italic">{accountDetails.email}</p>
                <ShieldCheck size={14} className="text-yellow-500" />
              </div>
              <button
                onClick={handleCopyUID}
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-yellow-500 transition-colors"
              >
                UID: {accountDetails.uid}
                {copied ? <CheckCircle2 size={11} className="text-green-500" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </section>

        {/* ── Allocation ── */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 relative">
          <button
            onClick={() => setActiveModal('warning')}
            className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-yellow-500 hover:text-black transition-all"
          >
            <Edit3 size={14} />
          </button>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
            <PieChart size={14} className="text-yellow-500" /> Detailed Allocation
          </h3>
          <div className="space-y-4">
            <AssetRow icon={<Activity size={16} className="text-blue-400" />}   label="Trading Capital"    value={formatVal(totalBalanceKES * (alloc.trading  / 100))} percentage={`${alloc.trading}%`}  />
            <AssetRow icon={<ShieldCheck size={16} className="text-purple-400"/>} label="Locked Collateral"  value={formatVal(totalBalanceKES * (alloc.locked   / 100))} percentage={`${alloc.locked}%`}   />
            <AssetRow icon={<Gift size={16} className="text-orange-400" />}      label="Referral Earnings"  value={formatVal(totalBalanceKES * (alloc.referral / 100))} percentage={`${alloc.referral}%`} />
          </div>
        </section>

        {/* ── Action Hub ── */}
        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveModal('deposit')}
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-5 rounded-2xl transition-all hover:bg-yellow-500 hover:text-black active:scale-95"
          >
            <ArrowDownLeft size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Deposit</span>
          </button>
          <button
            onClick={() => setActiveModal('withdraw')}
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-5 rounded-2xl transition-all hover:bg-black hover:text-yellow-500 active:scale-95"
          >
            <ArrowUpRight size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Withdraw</span>
          </button>
        </section>

        {/* ── Loan Eligibility ── */}
        <section className="bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-6 flex items-center gap-2 italic">
            <CreditCard size={16} /> Loan Eligibility Status
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className="text-gray-400">Trading Milestone</span>
                <span className="text-white tabular-nums">
                  {formatVal(accountDetails.tradingVolumeUSD * exchangeRate)} / {formatVal(1000 * exchangeRate)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${accountDetails.totalDepositedUSD >= 10 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Wallet size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-tight">Minimum Deposit Rule</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mt-0.5">
                    Status: {accountDetails.totalDepositedUSD >= 10 ? 'Eligible' : 'Action Required'}
                  </p>
                  <p className="text-[10px] text-yellow-500/80 font-medium mt-2 leading-relaxed italic">
                    Maintain at least {formatVal(10 * exchangeRate)} to keep loan active.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-white/5">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Annual Interest</span>
              <span className="text-sm font-black text-green-500">
                {accountDetails.loanInterest} <span className="text-[8px] text-gray-600 font-bold">APR</span>
              </span>
            </div>
          </div>
        </section>

        {/* ── Social Cards ── */}
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => setActiveModal('referrals')} className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl cursor-pointer active:scale-95 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-3 text-blue-400">
              <Users size={18} />
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-tight">Referrals</span>
            </div>
            <p className="text-2xl font-black italic">{accountDetails.referralList.length}</p>
            <p className="text-[10px] font-bold text-yellow-500 mt-1 uppercase">Details →</p>
          </div>
          <div onClick={() => setActiveModal('events')} className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl cursor-pointer active:scale-95 transition-all hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-3 text-orange-400">
              <Trophy size={18} />
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-tight">Events</span>
            </div>
            <p className="text-2xl font-black italic">{accountDetails.eventList.length}</p>
            <p className="text-[10px] font-bold text-yellow-500 mt-1 uppercase">History →</p>
          </div>
        </div>

        {/* ── Settings ── */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
          <SettingsItem icon={<ShieldCheck size={18} className="text-green-500" />}  label="Security Center" />
          <SettingsItem icon={<Zap size={18} className="text-purple-500" />}          label="Trading Preferences" />
          <button className="w-full flex items-center justify-center gap-2 p-5 text-red-500 font-black uppercase text-[11px] tracking-widest border-t border-white/5 hover:bg-red-500/5 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </section>
      </main>

      {/* ── Modal Overlay ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-0 pb-0">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-md bg-[#0b0e11] border-x border-t border-white/10 rounded-t-[2.5rem] p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-lg font-black uppercase italic tracking-tighter">
                {activeModal === 'referrals'      && 'Network Details'}
                {activeModal === 'events'         && 'Event History'}
                {activeModal === 'warning'        && 'Security Protocol'}
                {activeModal === 'edit_allocation'&& 'Adjust Capital'}
                {activeModal === 'deposit'        && 'Fund Account'}
                {activeModal === 'withdraw'       && 'Withdraw Funds'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pb-8 pr-1 flex-1">

              {/* ── REFERRALS ── */}
              {activeModal === 'referrals' && accountDetails.referralList.map(ref => (
                <div key={ref.id} className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs uppercase">
                      {ref.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black italic uppercase leading-none">{ref.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Joined {ref.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${ref.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {ref.status}
                  </span>
                </div>
              ))}

              {/* ── EVENTS ── */}
              {activeModal === 'events' && accountDetails.eventList.map(ev => (
                <div key={ev.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-black italic uppercase leading-none">{ev.name}</p>
                    <span className="text-[10px] text-gray-500 font-bold uppercase mt-1 block">{ev.date}</span>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${ev.joined ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500 text-black'}`}>
                    {ev.joined ? 'Active' : 'Join'}
                  </button>
                </div>
              ))}

              {/* ── SECURITY WARNING ── */}
              {activeModal === 'warning' && (
                <div className="text-center py-6 space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                      <circle
                        cx="48" cy="48" r="44"
                        stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray="276"
                        strokeDashoffset={276 - (276 * timer / 5)}
                        className="text-yellow-500 transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-2xl italic">{timer}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase leading-relaxed px-6">
                    Asset reallocation affects trading margin and collateral ratios in real-time.
                  </p>
                </div>
              )}

              {/* ── ALLOCATION SLIDERS ── */}
              {activeModal === 'edit_allocation' && (
                <div className="space-y-8 py-4">
                  <AssetSlider label="Trading"    icon={<Activity size={14}/>}    percentage={alloc.trading}  color="text-blue-400"   onChange={v => handleSliderChange('trading', v)} />
                  <AssetSlider label="Collateral" icon={<ShieldCheck size={14}/>} percentage={alloc.locked}   color="text-purple-400" onChange={v => handleSliderChange('locked', v)} />
                  <AssetSlider label="Referrals"  icon={<Gift size={14}/>}        percentage={alloc.referral} color="text-orange-400" onChange={v => handleSliderChange('referral', v)} />
                  <div className="text-center text-[10px] font-black text-gray-600 uppercase">
                    Total: {alloc.trading + alloc.locked + alloc.referral}%
                  </div>
                  <button onClick={() => setActiveModal(null)} className="w-full bg-yellow-500 text-black py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic active:scale-95">
                    <Save size={18} /> Update Allocation
                  </button>
                </div>
              )}

              {/* ── DEPOSIT FORM ── */}
              {activeModal === 'deposit' && (
                <>
                  {depositStatus === 'success' ? (
                    <div className="text-center py-10 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-green-500" />
                      </div>
                      <p className="font-black uppercase text-sm tracking-widest">Deposit Initiated</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold text-center leading-relaxed px-4">
                        Check your phone for the {depositMethod === 'mpesa' ? 'M-Pesa STK push' : 'payment prompt'}
                      </p>
                      <button onClick={() => setActiveModal(null)} className="mt-4 bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black uppercase text-xs active:scale-95">Done</button>
                    </div>
                  ) : depositStatus === 'pending' ? (
                    <div className="text-center py-12 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin" />
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Processing Request...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Method selector */}
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setDepositMethod(m.id)}
                            className={`flex flex-col items-center py-3 px-2 rounded-2xl border text-center transition-all ${
                              depositMethod === m.id
                                ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-500'
                                : 'border-white/5 bg-white/[0.02] text-gray-500'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase">{m.label}</span>
                            <span className="text-[8px] font-bold mt-0.5 opacity-60">{m.sub}</span>
                          </button>
                        ))}
                      </div>

                      {/* Amount */}
                      <div className="bg-black border border-white/8 rounded-2xl p-4 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Amount (KES)</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          className="bg-transparent text-right font-black focus:outline-none text-2xl w-36 text-white italic"
                        />
                      </div>

                      {/* Quick amounts */}
                      <div className="grid grid-cols-4 gap-2">
                        {[500, 1000, 5000, 10000].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setDepositAmount(String(amt))}
                            className="bg-white/5 border border-white/5 py-2 rounded-xl text-[10px] font-black text-gray-500 hover:border-yellow-500/40 hover:text-yellow-500 transition-all"
                          >
                            {amt >= 1000 ? `${amt / 1000}K` : amt}
                          </button>
                        ))}
                      </div>

                      {/* Phone number */}
                      <div className="bg-black border border-white/8 rounded-2xl p-4 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                          {depositMethod === 'crypto' ? 'Wallet Address' : 'Phone Number'}
                        </span>
                        <input
                          type={depositMethod === 'crypto' ? 'text' : 'tel'}
                          placeholder={depositMethod === 'crypto' ? '0x...' : '07XX XXX XXX'}
                          value={depositPhone}
                          onChange={e => setDepositPhone(e.target.value)}
                          className="bg-transparent text-right font-black focus:outline-none text-sm w-40 text-white"
                        />
                      </div>

                      {/* Validation warning */}
                      {depositAmount && parseFloat(depositAmount) < 100 && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                          <AlertCircle size={14} />
                          Minimum deposit is KES 100
                        </div>
                      )}

                      <button
                        onClick={handleDepositSubmit}
                        disabled={!depositAmount || !depositPhone || parseFloat(depositAmount) < 100}
                        className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase italic text-sm tracking-widest active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ArrowDownLeft size={16} className="inline mr-2" />
                        Deposit {depositAmount ? `KES ${parseFloat(depositAmount).toLocaleString()}` : ''}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── WITHDRAW FORM ── */}
              {activeModal === 'withdraw' && (
                <>
                  {withdrawStatus === 'success' ? (
                    <div className="text-center py-10 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-green-500" />
                      </div>
                      <p className="font-black uppercase text-sm tracking-widest">Withdrawal Submitted</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold text-center leading-relaxed px-4">
                        Your funds will arrive within the processing window
                      </p>
                      <button onClick={() => setActiveModal(null)} className="mt-4 bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black uppercase text-xs active:scale-95">Done</button>
                    </div>
                  ) : withdrawStatus === 'pending' ? (
                    <div className="text-center py-12 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin" />
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Processing Withdrawal...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Available balance */}
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available</span>
                        <span className="font-black text-sm text-yellow-500 italic">KES 4,795,140</span>
                      </div>

                      {/* Method selector */}
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setWithdrawMethod(m.id)}
                            className={`flex flex-col items-center py-3 px-2 rounded-2xl border text-center transition-all ${
                              withdrawMethod === m.id
                                ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-500'
                                : 'border-white/5 bg-white/[0.02] text-gray-500'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase">{m.label}</span>
                            <span className="text-[8px] font-bold mt-0.5 opacity-60">{m.sub}</span>
                          </button>
                        ))}
                      </div>

                      {/* Amount */}
                      <div className="bg-black border border-white/8 rounded-2xl p-4 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Amount (KES)</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          className="bg-transparent text-right font-black focus:outline-none text-2xl w-36 text-white italic"
                        />
                      </div>

                      {/* Destination */}
                      <div className="bg-black border border-white/8 rounded-2xl p-4 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                          {withdrawMethod === 'crypto' ? 'Wallet Address' : 'Phone / Account'}
                        </span>
                        <input
                          type="text"
                          placeholder={withdrawMethod === 'crypto' ? '0x...' : '07XX XXX XXX'}
                          value={withdrawPhone}
                          onChange={e => setWithdrawPhone(e.target.value)}
                          className="bg-transparent text-right font-black focus:outline-none text-sm w-40 text-white"
                        />
                      </div>

                      <button
                        onClick={handleWithdrawSubmit}
                        disabled={!withdrawAmount || !withdrawPhone}
                        className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase italic text-sm tracking-widest active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                      >
                        <ArrowUpRight size={16} className="inline mr-2" />
                        Withdraw {withdrawAmount ? `KES ${parseFloat(withdrawAmount).toLocaleString()}` : ''}
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

function AssetSlider({ label, icon, percentage, onChange, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-black italic">{percentage}%</span>
      </div>
      <input
        type="range" min="0" max="100" value={percentage}
        onChange={e => onChange(e.target.value)}
        className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-yellow-500 cursor-pointer"
      />
    </div>
  );
}

function AssetRow({ icon, label, value, percentage }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-tight italic text-white/90 group-hover:text-yellow-500 transition-colors">{label}</p>
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.1em]">{percentage} Allocation</p>
        </div>
      </div>
      <p className="text-sm font-black tabular-nums">{value}</p>
    </div>
  );
}

function SettingsItem({ icon, label }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-tight group-hover:text-yellow-500 transition-colors">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-700" />
    </div>
  );
}
