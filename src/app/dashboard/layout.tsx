// 🖼️ Dashboard layout with navigation
import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="flex">
        {/* Sidebar placeholder */}
        <aside className="w-64 bg-slate-800 min-h-screen p-4">
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
          <nav className="space-y-2">
            <div className="text-slate-300">Navigation placeholder</div>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
