"use client";

import { useClient } from '@/lib/ClientContext';
import { Users } from 'lucide-react';

export default function ClientSelector() {
  const { clientId, setClient, clients } = useClient();

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50/50">
      <div className="flex items-center gap-2 mb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <Users className="w-4 h-4" />
        Select Client
      </div>
      <div className="relative">
        <select 
          value={clientId} 
          onChange={(e) => setClient(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2.5 shadow-sm transition-all cursor-pointer hover:border-gray-300"
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
