"use client";

import { useState, useEffect } from 'react';
import { Loader2, PieChart, Activity, Briefcase } from 'lucide-react';
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading holdings for {clientName}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Current Investments</h1>
          <p className="text-gray-500 mt-1.5 text-lg">
            Active mutual fund portfolio of <span className="font-semibold text-indigo-600">{clientName}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-purple-400/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Total Valuation</p>
            </div>
            <p className="text-5xl font-extrabold mb-1 tracking-tight">{formatCurrency(data?.totalPortfolioValue)}</p>
            <p className="text-indigo-200 font-medium flex items-center gap-2 mt-4">
              <Activity className="w-4 h-4" /> Live as of Today
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Portfolio Breakdown
          </h3>
          <div className="space-y-4">
            {data?.holdings.slice(0, 4).map((fund, idx) => {
              const currentPct = ((fund.current_value / data.totalPortfolioValue) * 100).toFixed(1);
              const colorClasses = [
                "bg-indigo-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500"
              ][idx % 4];
              
              return (
                <div key={fund.fund_id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700 truncate max-w-[200px]">{fund.fund_name}</span>
                    <span className="font-bold text-gray-900">{currentPct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClasses} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${currentPct}%` }} />
                  </div>
                </div>
              );
            })}
            {data?.holdings.length > 4 && (
              <p className="text-xs text-center text-gray-400 font-medium pt-2">
                + {data.holdings.length - 4} more funds
              </p>
            )}
            {(!data?.holdings || data.holdings.length === 0) && (
              <p className="text-sm text-gray-500 py-4">No portfolio data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">All Holdings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-100 bg-white text-gray-400 text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">Mutual Fund Name</th>
                <th className="px-6 py-4 text-right">Current Valuation</th>
                <th className="px-6 py-4 text-right w-64">Portfolio Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.holdings.map((fund) => {
                const currentPct = ((fund.current_value / data.totalPortfolioValue) * 100).toFixed(2);
                
                return (
                  <tr key={fund.fund_id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 font-bold text-gray-800">
                      {fund.fund_name}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-gray-900 text-base">
                      {formatCurrency(fund.current_value)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg text-sm w-16 text-center">
                          {currentPct}%
                        </span>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" 
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
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500 font-medium">
                    This client currently has no active holdings.
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
