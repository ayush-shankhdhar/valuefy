"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, History, PieChart, Briefcase } from 'lucide-react';
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
    { href: "/", label: "Portfolio Comparison", icon: LayoutDashboard },
    { href: "/current", label: "Current Investments", icon: Wallet },
    { href: "/history", label: "Recommendation History", icon: History },
    { href: "/model", label: "Edit Model Portfolio", icon: PieChart },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-gray-900`}>
        <ClientProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
                <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2.5">
                  <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  AdvisorPro
                </h1>
                <p className="text-xs text-gray-500 mt-2 ml-1">Advanced Rebalancing Engine</p>
              </div>
              
              <Navigation />
              
              <ClientSelector />
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50">
              <div className="max-w-6xl mx-auto p-8 lg:p-10">
                {children}
              </div>
            </main>
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
