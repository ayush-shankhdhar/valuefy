"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Save, ArrowRight, Loader2, AlertCircle, TrendingUp, DollarSign, PieChart, Info, Landmark } from 'lucide-react';
import { useClient } from '@/lib/ClientContext';

export default function PortfolioComparison() {
  const { clientId, clientName } = useClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/portfolio/compare?clientId=${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleSave = async () => {
    if (!data || !data.items || !data.items.length) return;
    
    try {
      setSaving(true);
      const res = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: data.clientId,
          portfolioValue: data.totalPortfolioValue,
          totalToBuy: data.totalBuy,
          totalToSell: data.totalSell,
          netCashNeeded: data.freshMoneyNeeded,
          items: data.items
        })
      });
      
      if (!res.ok) throw new Error('Failed to save recommendation');
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <PieChart className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Simulating Portfolio Drift...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-3xl flex items-start gap-5 backdrop-blur-md">
        <AlertCircle className="w-8 h-8 shrink-0" />
        <div>
          <h3 className="font-black text-xl mb-2 tracking-tight">System Outage</h3>
          <p className="text-red-400/80 leading-relaxed font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full"></div>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Client Overview</p>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            {clientName}<span className="text-indigo-600 block sm:inline">'s</span> <span className="text-indigo-600">Rebalance</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium max-w-2xl">
            Intelligent asset allocation analysis based on your custom model portfolio parameters.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={fetchData}
            className="px-6 py-4 bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-2xl hover:text-white hover:bg-slate-700 font-bold flex items-center gap-3 transition-all active:scale-95 glass shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Recalculate
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving || savedSuccess || (data.totalBuy === 0 && data.totalSell === 0)}
            className={`px-8 py-4 text-white shadow-2xl rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 focus:ring-4 focus:ring-indigo-500/20
              ${savedSuccess ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'} 
              ${(saving || (data.totalBuy === 0 && data.totalSell === 0)) ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-1'}`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 
             savedSuccess ? <Save className="w-5 h-5" /> : 
             <Save className="w-5 h-5" />}
            {savedSuccess ? 'Strategy Saved' : 'Commit Rebalance'}
          </button>
        </div>
      </div>

      {/* Extreme Dark Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 shadow-2xl rounded-[32px] p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
              <Landmark className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Net Worth</p>
            <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(data.totalPortfolioValue)}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 shadow-2xl rounded-[32px] p-8 border border-blue-500/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
              <ArrowRight className="w-6 h-6 -rotate-45" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Buy Volume</p>
            <p className="text-3xl font-black text-blue-400 tracking-tight">{formatCurrency(data.totalBuy)}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 shadow-2xl rounded-[32px] p-8 border border-orange-500/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="bg-orange-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-400 mb-6">
              <ArrowRight className="w-6 h-6 rotate-45" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sell Volume</p>
            <p className="text-3xl font-black text-orange-400 tracking-tight">{formatCurrency(data.totalSell)}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-tr from-indigo-700 to-violet-700 shadow-[0_20px_50px_rgba(79,70,229,0.3)] rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-2">Capital Injection</p>
            <p className="text-3xl font-black tracking-tight">{formatCurrency(data.freshMoneyNeeded)}</p>
          </div>
        </div>
      </div>

      {/* Main Glass Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/5 overflow-hidden group">
        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Info className="w-5 h-5 text-indigo-500" />
               <h2 className="text-xl font-black text-white tracking-tight">Drift Analysis</h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-1.5 border border-slate-700/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Real-time Sync Active
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-white/5 bg-white/[0.01] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Instrument</th>
                <th className="px-6 py-6 text-center">Current</th>
                <th className="px-6 py-6 text-center">Model</th>
                <th className="px-6 py-6 text-center">Variance</th>
                <th className="px-6 py-6 text-center">Action</th>
                <th className="px-10 py-6 text-right">Order Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {data.items?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-800 rounded-2xl">
                         <Info className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No holdings detected for this wallet.</p>
                    </div>
                  </td>
                </tr>
              ) : data.items.map((item) => (
                <tr key={item.fund_id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <p className="font-black text-white text-base group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.fund_name}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wide">{formatCurrency(item.current_value)}</p>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <span className="inline-flex items-center justify-center bg-slate-800/50 text-slate-300 px-3 py-1.5 rounded-xl font-black text-xs border border-slate-700/30">
                      {item.current_pct}%
                    </span>
                  </td>
                  <td className="px-6 py-8 text-center">
                    {item.target_pct !== null ? (
                      <span className="inline-flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl font-black text-xs">
                        {item.target_pct}%
                      </span>
                    ) : (
                      <span className="text-slate-700 font-black">-</span>
                    )}
                  </td>
                  <td className="px-6 py-8 text-center">
                    {item.drift !== null ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-black text-xs uppercase tracking-widest
                          ${item.drift > 0.01 ? 'text-blue-400' : 
                            item.drift < -0.01 ? 'text-orange-400' : 'text-slate-600'}`}>
                          {item.drift > 0 ? 'Surplus' : item.drift < 0 ? 'Deficit' : 'Stable'}
                        </span>
                        <span className={`font-black text-sm
                          ${item.drift > 0.01 ? 'text-blue-400' : 
                            item.drift < -0.01 ? 'text-orange-400' : 'text-slate-600'}`}>
                          {item.drift > 0 ? '+' : ''}{item.drift.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-700 font-black">-</span>
                    )}
                  </td>
                  <td className="px-6 py-8 text-center">
                    {item.action === 'BUY' && (
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        BUY
                      </span>
                    )}
                    {item.action === 'SELL' && (
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                        SELL
                      </span>
                    )}
                    {item.action === 'REVIEW' && (
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        REVIEW
                      </span>
                    )}
                    {item.action === 'OK' && (
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] bg-slate-800 text-slate-500 border border-slate-700/50">
                        SAFE
                      </span>
                    )}
                  </td>
                  <td className={`px-10 py-8 text-right font-black text-xl tracking-tighter
                    ${item.action === 'BUY' ? 'text-blue-400' : 
                      item.action === 'SELL' ? 'text-orange-400' : 
                      item.action === 'REVIEW' ? 'text-amber-400' : 'text-slate-800'}`}>
                    {item.amount > 0 ? formatCurrency(item.amount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
