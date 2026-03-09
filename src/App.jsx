import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, BarChart2, Repeat, Zap, Wallet } from 'lucide-react';

import { ThemeProvider, usePageBg } from './context/ThemeContext';
import Home       from './pages/Home';
import Markets    from './pages/Markets';
import Account    from './pages/Account';
import AssetDetail from './pages/AssetDetail';
import Loans      from './pages/Loans';
import Futures    from './pages/Futures';
import Assets     from './pages/Assets';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShell />
      </Router>
    </ThemeProvider>
  );
}

function AppShell() {
  const css = usePageBg();
  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-yellow-500/30 ${css.page}`}>
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl border-x border-white/5 pb-20">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/markets"       element={<Markets />} />
          <Route path="/account"       element={<Account />} />
          <Route path="/trade/:symbol" element={<AssetDetail />} />
          <Route path="/loans"         element={<Loans />} />
          <Route path="/futures"       element={<Futures />} />
          <Route path="/assets"        element={<Assets />} />
        </Routes>

        <BottomNav css={css} />
      </div>
    </div>
  );
}

function BottomNav({ css }) {
  return (
    <nav className={`fixed bottom-0 max-w-md w-full border-t flex justify-around py-3 z-50 backdrop-blur-xl ${css.nav}`}>
      <NavItem to="/"        icon={<HomeIcon  size={20} />} label="Home"    />
      <NavItem to="/markets" icon={<BarChart2 size={20} />} label="Markets" />
      <NavItem to="/trade/BTCUSDT" icon={<Repeat size={20} />} label="Trade" />
      <NavItem to="/futures" icon={<Zap      size={20} />} label="Futures" />
      <NavItem to="/assets"  icon={<Wallet   size={20} />} label="Assets"  />
    </nav>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex flex-col items-center flex-1 relative transition-all duration-300 ${isActive ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`
    }>
      {({ isActive }) => (
        <>
          {isActive && <div className="absolute -top-1 w-10 h-10 bg-yellow-500/10 rounded-full blur-xl" />}
          <div className="z-10 flex flex-col items-center">
            {icon}
            <span className="text-[8px] mt-1.5 font-black tracking-widest uppercase italic">{label}</span>
          </div>
          {isActive && <div className="absolute -bottom-3 w-1 h-1 bg-yellow-500 rounded-full" />}
        </>
      )}
    </NavLink>
  );
}
