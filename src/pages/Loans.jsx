import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, CheckCircle2, AlertCircle,
  CreditCard, TrendingUp, Clock, Shield, Zap,
  DollarSign, Calendar, ArrowDownLeft, X, Info
} from 'lucide-react';

// ─── Loan Rate Table (from business model) ────────────────────────────────────
const RATE_TIERS = [
  { minUSD: 10,   maxUSD: 19,  minKES: 1305,   maxKES: 2479,  rate: 10, label: '$10 – $19'   },
  { minUSD: 20,   maxUSD: 29,  minKES: 2610,   maxKES: 3784,  rate: 15, label: '$20 – $29'   },
  { minUSD: 30,   maxUSD: 49,  minKES: 3915,   maxKES: 6374,  rate: 20, label: '$30 – $49'   },
  { minUSD: 50,   maxUSD: 99,  minKES: 6525,   maxKES: 12919, rate: 25, label: '$50 – $99'   },
  { minUSD: 100,  maxUSD: 199, minKES: 13050,  maxKES: 25969, rate: 30, label: '$100 – $199' },
  { minUSD: 200,  maxUSD: 9999,minKES: 26100,  maxKES: Infinity,rate:37.5,label: '$200+'      },
];

const TERMS = [
  { days: 7,  label: '7 Days',  urgencyBonus: 0  },
  { days: 14, label: '14 Days', urgencyBonus: 2  },
  { days: 30, label: '30 Days', urgencyBonus: 5  },
  { days: 60, label: '60 Days', urgencyBonus: 8  },
];

const EXCHANGE_RATE = 130.5;

function getRateTier(amountKES) {
  const usd = amountKES / EXCHANGE_RATE;
  return RATE_TIERS.find(t => usd >= t.minUSD && usd <= t.maxUSD) || RATE_TIERS[RATE_TIERS.length - 1];
}

function calcRepayment(amountKES, ratePercent, termDays) {
  const totalRate = ratePercent + (termDays >= 30 ? 5 : termDays >= 14 ? 2 : 0);
  const interest  = amountKES * (totalRate / 100);
  return {
    principal: amountKES,
    interest:  Math.round(interest),
    total:     Math.round(amountKES + interest),
    rate:      totalRate,
    dailyRate: (totalRate / termDays).toFixed(2),
  };
}

function fmt(n) { return `KES ${Math.round(n).toLocaleString()}`; }

// ─── Steps ────────────────────────────────────────────────────────────────────
// 0: landing   1: calculator   2: apply   3: processing   4: active loan

