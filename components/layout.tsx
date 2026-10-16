"use client";

import { useState } from "react";
import Link from "next/link";

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header */}
      <header className="border-b bg-background/50 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">InvestShield</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex md:w-64 border-r flex-col">
          <nav className="p-6 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary text-primary-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </Link>
            <Link
              href="/watchlist"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><star></star></svg>
              Watchlist
            </Link>
            <Link
              href="/portfolio"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><briefcase></briefcase></svg>
              Portfolio
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><settings-2></settings-2></svg>
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r md:hidden transform transition-transform translate-x-0" style={{ transform: "translateX(0)" }}>
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-bold">Menu</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <nav className="p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary text-primary-foreground">Dashboard</Link>
            <Link href="/watchlist" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">Watchlist</Link>
            <Link href="/portfolio" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">Portfolio</Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">Settings</Link>
          </nav>
        </aside>
      )}
    </div>
  );
}