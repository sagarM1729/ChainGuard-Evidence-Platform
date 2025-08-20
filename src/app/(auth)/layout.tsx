// 🏗️ Layout for the (auth) route group
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  )
}
