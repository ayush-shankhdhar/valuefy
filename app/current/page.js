"use client";

import { useState, useEffect } from 'react';
import { Loader2, PieChart } from 'lucide-react';

export default function CurrentInvestments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await fetch('/api/portfolio/current');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrent();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Investments</h1>
          <p className="text-gray-500 mt-1">A view of all mutual funds currently held by the client.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between max-w-sm border-l-4 border-l-indigo-500">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Current Value</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(data?.totalPortfolioValue)}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <PieChart className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Fund Name</th>
              <th className="px-6 py-4 text-right">Current Value</th>
              <th className="px-6 py-4 text-right">Allocation %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.holdings.map((fund) => {
              const currentPct = ((fund.current_value / data.totalPortfolioValue) * 100).toFixed(2);
              
              return (
                <tr key={fund.fund_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {fund.fund_name}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(fund.current_value)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 w-64">
                    <div className="flex items-center justify-end gap-3">
                      <span>{currentPct}%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${Math.min(100, currentPct)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!data?.holdings || data.holdings.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No holdings found for this client.
          </div>
        )}
      </div>
    </div>
  );
}
