"use client";

import { useState, useEffect } from 'react';
import { Loader2, Save, AlertCircle, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { useClient } from '@/lib/ClientContext';
import { CheckCircle } from 'lucide-react';

export default function EditModelPortfolio() {
  const { clientName } = useClient();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchModelFunds();
  }, []);

  const fetchModelFunds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/model/allocations');
      const json = await res.json();
      setFunds(json.modelFunds || []);
    } catch (err) {
      console.error(err);
      setError('System failure while loading model parameters.');
    } finally {
      setLoading(false);
    }
  };

  const currentTotal = funds.reduce((sum, fund) => sum + Number(fund.allocation_pct), 0);
  const isValidTotal = Math.abs(currentTotal - 100) < 0.01;

  const handleChange = (id, value) => {
    const val = value === '' ? 0 : Number(value);
    setFunds(funds.map(f => f.fund_id === id ? { ...f, allocation_pct: val } : f));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!isValidTotal) {
      setError(`Constraints Violations: Cumulative allocation must be exactly 100%. Current: ${currentTotal.toFixed(2)}%.`);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/model/allocations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: funds })
      });
      
      const resData = await res.json();
      
      if (!res.ok) throw new Error(resData.error || 'Database rejected these parameters.');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Model Protocol...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full"></div>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Strategy Configuration</p>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            Tune <span className="text-indigo-600">Model</span> Portfolio
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium">
            Define global target percentages for the recommended portfolio structure.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving || !isValidTotal}
          className={`group px-8 py-4 text-white shadow-2xl rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 focus:ring-4 focus:ring-indigo-500/20
            ${success ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'} 
            ${(saving || !isValidTotal) ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-1'}`}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 
           success ? <CheckCircle className="w-5 h-5" /> : 
           <Save className="w-5 h-5" />}
          {success ? 'Protocol Updated' : 'Push Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold uppercase tracking-tight text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden">
          <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic text-sm">Asset Weights</h2>
            <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2 border border-slate-700 shadow-inner">
               <Info className="w-4 h-4 text-slate-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weights must be floats (0.0 - 100.0)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="border-b border-white/5 bg-white/[0.01] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Asset Specification</th>
                  <th className="px-10 py-6 text-right">Target Allocation (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {funds.map((fund) => (
                  <tr key={fund.fund_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-700">
                          {fund.asset_class}
                        </span>
                        <div>
                           <p className="font-black text-white text-base group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{fund.fund_name}</p>
                           <p className="text-[10px] font-black text-slate-600 mt-1 uppercase tracking-widest">System Identifier: {fund.fund_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3 group/field">
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.01"
                            value={fund.allocation_pct}
                            onChange={(e) => handleChange(fund.fund_id, e.target.value)}
                            className="w-32 text-right bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 font-black text-base focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <span className="text-slate-500 font-black text-sm">%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className={`p-8 rounded-[40px] border transition-all duration-500 shadow-2xl relative overflow-hidden group
              ${isValidTotal ? 'bg-indigo-600 border-indigo-400 shadow-indigo-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className={`w-5 h-5 ${isValidTotal ? 'text-white' : 'text-red-400'}`} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isValidTotal ? 'text-indigo-100/60' : 'text-red-400/60'}`}>System Equilibrium</p>
                </div>
                <p className={`text-4xl font-black tracking-tighter leading-none ${isValidTotal ? 'text-white' : 'text-red-400'}`}>
                  {currentTotal.toFixed(2)}%
                </p>
                <div className="mt-6 flex items-center gap-2">
                   {isValidTotal ? (
                     <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/10">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Optimal State</span>
                     </div>
                   ) : (
                     <span className="text-[9px] font-black text-red-400/80 uppercase tracking-widest">Adjustment Required</span>
                   )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 shadow-2xl rounded-[40px] p-8 border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10">
                  <h4 className="text-sm font-black text-white mb-4 uppercase tracking-[0.1em]">Protocol Rules</h4>
                  <ul className="space-y-4">
                    {[
                      "Total must normalize to 100.00%",
                      "Negative values are prohibited",
                      "Only model funds are targetable",
                      "Changes affect drift instantly"
                    ].map((rule, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{rule}</p>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
