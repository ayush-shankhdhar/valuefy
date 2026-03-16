"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Save, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function PortfolioComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/portfolio/compare');
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
  }, []);

  const handleSave = async () => {
    if (!data || !data.items.length) return;
    
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Comparison & Rebalancing</h1>
          <p className="text-gray-500 mt-1">Review drift and apply required actions to align with model portfolio.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recalculate
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving || savedSuccess || data.totalBuy === 0 && data.totalSell === 0}
            className={`px-4 py-2 text-white shadow-sm rounded-md font-medium flex items-center gap-2 transition-colors
              ${savedSuccess ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} 
              ${(saving || (data.totalBuy === 0 && data.totalSell === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             savedSuccess ? <Save className="w-4 h-4" /> : 
             <Save className="w-4 h-4" />}
            {savedSuccess ? 'Saved!' : 'Save Recommendation'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalPortfolioValue)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Total BUY required</p>
          <p className="text-2xl font-bold text-blue-600 flex items-center gap-1">
            <ArrowRight className="w-5 h-5 rotate-45" />
            {formatCurrency(data.totalBuy)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Total SELL required</p>
          <p className="text-2xl font-bold text-orange-600 flex items-center gap-1">
            <ArrowRight className="w-5 h-5 -rotate-45" />
            {formatCurrency(data.totalSell)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500 mb-1">Fresh Money Needed</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.freshMoneyNeeded)}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Fund Name</th>
                <th className="px-6 py-4 text-right">Current %</th>
                <th className="px-6 py-4 text-right">Plan %</th>
                <th className="px-6 py-4 text-right">Drift</th>
                <th className="px-6 py-4 text-center">Action</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((item) => (
                <tr key={item.fund_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 border-l-2 border-transparent">
                    {item.fund_name}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {item.current_pct}%
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {item.target_pct !== null ? `${item.target_pct}%` : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.drift !== null ? (
                      <span className={`px-2 py-1 rounded inline-flex font-medium text-xs
                        ${item.drift > 0.01 ? 'text-blue-700 bg-blue-50' : 
                          item.drift < -0.01 ? 'text-orange-700 bg-orange-50' : 'text-gray-500'}`}>
                        {item.drift > 0 ? '+' : ''}{item.drift.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.action === 'BUY' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                        BUY
                      </span>
                    )}
                    {item.action === 'SELL' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700">
                        SELL
                      </span>
                    )}
                    {item.action === 'REVIEW' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-800">
                        REVIEW
                      </span>
                    )}
                    {item.action === 'OK' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-400">
                        OK
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold 
                    ${item.action === 'BUY' ? 'text-blue-600' : 
                      item.action === 'SELL' ? 'text-orange-600' : 
                      item.action === 'REVIEW' ? 'text-yellow-700' : 'text-gray-400'}`}>
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
