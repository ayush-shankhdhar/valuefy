"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Save, ArrowRight, ArrowLeft, Loader2, AlertCircle, TrendingUp, DollarSign, PieChart } from 'lucide-react';
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 font-medium animate-pulse">Analyzing portfolio for {clientName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-start gap-4 shadow-sm">
        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-lg mb-1">Analysis Failed</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Portfolio Analysis</h1>
          <p className="text-gray-500 mt-1.5 text-lg">
            Rebalancing recommendation for <span className="font-semibold text-indigo-600">{clientName}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchData}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 font-medium flex items-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <RefreshCw className="w-4 h-4" />
            Recalculate
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving || savedSuccess || (data.totalBuy === 0 && data.totalSell === 0)}
            className={`px-5 py-2.5 text-white shadow-md rounded-lg font-medium flex items-center gap-2 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:outline-none
              ${savedSuccess ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'} 
              ${(saving || (data.totalBuy === 0 && data.totalSell === 0)) ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             savedSuccess ? <Save className="w-4 h-4" /> : 
             <Save className="w-4 h-4" />}
            {savedSuccess ? 'Saved to History' : 'Save Recommendation'}
          </button>
        </div>
      </div>

      {/* Modern Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gray-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <PieChart className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Value</p>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(data.totalPortfolioValue)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <ArrowRight className="w-5 h-5 -rotate-45" />
              </div>
              <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Total BUY</p>
            </div>
            <p className="text-3xl font-extrabold text-blue-700">{formatCurrency(data.totalBuy)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <ArrowRight className="w-5 h-5 rotate-45" />
              </div>
              <p className="text-sm font-semibold text-orange-800 uppercase tracking-wider">Total SELL</p>
            </div>
            <p className="text-3xl font-extrabold text-orange-700">{formatCurrency(data.totalSell)}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full backdrop-blur-3xl -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Cash Needed</p>
            </div>
            <p className="text-3xl font-extrabold">{formatCurrency(data.freshMoneyNeeded)}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Asset Level Drift</h2>
          <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            {data.items?.length || 0} Assets Investigated
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-200 bg-white text-gray-500 text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4 w-1/3">Fund & Current Value</th>
                <th className="px-6 py-4 text-center">Current %</th>
                <th className="px-6 py-4 text-center">Target %</th>
                <th className="px-6 py-4 text-center">Drift</th>
                <th className="px-6 py-4 text-center">Action</th>
                <th className="px-6 py-4 text-right">Order Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No holdings or recommendations found for this client.
                  </td>
                </tr>
              ) : data.items.map((item) => (
                <tr key={item.fund_id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{item.fund_name}</p>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{formatCurrency(item.current_value)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-semibold text-sm">
                      {item.current_pct}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.target_pct !== null ? (
                      <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded font-bold text-sm">
                        {item.target_pct}%
                      </span>
                    ) : (
                      <span className="text-gray-300 font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.drift !== null ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {item.drift > 0.01 ? (
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                        ) : item.drift < -0.01 ? (
                          <TrendingUp className="w-4 h-4 text-orange-500 rotate-180" />
                        ) : null}
                        <span className={`font-bold text-sm
                          ${item.drift > 0.01 ? 'text-blue-700' : 
                            item.drift < -0.01 ? 'text-orange-700' : 'text-gray-400'}`}>
                          {item.drift > 0 ? '+' : ''}{item.drift.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300 font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.action === 'BUY' && (
                      <span className="inline-flex items-center justify-center w-20 py-1.5 rounded-lg text-[11px] font-black tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                        BUY
                      </span>
                    )}
                    {item.action === 'SELL' && (
                      <span className="inline-flex items-center justify-center w-20 py-1.5 rounded-lg text-[11px] font-black tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                        SELL
                      </span>
                    )}
                    {item.action === 'REVIEW' && (
                      <span className="inline-flex items-center justify-center w-20 py-1.5 rounded-lg text-[11px] font-black tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">
                        REVIEW
                      </span>
                    )}
                    {item.action === 'OK' && (
                      <span className="inline-flex items-center justify-center w-20 py-1.5 rounded-lg text-[11px] font-bold tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                        OK
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-base
                    ${item.action === 'BUY' ? 'text-blue-600' : 
                      item.action === 'SELL' ? 'text-orange-600' : 
                      item.action === 'REVIEW' ? 'text-yellow-700' : 'text-gray-300'}`}>
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