export default function Loans() {
  const navigate = useNavigate();
  const [step,         setStep]         = useState(0);
  const [amountKES,    setAmountKES]    = useState(5000);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[1]);
  const [phone,        setPhone]        = useState('');
  const [agreed,       setAgreed]       = useState(false);
  const [progress,     setProgress]     = useState(0);

  // Simulate an active loan state (toggle for demo)
  const [activeLoan, setActiveLoan]    = useState(null);

  const tier       = getRateTier(amountKES);
  const repayment  = calcRepayment(amountKES, tier.rate, selectedTerm.days);

  // Processing animation
  useEffect(() => {
    if (step !== 3) return;
    let pct = 0;
    const id = setInterval(() => {
      pct += Math.random() * 12 + 4;
      setProgress(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(id);
        setTimeout(() => {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + selectedTerm.days);
          setActiveLoan({
            principal: amountKES,
            total:     repayment.total,
            interest:  repayment.interest,
            rate:      repayment.rate,
            term:      selectedTerm,
            issued:    new Date().toLocaleDateString('en-KE'),
            due:       dueDate.toLocaleDateString('en-KE'),
            paid:      0,
            daysLeft:  selectedTerm.days,
          });
          setStep(4);
        }, 400);
      }
    }, 220);
    return () => clearInterval(id);
  }, [step]); // eslint-disable-line

  // ── Repayment schedule ───────────────────────────────────────────────────
  const schedule = activeLoan ? Array.from({ length: Math.min(activeLoan.term.days, 4) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + Math.round((activeLoan.term.days / 4) * (i + 1)));
    return {
      date:   d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      amount: Math.round(activeLoan.total / 4),
      paid:   i < activeLoan.paid,
    };
  }) : [];

  // ─── RENDER ──────────────────────────────────────────────────────────────

  // ── LANDING (Step 0) ─────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen bg-[#060708] text-white font-sans pb-32">
      <header className="p-5 flex items-center gap-4 border-b border-white/5 sticky top-0 bg-[#060708]/90 backdrop-blur-xl z-10">
        <button onClick={() => navigate('/')} className="p-1.5 hover:bg-white/5 rounded-full transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-lg font-black uppercase tracking-tighter italic">MMM <span className="text-yellow-500">Credit</span></h1>
      </header>

      <main className="p-5 space-y-6">

        {/* Hero */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-[2.5rem] p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-3">Instant Access</p>
          <h2 className="text-3xl font-black italic tracking-tighter leading-tight mb-2">
            Get up to<br /><span className="text-yellow-500">KES 26,000</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-6">
            Disbursed in minutes · Flexible terms · No paperwork
          </p>
          <button
            onClick={() => setStep(1)}
            className="bg-yellow-500 text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all shadow-lg shadow-yellow-500/30"
          >
            Apply Now →
          </button>
        </div>

        {/* Rate Table */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-yellow-500" /> Loan Rate Schedule
          </h3>
          <div className="rounded-3xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-3 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-gray-600 bg-white/[0.02] border-b border-white/5">
              <span>Amount</span><span className="text-center">Rate</span><span className="text-right">You Repay</span>
            </div>
            {RATE_TIERS.map((t, i) => {
              const repay = t.maxUSD < 9999
                ? fmt(t.minKES * (1 + t.rate / 100))
                : 'Custom';
              return (
                <div key={i} className="grid grid-cols-3 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-black italic">{t.label}</span>
                  <span className="text-center text-sm font-black text-yellow-500">{t.rate}%</span>
                  <span className="text-right text-sm font-black text-green-400">{repay}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-3 px-1">
            * Rates shown for minimum amount per tier. Final rate based on term selected.
          </p>
        </section>

        {/* Feature pills */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { icon: <Zap size={16} />,      label: 'Instant Payout',  sub: 'M-Pesa within 2 min',    color: 'text-yellow-500' },
            { icon: <Shield size={16} />,   label: 'No Collateral',   sub: 'Eligibility based only',  color: 'text-green-500' },
            { icon: <Clock size={16} />,    label: 'Flexible Terms',  sub: '7 to 60 days',            color: 'text-blue-400' },
            { icon: <TrendingUp size={16}/>,label: 'Build Credit',    sub: 'Unlock higher limits',    color: 'text-purple-400' },
          ].map((f, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className={`mb-2 ${f.color}`}>{f.icon}</div>
              <p className="text-[11px] font-black uppercase tracking-tight">{f.label}</p>
              <p className="text-[9px] text-gray-600 font-bold mt-0.5">{f.sub}</p>
            </div>
          ))}
        </section>

        {/* Eligibility check */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" /> Your Eligibility
          </h3>
          {[
            { label: 'Account Verified',        status: true  },
            { label: 'Minimum deposit met',      status: true  },
            { label: 'Trading milestone (45%)',  status: false },
            { label: 'No active defaults',       status: true  },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-[11px] font-bold uppercase text-gray-400">{item.label}</span>
              {item.status
                ? <CheckCircle2 size={16} className="text-green-500" />
                : <div className="flex items-center gap-1"><AlertCircle size={16} className="text-yellow-500" /><span className="text-[9px] text-yellow-500 font-black uppercase">Pending</span></div>
              }
            </div>
          ))}
        </section>

      </main>
    </div>
  );

  // ── CALCULATOR (Step 1) ──────────────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-[#060708] text-white font-sans pb-32">
      <header className="p-5 flex items-center gap-4 border-b border-white/5 sticky top-0 bg-[#060708]/90 backdrop-blur-xl z-10">
        <button onClick={() => setStep(0)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-lg font-black uppercase tracking-tighter italic">Loan <span className="text-yellow-500">Calculator</span></h1>
      </header>

      <main className="p-5 space-y-6">

        {/* Amount slider */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Loan Amount</p>
            <p className="text-xs font-bold text-gray-600">${(amountKES / EXCHANGE_RATE).toFixed(0)} USD</p>
          </div>
          <div className="text-3xl font-black italic tracking-tighter mb-5 text-yellow-500">
            {fmt(amountKES)}
          </div>
          <input
            type="range" min="1305" max="26100" step="250" value={amountKES}
            onChange={e => setAmountKES(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none accent-yellow-500 cursor-pointer mb-4"
          />
          <div className="grid grid-cols-4 gap-2">
            {[1305, 3915, 6525, 13050].map(amt => (
              <button key={amt} onClick={() => setAmountKES(amt)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all active:scale-95 ${
                  amountKES === amt ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-gray-500 border-white/5 hover:border-yellow-500/30'
                }`}>
                {amt >= 1000 ? `${amt/1000}K` : amt}
              </button>
            ))}
          </div>
        </section>

        {/* Term selector */}
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 px-1">Repayment Term</p>
          <div className="grid grid-cols-4 gap-2">
            {TERMS.map(term => (
              <button key={term.days} onClick={() => setSelectedTerm(term)}
                className={`py-3.5 rounded-2xl flex flex-col items-center gap-1 border transition-all active:scale-95 ${
                  selectedTerm.days === term.days ? 'bg-white/10 border-yellow-500/50 text-yellow-500' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10'
                }`}>
                <span className="text-sm font-black italic">{term.days}</span>
                <span className="text-[8px] font-black uppercase">days</span>
              </button>
            ))}
          </div>
        </section>

        {/* Repayment breakdown */}
        <section className="bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] border border-white/5 rounded-3xl p-6 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Repayment Summary</h3>

          <div className="space-y-3">
            {[
              { label: 'Principal',      value: fmt(repayment.principal), color: 'text-white' },
              { label: `Interest (${repayment.rate}%)`, value: fmt(repayment.interest), color: 'text-yellow-500' },
              { label: 'Daily Rate',     value: `${repayment.dailyRate}%`, color: 'text-gray-400' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wide">{row.label}</span>
                <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total Repayment</span>
            <span className="text-xl font-black italic text-yellow-500">{fmt(repayment.total)}</span>
          </div>

          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider leading-relaxed">
            Due date: {selectedTerm.days} days from disbursement · Late fee applies after due date
          </p>
        </section>

        <button
          onClick={() => setStep(2)}
          className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
        >
          Proceed to Apply →
        </button>

      </main>
    </div>
  );

  // ── APPLICATION (Step 2) ─────────────────────────────────────────────────
  if (step === 2) return (
    <div className="min-h-screen bg-[#060708] text-white font-sans pb-32">
      <header className="p-5 flex items-center gap-4 border-b border-white/5 sticky top-0 bg-[#060708]/90 backdrop-blur-xl z-10">
        <button onClick={() => setStep(1)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-lg font-black uppercase tracking-tighter italic">Confirm <span className="text-yellow-500">Application</span></h1>
      </header>

      <main className="p-5 space-y-5">

        {/* Loan summary card */}
        <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-3xl p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">You Receive</p>
              <p className="text-lg font-black italic text-yellow-500">{fmt(repayment.principal)}</p>
            </div>
            <div className="border-x border-yellow-500/20">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Interest</p>
              <p className="text-lg font-black italic">{repayment.rate}%</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Term</p>
              <p className="text-lg font-black italic">{selectedTerm.label}</p>
            </div>
          </div>
        </div>

        {/* Phone field */}
        <div className="bg-black border border-white/8 rounded-2xl p-5 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">M-Pesa Number</p>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="07XX XXX XXX"
              className="bg-transparent font-black focus:outline-none text-lg text-white w-44"
            />
          </div>
          <div className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20 uppercase">
            M-Pesa
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setAgreed(!agreed)}
              className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                agreed ? 'bg-yellow-500 border-yellow-500' : 'border-gray-700'
              }`}
            >
              {agreed && <span className="text-black font-black text-xs">✓</span>}
            </button>
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
              I agree to repay <strong className="text-white">{fmt(repayment.total)}</strong> by the due date.
              Late repayments attract a 5% penalty per week. MMM Coin may offset loans against trading balance.
            </p>
          </div>
        </div>

        {/* Total repayment reminder */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <Info size={18} className="text-yellow-500 flex-shrink-0" />
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
            Total repayment: <span className="text-white font-black">{fmt(repayment.total)}</span> due in {selectedTerm.days} days
          </p>
        </div>

        <button
          onClick={() => { if (phone && agreed) setStep(3); }}
          disabled={!phone || !agreed}
          className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowDownLeft size={18} className="inline mr-2" />
          Disburse {fmt(repayment.principal)} Now
        </button>

      </main>
    </div>
  );

  // ── PROCESSING (Step 3) ──────────────────────────────────────────────────
  if (step === 3) return (
    <div className="min-h-screen bg-[#060708] text-white font-sans flex flex-col items-center justify-center p-8 gap-8">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/5" />
          <circle cx="56" cy="56" r="50" stroke="#FFB800" strokeWidth="5" fill="transparent"
            strokeDasharray="314" strokeDashoffset={314 * (1 - progress / 100)}
            className="transition-all duration-300" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black italic text-yellow-500">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-black uppercase italic tracking-tighter">Processing Loan</p>
        <p className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.3em]">
          {progress < 30 ? 'Verifying eligibility...'
           : progress < 60 ? 'Approving disbursement...'
           : progress < 90 ? 'Sending to M-Pesa...'
           : 'Confirming transaction...'}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        {[
          { label: 'Credit check',     done: progress > 25 },
          { label: 'KYC verification', done: progress > 50 },
          { label: 'M-Pesa dispatch',  done: progress > 75 },
          { label: 'Ledger update',    done: progress > 95 },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
              item.done ? 'bg-green-500 border-green-500' : 'border-gray-700'
            }`}>
              {item.done && <span className="text-[8px] text-white font-black">✓</span>}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wide transition-colors ${
              item.done ? 'text-green-400' : 'text-gray-600'
            }`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ACTIVE LOAN DASHBOARD (Step 4) ──────────────────────────────────────
  if (step === 4 && activeLoan) {
    const paidPct = Math.min((activeLoan.paid / schedule.length) * 100, 100);
    return (
      <div className="min-h-screen bg-[#060708] text-white font-sans pb-32">
        <header className="p-5 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#060708]/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-1.5 hover:bg-white/5 rounded-full"><ArrowLeft size={20} /></button>
            <h1 className="text-lg font-black uppercase tracking-tighter italic">Active <span className="text-yellow-500">Loan</span></h1>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-xl">
            <span className="text-[9px] font-black uppercase text-green-400 tracking-widest">● Active</span>
          </div>
        </header>

        <main className="p-5 space-y-5">

          {/* Main loan card */}
          <div className="bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Outstanding Balance</p>
            <div className="text-4xl font-black italic tracking-tighter text-yellow-500 mb-1">
              {fmt(activeLoan.total - Math.round((activeLoan.paid / schedule.length) * activeLoan.total))}
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase mb-5">
              of {fmt(activeLoan.total)} total · Due {activeLoan.due}
            </p>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[9px] font-black uppercase text-gray-600 mb-1.5">
                <span>Repaid</span><span>{Math.round(paidPct)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${paidPct}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/5">
              <div>
                <p className="text-[8px] font-black uppercase text-gray-600 mb-1">Rate</p>
                <p className="text-sm font-black italic text-yellow-500">{activeLoan.rate}%</p>
              </div>
              <div className="border-x border-white/5 text-center">
                <p className="text-[8px] font-black uppercase text-gray-600 mb-1">Days Left</p>
                <p className="text-sm font-black italic">{activeLoan.daysLeft}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase text-gray-600 mb-1">Issued</p>
                <p className="text-sm font-black italic">{activeLoan.issued}</p>
              </div>
            </div>
          </div>

          {/* Repayment schedule */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 px-1 flex items-center gap-2">
              <Calendar size={13} className="text-yellow-500" /> Repayment Schedule
            </h3>
            <div className="space-y-2">
              {schedule.map((s, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  s.paid ? 'bg-green-500/5 border-green-500/15' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                      s.paid ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-500'
                    }`}>
                      {s.paid ? '✓' : i + 1}
                    </div>
                    <span className="text-[11px] font-bold uppercase text-gray-400">{s.date}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${s.paid ? 'text-green-400' : 'text-white'}`}>{fmt(s.amount)}</span>
                    {!s.paid && i === activeLoan.paid && (
                      <p className="text-[8px] text-yellow-500 font-black uppercase">Next due</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pay now button */}
          <button
            onClick={() => setActiveLoan(prev => ({ ...prev, paid: Math.min(prev.paid + 1, schedule.length) }))}
            disabled={activeLoan.paid >= schedule.length}
            className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {activeLoan.paid >= schedule.length ? '✓ Loan Fully Repaid' : `Pay Next Instalment — ${fmt(schedule[0]?.amount || 0)}`}
          </button>

          {/* Apply for another */}
          {activeLoan.paid >= schedule.length && (
            <button
              onClick={() => { setActiveLoan(null); setStep(0); setPhone(''); setAgreed(false); }}
              className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all"
            >
              Apply for New Loan →
            </button>
          )}

        </main>
      </div>
    );
  }

  return null;
}
