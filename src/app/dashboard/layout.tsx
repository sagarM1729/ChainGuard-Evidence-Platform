"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { LogOut, User, Home, Folder, Upload } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/login") // Redirect to login if not authenticated
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e1e5f2] to-[#bfdbf7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f7a8c] mx-auto mb-4"></div>
          <p className="text-[#022b3a] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e1e5f2] to-[#bfdbf7]">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-[#1f7a8c]/10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-lg blur opacity-30"></div>
                <div className="relative bg-white p-2 rounded-lg shadow-md border border-[#1f7a8c]/20">
                  <Image 
                    src="/blockchain.png" 
                    alt="ChainGuard Logo" 
                    width={24} 
                    height={24}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard</span>
                <span className="text-xs text-[#022b3a]/70 font-medium tracking-wide">EVIDENCE PLATFORM</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="flex items-center space-x-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors">
                <Home className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/dashboard/cases" className="flex items-center space-x-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors">
                <Folder className="h-4 w-4" />
                <span className="font-medium">Cases</span>
              </Link>
              <Link href="/dashboard/evidence/upload" className="flex items-center space-x-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors">
                <Upload className="h-4 w-4" />
                <span className="font-medium">Upload Evidence</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-full shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-[#022b3a]">{session.user?.name}</p>
                  <p className="text-xs text-[#022b3a]/60">{session.user?.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
