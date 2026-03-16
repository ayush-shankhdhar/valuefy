"use client";

import { useState, useEffect } from 'react';
import { Loader2, PieChart, Activity, Briefcase, TrendingUp } from 'lucide-react';
import { useClient } from '@/lib/ClientContext';

export default function CurrentInvestments() {
  const { clientId, clientName } = useClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/portfolio/current?clientId=${clientId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrent();
  }, [clientId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Syncing Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full"></div>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Asset Inventory</p>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            Current <span className="text-indigo-600">Holdings</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium">
            Live valuation for <span className="text-white">{clientName}</span>'s active mutual fund portfolio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-800 p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-indigo-100 uppercase tracking-[0.2em] mb-1">Total Valuation</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Real-time update</p>
                  </div>
                </div>
              </div>
              <p className="text-6xl font-black tracking-tighter mb-2">{formatCurrency(data?.totalPortfolioValue)}</p>
              <p className="text-indigo-100/60 font-medium text-lg italic">Combined across {data?.holdings.length} distinct instruments</p>
            </div>
            
            <div className="mt-12 flex items-center gap-10">
               <div>
                  <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1 opacity-60">Avg Allocation</p>
                  <p className="text-2xl font-black">{(100 / (data?.holdings.length || 1)).toFixed(1)}%</p>
               </div>
               <div className="w-px h-10 bg-white/10"></div>
               <div>
                  <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1 opacity-60">Primary Class</p>
                  <p className="text-2xl font-black">Equity</p>
               </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl flex flex-col">
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase italic text-sm">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Top Allocations
          </h3>
          <div className="space-y-8 flex-1">
            {data?.holdings.slice(0, 5).map((fund, idx) => {
              const currentPct = ((fund.current_value / data.totalPortfolioValue) * 100).toFixed(1);
              const colorClasses = [
                "from-indigo-500 to-indigo-600", 
                "from-violet-500 to-violet-600", 
                "from-blue-500 to-blue-600", 
                "from-cyan-500 to-cyan-600",
                "from-emerald-500 to-emerald-600"
              ][idx % 5];
              
              return (
                <div key={fund.fund_id} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="font-bold text-slate-300 group-hover:text-white transition-colors truncate max-w-[180px] text-xs uppercase tracking-tight">{fund.fund_name}</span>
                    <span className="font-black text-white text-sm">{currentPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div className={`h-full bg-gradient-to-r ${colorClasses} rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.2)]`} style={{ width: `${currentPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-10 py-4 w-full bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all border border-white/5">
            View Analytics
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight uppercase italic text-sm">Portfolio Inventory</h2>
          <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {data?.holdings.length} POSITIONS OPEN
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-white/5 bg-white/[0.01] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Instrument</th>
                <th className="px-6 py-6 text-right">Valuation</th>
                <th className="px-10 py-6 text-right w-72">Portfolio Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {data?.holdings.map((fund) => {
                const currentPct = ((fund.current_value / data.totalPortfolioValue) * 100).toFixed(2);
                
                return (
                  <tr key={fund.fund_id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <p className="font-black text-white text-base uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                        {fund.fund_name}
                      </p>
                      <p className="text-[10px] font-black text-slate-600 mt-1 uppercase tracking-widest">Asset Class: Equity</p>
                    </td>
                    <td className="px-6 py-8 text-right font-black text-white text-xl tracking-tighter">
                      {formatCurrency(fund.current_value)}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-6">
                        <span className="font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-xs w-20 text-center shadow-lg">
                          {currentPct}%
                        </span>
                        <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                            style={{ width: `${Math.min(100, currentPct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!data?.holdings || data.holdings.length === 0) && (
                <tr>
                  <td colSpan="3" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                       <TrendingUp className="w-12 h-12 text-slate-700" />
                       <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-sm">Portfolio currently holding zero positions.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
