"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, History, PieChart, Briefcase, ChevronRight } from 'lucide-react';
import { ClientProvider } from '@/lib/ClientContext';
import ClientSelector from '@/components/ClientSelector';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/current", label: "Client Holdings", icon: Wallet },
    { href: "/history", label: "Execution History", icon: History },
    { href: "/model", label: "Model Allocation", icon: PieChart },
  ];

  return (
    <nav className="flex-1 p-6 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Main Menu</p>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`flex items-center justify-between group px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-[0_8px_30px_rgb(79,70,229,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
              {link.label}
            </div>
            {isActive && <ChevronRight className="w-4 h-4" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-slate-200 selection:bg-indigo-500/30`}>
        <ClientProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 bg-[#0f172a]/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-20">
              <div className="p-8 pb-10">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                      Quant<span className="text-indigo-500">Wealth</span>
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Advisor Suite</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Navigation />
              
              <div className="px-6 py-8 mt-auto">
                <ClientSelector />
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto relative bg-[#020617]">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -z-10 w-[800px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full opacity-50"></div>
              <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[400px] bg-violet-600/5 blur-[100px] rounded-full opacity-30"></div>
              
              <div className="max-w-7xl mx-auto p-10 lg:p-14">
                {children}
              </div>
            </main>
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
