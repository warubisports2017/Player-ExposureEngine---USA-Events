import React from 'react';
import { Target, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 transition-all duration-300 print:hidden">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur opacity-20 group-hover:opacity-40 transition duration-500 rounded-full"></div>
            <div className="relative p-2 bg-slate-900 border border-white/10 rounded-xl">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight font-sans">Exposure<span className="text-emerald-400">Engine</span></h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Powered by Warubi</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-300 font-mono tracking-wider">ELITE VISIBILITY ANALYTICS</span>
        </div>
      </div>
    </header>
  );
};

export default Header;