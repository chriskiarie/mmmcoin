import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, BarChart2, Repeat, Zap, Wallet } from 'lucide-react';

// Import your elite page components
import Home from './pages/Home';
import Markets from './pages/Markets';
import Account from './pages/Account';
import AssetDetail from './pages/AssetDetail'; // Import the new Chart/Trading page

// Placeholder for other terminals
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-screen text-gray-600 bg-[#060708]">
    <div className="w-12 h-12 mb-4 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    <span className="uppercase font-black tracking-[0.3em] text-[10px]">{title} Terminal Loading</span>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen text-white font-sans antialiased bg-[#060708] selection:bg-yellow-500/30">
        
        {/* Mobile-centric container */}
        <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-[#060708] border-x border-white/5 pb-20">
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/account" element={<Account />} />
            
            {/* Swapping Placeholder for the actual AssetDetail component */}
            <Route path="/trade/:symbol" element={<AssetDetail />} />
            
            <Route path="/futures" element={<Placeholder title="Futures" />} />
            <Route path="/assets" element={<Placeholder title="Wallet" />} />
          </Routes>

          {/* Persistent Professional Navigation Bar */}
          <nav className="fixed bottom-0 max-w-md w-full border-t border-white/5 flex justify-around py-3 z-50 bg-[#060708]/95 backdrop-blur-xl">
            <NavigationItem to="/" icon={<HomeIcon size={20} />} label="Home" />
            <NavigationItem to="/markets" icon={<BarChart2 size={20} />} label="Markets" />
            {/* Default Trade button goes to BTCUSDT */}
            <NavigationItem to="/trade/BTCUSDT" icon={<Repeat size={20} />} label="Trade" />
            <NavigationItem to="/futures" icon={<Zap size={20} />} label="Futures" />
            <NavigationItem to="/assets" icon={<Wallet size={20} />} label="Assets" />
          </nav>
        </div>
      </div>
    </Router>
  );
}

function NavigationItem({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex flex-col items-center flex-1 relative transition-all duration-300
        ${isActive ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'}
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute -top-1 w-10 h-10 bg-yellow-500/10 rounded-full blur-xl animate-pulse" />
          )}
          
          <div className="z-10 flex flex-col items-center">
            <div className="transition-transform duration-300">
              {icon}
            </div>
            <span className="text-[8px] mt-1.5 font-black tracking-widest uppercase italic">
              {label}
            </span>
          </div>

          {isActive && (
            <div className="absolute -bottom-3 w-1 h-1 bg-yellow-500 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}