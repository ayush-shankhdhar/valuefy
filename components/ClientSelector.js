"use client";

import { useClient } from '@/lib/ClientContext';
import { Users, ChevronDown } from 'lucide-react';

export default function ClientSelector() {
  const { clientId, setClient, clients } = useClient();

  return (
    <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-2 mb-4 px-1 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
        <Users className="w-3.5 h-3.5" />
        Switch Client
      </div>
      <div className="relative group">
        <select 
          value={clientId} 
          onChange={(e) => setClient(e.target.value)}
          className="w-full appearance-none bg-slate-800/80 border border-slate-700/50 text-white text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block px-4 py-3.5 shadow-inner transition-all cursor-pointer hover:bg-slate-800 group-hover:border-slate-600"
        >
          {clients.map(c => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover:text-indigo-400 transition-colors">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
