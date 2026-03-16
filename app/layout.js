import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LayoutDashboard, Wallet, History, PieChart } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Portfolio Rebalancer",
  description: "Financial advisor portfolio rebalancing tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                <PieChart className="w-6 h-6" />
                Rebalancer
              </h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600">
                <LayoutDashboard className="w-5 h-5" />
                Portfolio Comparison
              </Link>
              <Link href="/current" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600">
                <Wallet className="w-5 h-5" />
                Current Investments
              </Link>
              <Link href="/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600">
                <History className="w-5 h-5" />
                Recommendation History
              </Link>
              <Link href="/model" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-indigo-600">
                <PieChart className="w-5 h-5" />
                Edit Model Portfolio
              </Link>
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  AS
                </div>
                <div>
                  <p className="text-sm font-medium">Amit Sharma</p>
                  <p className="text-xs text-gray-500">Client</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
