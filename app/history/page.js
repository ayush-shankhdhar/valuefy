"use client";

import { useState, useEffect } from 'react';
import { Loader2, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function RecommendationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history');
        const json = await res.json();
        setHistory(json.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPLIED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DISMISSED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING': default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">APPLIED</span>;
      case 'DISMISSED': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800">DISMISSED</span>;
      case 'PENDING': 
      default: 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-800">PENDING</span>;
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendation History</h1>
          <p className="text-gray-500 mt-1">Past rebalancing sessions and their execution status.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No History Yet</p>
            <p>Save a rebalancing recommendation to see it here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Portfolio Value</th>
                <th className="px-6 py-4 text-right border-l border-gray-100">Total Buy</th>
                <th className="px-6 py-4 text-right">Total Sell</th>
                <th className="px-6 py-4 text-center border-l border-gray-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((session) => (
                <tr key={session.session_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    {formatDate(session.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 font-medium border-l border-gray-100">
                    {formatCurrency(session.portfolio_value)}
                  </td>
                  <td className="px-6 py-4 text-right text-blue-600 font-medium">
                    {formatCurrency(session.total_to_buy)}
                  </td>
                  <td className="px-6 py-4 text-right text-orange-600 font-medium">
                    {formatCurrency(session.total_to_sell)}
                  </td>
                  <td className="px-6 py-4 text-center border-l border-gray-100">
                    <div className="flex justify-center items-center gap-2">
                      {getStatusBadge(session.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
