import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertCircle, CreditCard,
  TrendingUp, Clock, Shield, Zap, Wallet,
  Calendar, ArrowDownLeft, X, Info, ChevronRight
} from 'lucide-react';
import { useTheme, usePageBg } from '../context/ThemeContext';

const EX = 130.5;

const TIERS = [
  { min: 10,  max: 19,  rate: 10,   label: '$10–$19'   },
  { min: 20,  max: 29,  rate: 15,   label: '$20–$29'   },
  { min: 30,  max: 49,  rate: 20,   label: '$30–$49'   },
  { min: 50,  max: 99,  rate: 25,   label: '$50–$99'   },
  { min: 100, max: 199, rate: 30,   label: '$100–$199' },
  { min: 200, max: 9999,rate: 37.5, label: '$200+'     },
];

const TERMS = [
  { days: 7,  label: '7 Days'  },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
  { days: 60, label: '60 Days' },
];

const getTier = (kes) => {
  const usd = kes / EX;
  return TIERS.find(t => usd >= t.min && usd <= t.max) || TIERS[TIERS.length - 1];
};

const calcRepay = (kes, rate, days) => {
  const termBonus = days >= 60 ? 8 : days >= 30 ? 5 : days >= 14 ? 2 : 0;
  const totalRate = rate + termBonus;
  const interest  = kes * (totalRate / 100);
  return { total: Math.round(kes + interest), interest: Math.round(interest), rate: totalRate };
};

const fmtK = n => `KES ${Math.round(n).toLocaleString()}`;

