"use client";

import { useState, useEffect } from 'react';
import { Loader2, Calendar, CheckCircle, Clock, XCircle, ChevronRight, Activity } from 'lucide-react';
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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> APPLIED</span>;
      case 'DISMISSED': 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3.5 h-3.5" /> DISMISSED</span>;
      case 'PENDING': 
      default: 
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> PENDING</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading history for {clientName}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recommendation History</h1>
          <p className="text-gray-500 mt-1.5 text-lg">
            Past rebalancing logs for <span className="font-semibold text-indigo-600">{clientName}</span>
          </p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-indigo-800">{history.length} Sessions Logged</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        {history.length === 0 ? (
          <div className="py-24 px-6 text-center flex flex-col items-center justify-center text-gray-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No History Logged</h3>
            <p className="text-gray-500 max-w-md">Once you calculate and save a new rebalancing recommendation on the dashboard, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((session) => (
              <div key={session.session_id} className="p-6 hover:bg-gray-50/50 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 p-3.5 rounded-xl text-indigo-600 shadow-sm">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{formatDate(session.created_at)}</h4>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      Portfolio Size: <span className="text-gray-900 font-bold">{formatCurrency(session.portfolio_value)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-12">
                  <div className="flex items-center gap-8 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Total Buy</p>
                      <p className="text-base font-black text-blue-600">{formatCurrency(session.total_to_buy)}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Total Sell</p>
                      <p className="text-base font-black text-orange-600">{formatCurrency(session.total_to_sell)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    {getStatusBadge(session.status)}
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full">
                      <ChevronRight className="w-5 h-5" />
                    </button>
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
