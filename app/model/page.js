"use client";

import { useState, useEffect } from 'react';
import { Loader2, Save, AlertCircle, TrendingUp } from 'lucide-react';

export default function EditModelPortfolio() {
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
      setError('Failed to load model funds');
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
      setError(`Total allocation must be exactly 100%. Current is ${currentTotal.toFixed(2)}%.`);
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
      
      if (!res.ok) throw new Error(resData.error || 'Failed to save allocations');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Model Portfolio</h1>
          <p className="text-gray-500 mt-1">Adjust target allocation percentages. Must sum exactly to 100%.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving || !isValidTotal}
          className={`px-4 py-2 text-white shadow-sm rounded-md font-medium flex items-center gap-2 transition-colors
            ${success ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} 
            ${(saving || !isValidTotal) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
           success ? <CheckCircle className="w-4 h-4" /> : 
           <Save className="w-4 h-4" />}
          {success ? 'Saved!' : 'Save Allocations'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`p-4 border-b flex justify-between items-center transition-colors 
          ${isValidTotal ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${isValidTotal ? 'text-indigo-600' : 'text-orange-500'}`} />
            <span className="font-semibold text-gray-900">Total Allocation</span>
          </div>
          <div className={`text-xl font-bold ${isValidTotal ? 'text-indigo-600' : 'text-orange-600'}`}>
            {currentTotal.toFixed(2)}%
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Asset Class</th>
              <th className="px-6 py-4">Fund Name</th>
              <th className="px-6 py-4 text-right w-48">Allocation (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {funds.map((fund) => (
              <tr key={fund.fund_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md uppercase tracking-wide">
                    {fund.asset_class}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {fund.fund_name}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01"
                      value={fund.allocation_pct}
                      onChange={(e) => handleChange(fund.fund_id, e.target.value)}
                      className="w-24 text-right border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                    />
                    <span className="text-gray-500 font-medium">%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// Add CheckCircle icon since it was missed in the import
import { CheckCircle } from 'lucide-react';