export default function Loans() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const css = usePageBg();
  const isDark = theme === 'dark';

  const [step,       setStep]     = useState(0); // 0=landing 1=calc 2=apply 3=processing 4=active
  const [amountKES,  setAmount]   = useState(6525);
  const [term,       setTerm]     = useState(TERMS[1]);
  const [phone,      setPhone]    = useState('');
  const [agreed,     setAgreed]   = useState(false);
  const [progress,   setProgress] = useState(0);
  const [activeLoan, setActive]   = useState(null);

  const tier   = getTier(amountKES);
  const repay  = calcRepay(amountKES, tier.rate, term.days);

  // Processing simulation
  useEffect(() => {
    if (step !== 3) return;
    let pct = 0;
    const id = setInterval(() => {
      pct += Math.random() * 14 + 5;
      setProgress(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(id);
        setTimeout(() => {
          const due = new Date();
          due.setDate(due.getDate() + term.days);
          setActive({
            principal: amountKES, total: repay.total, interest: repay.interest,
            rate: repay.rate, term, issued: new Date().toLocaleDateString('en-KE'),
            due: due.toLocaleDateString('en-KE'), paidInstalment: 0,
          });
          setStep(4);
        }, 500);
      }
    }, 180);
    return () => clearInterval(id);
  }, [step]); // eslint-disable-line

  const bgPage   = isDark ? 'bg-[#060708] text-white' : 'bg-[#f0f2f5] text-gray-900';
  const bgHeader = isDark ? 'bg-[#060708]/90 border-white/5' : 'bg-white/90 border-gray-200';
  const bgCard   = isDark ? 'bg-[#0b0e11] border-white/5' : 'bg-white border-gray-200';
  const bgAlt    = isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200';
  const textSub  = isDark ? 'text-gray-500' : 'text-gray-500';
  const inputCls = isDark ? 'bg-black border-white/8 text-white placeholder-gray-600' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400';
  const divider  = isDark ? 'divide-white/5' : 'divide-gray-100';

  const Header = ({ title, onBack }) => (
    <header className={`px-5 py-4 flex items-center gap-3 border-b sticky top-0 backdrop-blur-xl z-10 ${bgHeader}`}>
      <button onClick={onBack} className="p-1.5 hover:bg-white/5 rounded-full transition-colors active:scale-90">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-lg font-black uppercase tracking-tighter italic">
        MMM <span className="text-yellow-500">{title}</span>
      </h1>
    </header>
  );

  // ── STEP 0: Landing ──────────────────────────────────────────────────────
  if (step === 0) return (
    <div className={`min-h-screen pb-28 font-sans ${bgPage}`}>
      <Header title="Credit" onBack={() => navigate('/')} />

      <main className="px-5 pt-6 space-y-6">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/25 p-7">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-3">Instant Access</p>
          <h2 className="text-3xl font-black italic tracking-tighter leading-tight mb-3">
            Get up to<br /><span className="text-yellow-500">KES 26,100</span>
          </h2>
          <p className={`text-[11px] font-bold uppercase tracking-wide mb-6 ${textSub}`}>
            Disbursed in minutes · Flexible terms · No paperwork
          </p>
          <button onClick={() => setStep(1)}
            className="bg-yellow-500 text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all shadow-xl shadow-yellow-500/25">
            Calculate My Loan →
          </button>
        </div>

        {/* Rate table */}
        <section>
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2 ${textSub}`}>
            <TrendingUp size={13} className="text-yellow-500" /> Rate Schedule
          </p>
          <div className={`rounded-3xl border overflow-hidden ${bgCard}`}>
            <div className={`grid grid-cols-3 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest border-b ${
              isDark ? 'text-gray-600 border-white/5 bg-white/[0.02]' : 'text-gray-400 border-gray-100 bg-gray-50'
            }`}>
              <span>Amount</span><span className="text-center">Rate</span><span className="text-right">Returns</span>
            </div>
            {TIERS.map((t, i) => {
              const sampleKES = t.min * EX;
              const ret = sampleKES * (1 + t.rate / 100);
              return (
                <div key={i} className={`grid grid-cols-3 px-5 py-3.5 border-b last:border-0 transition-colors ${
                  isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-gray-50'
                }`}>
                  <span className="text-sm font-black italic">{t.label}</span>
                  <span className="text-center text-sm font-black text-yellow-500">{t.rate}%</span>
                  <span className="text-right text-sm font-black text-green-400">
                    {t.max < 9999 ? fmtK(ret) : 'Custom'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature grid */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { Icon: Zap,       label: 'Instant Payout',  sub: 'M-Pesa in 2 min',     color: '#FFB800' },
            { Icon: Shield,    label: 'No Collateral',   sub: 'Eligibility only',     color: '#4ade80' },
            { Icon: Clock,     label: 'Flexible Terms',  sub: '7 to 60 days',         color: '#60a5fa' },
            { Icon: TrendingUp,label: 'Build Credit',    sub: 'Unlock higher limits', color: '#a78bfa' },
          ].map(({ Icon, label, sub, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${bgAlt}`}>
              <Icon size={20} className="mb-2" style={{ color }} />
              <p className="text-[11px] font-black uppercase tracking-tight">{label}</p>
              <p className={`text-[9px] font-bold mt-0.5 ${textSub}`}>{sub}</p>
            </div>
          ))}
        </section>

        {/* Eligibility */}
        <section className={`rounded-3xl border p-5 space-y-3 ${bgCard}`}>
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${textSub}`}>
            <CheckCircle2 size={13} className="text-green-500" /> Eligibility Check
          </p>
          {[
            { label: 'Account Verified',       ok: true  },
            { label: 'Minimum deposit met',    ok: true  },
            { label: 'Trading milestone 45%',  ok: false },
            { label: 'No active defaults',     ok: true  },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <span className={`text-[11px] font-bold uppercase ${textSub}`}>{item.label}</span>
              {item.ok
                ? <CheckCircle2 size={15} className="text-green-500" />
                : <div className="flex items-center gap-1"><AlertCircle size={15} className="text-yellow-500" /><span className="text-[8px] text-yellow-500 font-black uppercase">Pending</span></div>
              }
            </div>
          ))}
        </section>

      </main>
    </div>
  );

  // ── STEP 1: Calculator ───────────────────────────────────────────────────
  if (step === 1) return (
    <div className={`min-h-screen pb-28 font-sans ${bgPage}`}>
      <Header title="Calculator" onBack={() => setStep(0)} />

      <main className="px-5 pt-6 space-y-5">

        <div className={`rounded-3xl border p-6 ${bgCard}`}>
          <div className="flex justify-between items-baseline mb-2">
            <p className={`text-[10px] font-black uppercase tracking-widest ${textSub}`}>Loan Amount</p>
            <p className={`text-xs font-bold ${textSub}`}>${Math.round(amountKES / EX)} USD</p>
          </div>
          <div className="text-3xl font-black italic tracking-tighter text-yellow-500 mb-5">{fmtK(amountKES)}</div>
          <input type="range" min="1305" max="26100" step="500" value={amountKES}
            onChange={e => setAmount(+e.target.value)}
            className="w-full h-2 rounded-full appearance-none accent-yellow-500 cursor-pointer mb-4"
            style={{ background: `linear-gradient(to right, #FFB800 ${((amountKES-1305)/(26100-1305))*100}%, #333 0)` }} />
          <div className="grid grid-cols-4 gap-2">
            {[1305, 3915, 6525, 13050].map(a => (
              <button key={a} onClick={() => setAmount(a)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all active:scale-95 ${
                  amountKES === a ? 'bg-yellow-500 text-black border-yellow-500' : `${bgAlt} border-transparent ${isDark ? 'text-gray-500' : 'text-gray-500'} hover:border-yellow-500/30`
                }`}>{a >= 1000 ? `${a/1000}K` : a}</button>
            ))}
          </div>
        </div>

        <div>
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-3 ${textSub}`}>Repayment Term</p>
          <div className="grid grid-cols-4 gap-2">
            {TERMS.map(t => (
              <button key={t.days} onClick={() => setTerm(t)}
                className={`py-4 rounded-2xl flex flex-col items-center gap-1 border transition-all active:scale-95 ${
                  term.days === t.days
                    ? `border-yellow-500/50 ${isDark ? 'bg-white/8' : 'bg-yellow-50'} text-yellow-500`
                    : `${bgAlt} border-transparent ${isDark ? 'text-gray-500' : 'text-gray-400'}`
                }`}>
                <span className="text-xl font-black italic">{t.days}</span>
                <span className="text-[8px] font-black uppercase">days</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className={`rounded-3xl border p-6 space-y-4 ${bgCard}`}>
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${textSub}`}>Repayment Summary</p>
          {[
            { label: 'Principal',              value: fmtK(amountKES),      color: '' },
            { label: `Interest (${repay.rate}%)`, value: fmtK(repay.interest), color: 'text-yellow-500' },
          ].map((r, i) => (
            <div key={i} className={`flex justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <span className={`text-[10px] font-bold uppercase ${textSub}`}>{r.label}</span>
              <span className={`text-sm font-black ${r.color}`}>{r.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${textSub}`}>Total Repayment</span>
            <span className="text-xl font-black italic text-yellow-500">{fmtK(repay.total)}</span>
          </div>
        </div>

        <button onClick={() => setStep(2)}
          className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all shadow-xl shadow-yellow-500/20">
          Proceed to Apply →
        </button>

      </main>
    </div>
  );

  // ── STEP 2: Application ──────────────────────────────────────────────────
  if (step === 2) return (
    <div className={`min-h-screen pb-28 font-sans ${bgPage}`}>
      <Header title="Application" onBack={() => setStep(1)} />

      <main className="px-5 pt-6 space-y-4">

        {/* Summary pill */}
        <div className="grid grid-cols-3 gap-0 rounded-3xl border border-yellow-500/20 bg-yellow-500/8 overflow-hidden">
          {[
            { label: 'You Receive', value: fmtK(amountKES) },
            { label: 'Rate',        value: `${repay.rate}%` },
            { label: 'Term',        value: term.label },
          ].map((s, i) => (
            <div key={i} className={`p-4 text-center ${i < 2 ? `border-r ${isDark ? 'border-yellow-500/15' : 'border-yellow-200'}` : ''}`}>
              <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${textSub}`}>{s.label}</p>
              <p className="text-sm font-black italic text-yellow-500">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Phone */}
        <div className={`rounded-2xl border p-5 flex justify-between items-center focus-within:border-yellow-500/40 transition-colors ${inputCls}`}>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${textSub}`}>M-Pesa Number</p>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="07XX XXX XXX"
              className="bg-transparent font-black focus:outline-none text-lg w-44" />
          </div>
          <span className="text-[9px] font-black text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-xl border border-green-500/20 uppercase tracking-widest">
            M-Pesa
          </span>
        </div>

        {/* Agreement */}
        <div className={`rounded-2xl border p-4 ${bgAlt}`}>
          <div className="flex items-start gap-3">
            <button onClick={() => setAgreed(a => !a)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                agreed ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600'
              }`}>
              {agreed && <span className="text-black text-xs font-black">✓</span>}
            </button>
            <p className={`text-[10px] font-bold leading-relaxed ${textSub}`}>
              I agree to repay <strong className={isDark ? 'text-white' : 'text-gray-900'}>{fmtK(repay.total)}</strong> by
              the due date. Late repayments attract a 5% weekly penalty. MMM Coin may offset against my trading balance.
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl border p-3.5 ${bgAlt}`}>
          <Info size={16} className="text-yellow-500 flex-shrink-0" />
          <p className={`text-[10px] font-bold uppercase leading-relaxed ${textSub}`}>
            Total due: <strong className={isDark ? 'text-white' : 'text-gray-900'}>{fmtK(repay.total)}</strong> in {term.days} days
          </p>
        </div>

        <button onClick={() => { if (phone && agreed) setStep(3); }}
          disabled={!phone || !agreed}
          className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
          <ArrowDownLeft size={17} className="inline mr-2" />
          Disburse {fmtK(amountKES)} to M-Pesa
        </button>

      </main>
    </div>
  );

  // ── STEP 3: Processing ───────────────────────────────────────────────────
  if (step === 3) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-8 p-8 ${bgPage}`}>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="5" fill="transparent" className={isDark ? 'text-white/5' : 'text-gray-200'} />
          <circle cx="56" cy="56" r="50" stroke="#FFB800" strokeWidth="5" fill="transparent"
            strokeDasharray="314" strokeDashoffset={314*(1-progress/100)} className="transition-all duration-300" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black italic text-yellow-500">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-black uppercase italic tracking-tight">Processing Loan</p>
        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mt-1 ${textSub}`}>
          {progress < 30 ? 'Verifying eligibility...'
           : progress < 60 ? 'Approving disbursement...'
           : progress < 88 ? 'Sending to M-Pesa...'
           : 'Confirming transaction...'}
        </p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        {[
          { label: 'Credit check',     done: progress > 22 },
          { label: 'KYC verification', done: progress > 48 },
          { label: 'M-Pesa dispatch',  done: progress > 72 },
          { label: 'Ledger update',    done: progress > 94 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              item.done ? 'bg-green-500 border-green-500' : 'border-gray-700'
            }`}>
              {item.done && <span className="text-[9px] text-white font-black">✓</span>}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wide transition-colors ${item.done ? 'text-green-400' : textSub}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── STEP 4: Active Loan ──────────────────────────────────────────────────
  if (step === 4 && activeLoan) {
    const instalments = 4;
    const perInstalment = Math.round(activeLoan.total / instalments);
    const paidPct = (activeLoan.paidInstalment / instalments) * 100;
    const remaining = activeLoan.total - activeLoan.paidInstalment * perInstalment;

    const schedule = Array.from({ length: instalments }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + Math.round((activeLoan.term.days / instalments) * (i + 1)));
      return { date: d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }), amount: perInstalment, paid: i < activeLoan.paidInstalment };
    });

    return (
      <div className={`min-h-screen pb-28 font-sans ${bgPage}`}>
        <header className={`px-5 py-4 flex items-center justify-between border-b sticky top-0 backdrop-blur-xl z-10 ${bgHeader}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1.5 hover:bg-white/5 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <span className="text-lg font-black uppercase italic tracking-tighter">
              Active <span className="text-yellow-500">Loan</span>
            </span>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            <span className="text-[9px] font-black uppercase text-green-400 tracking-widest">● Active</span>
          </div>
        </header>

        <main className="px-5 pt-5 space-y-5">

          {/* Loan card */}
          <div className={`rounded-[2.5rem] border p-6 shadow-2xl ${
            isDark ? 'bg-gradient-to-br from-[#1c1f25] to-[#0b0e11] border-white/5' : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
          }`}>
            <div className="absolute -inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
              <div className="w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl absolute -top-16 -right-16" />
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Outstanding</p>
            <div className="text-4xl font-black italic tracking-tighter text-yellow-500 mb-1">{fmtK(remaining)}</div>
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-5">of {fmtK(activeLoan.total)} · Due {activeLoan.due}</p>

            <div className="mb-1">
              <div className="flex justify-between text-[9px] font-black uppercase text-gray-500 mb-1.5">
                <span>Repaid</span><span>{Math.round(paidPct)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${paidPct}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/8">
              <div><p className="text-[8px] text-gray-500 uppercase mb-1">Rate</p><p className="text-sm font-black text-yellow-500">{activeLoan.rate}%</p></div>
              <div className="text-center border-x border-white/8"><p className="text-[8px] text-gray-500 uppercase mb-1">Days</p><p className="text-sm font-black text-white">{activeLoan.term.days}</p></div>
              <div className="text-right"><p className="text-[8px] text-gray-500 uppercase mb-1">Issued</p><p className="text-sm font-black text-white">{activeLoan.issued}</p></div>
            </div>
          </div>

          {/* Schedule */}
          <p className={`text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-2 ${textSub}`}>
            <Calendar size={12} className="text-yellow-500" /> Repayment Schedule
          </p>
          <div className="space-y-2">
            {schedule.map((s, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                s.paid
                  ? isDark ? 'bg-green-500/5 border-green-500/15' : 'bg-green-50 border-green-200'
                  : `${bgAlt}`
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                    s.paid ? 'bg-green-500 text-black' : isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-500'
                  }`}>{s.paid ? '✓' : i + 1}</div>
                  <span className={`text-[11px] font-bold uppercase ${textSub}`}>{s.date}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${s.paid ? 'text-green-400' : isDark ? 'text-white' : 'text-gray-900'}`}>{fmtK(s.amount)}</span>
                  {!s.paid && i === activeLoan.paidInstalment && (
                    <p className="text-[8px] text-yellow-500 font-black uppercase">Next due</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActive(p => ({ ...p, paidInstalment: Math.min(p.paidInstalment + 1, instalments) }))}
            disabled={activeLoan.paidInstalment >= instalments}
            className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-40">
            {activeLoan.paidInstalment >= instalments ? '✓ Loan Fully Repaid' : `Pay Instalment — ${fmtK(perInstalment)}`}
          </button>

          {activeLoan.paidInstalment >= instalments && (
            <button onClick={() => { setActive(null); setStep(0); setPhone(''); setAgreed(false); }}
              className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-95 transition-all">
              Apply for New Loan →
            </button>
          )}

        </main>
      </div>
    );
  }

  return null;
}
