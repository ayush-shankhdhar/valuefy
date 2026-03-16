"use client";

import { useState, useEffect } from 'react';
import { Loader2, Calendar, CheckCircle, Clock, XCircle, ChevronRight, Activity, TrendingUp, History as HistoryIcon } from 'lucide-react';
import { useClient } from '@/lib/ClientContext';

export default function RecommendationHistory() {
  const { clientId, clientName } = useClient();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/history?clientId=${clientId}`);
        const json = await res.json();
        setHistory(json.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [clientId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED': 
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] uppercase"><CheckCircle className="w-4 h-4" /> APPLIED</span>;
      case 'DISMISSED': 
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 uppercase"><XCircle className="w-4 h-4" /> DISMISSED</span>;
      case 'PENDING': 
      default: 
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase animate-pulse"><Clock className="w-4 h-4" /> PENDING</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Retrieving Audit Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-0.5 w-10 bg-indigo-500 rounded-full"></div>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Execution Logs</p>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
            Audit <span className="text-indigo-600">History</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium">
            Complete transaction record of rebalancing sessions for <span className="text-white">{clientName}</span>.
          </p>
        </div>
        
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 glass flex items-center gap-5 shadow-2xl">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total History</p>
            <p className="text-2xl font-black text-white leading-none tracking-tight">{history.length} Entries</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-800 hidden md:block opacity-50"></div>
        
        {history.length === 0 ? (
          <div className="py-24 px-10 rounded-[40px] border border-white/5 bg-slate-900/30 backdrop-blur-xl text-center flex flex-col items-center justify-center text-slate-500 shadow-2xl">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              <HistoryIcon className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No Temporal Data</h3>
            <p className="text-slate-500 max-w-md font-medium text-lg leading-relaxed">System has not recorded any rebalancing activities for this client yet. Execute a new strategy to begin logging.</p>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            {history.map((session) => (
              <div key={session.session_id} className="group relative flex flex-col md:flex-row md:items-center gap-10 md:gap-14">
                
                {/* Timeline Dot */}
                <div className="hidden md:flex absolute left-0 w-20 items-center justify-center h-full">
                  <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-700 group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:scale-150 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                </div>

                <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/5 hover:bg-slate-900/60 hover:border-indigo-500/20 transition-all duration-500 shadow-2xl overflow-hidden md:ml-20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-start gap-5">
                      <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all shadow-xl">
                        <Calendar className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="font-black text-white text-xl tracking-tight uppercase italic text-sm">{formatDate(session.created_at)}</h4>
                           <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {session.session_id}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          Managed Assets: <span className="text-white font-black">{formatCurrency(session.portfolio_value)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 lg:gap-12 bg-black/20 p-6 rounded-[24px] border border-white/5 shadow-inner">
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 opacity-60">Buy Volume</p>
                        <p className="text-lg font-black text-blue-400 tracking-tighter">{formatCurrency(session.total_to_buy)}</p>
                      </div>
                      <div className="w-px h-10 bg-white/5"></div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1.5 opacity-60">Sell Volume</p>
                        <p className="text-lg font-black text-orange-400 tracking-tighter">{formatCurrency(session.total_to_sell)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-6">
                      {getStatusBadge(session.status)}
                      <button className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all flex items-center justify-center group shadow-xl active:scale-90">
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
