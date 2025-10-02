"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { LogOut, User, Home, Folder, Plus, Menu, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity duration-300">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-lg blur opacity-30"></div>
                <div className="relative bg-white p-1.5 sm:p-2 rounded-lg shadow-md border border-[#1f7a8c]/20">
                  <Image 
                    src="/blockchain.png" 
                    alt="ChainGuard Logo" 
                    width={20} 
                    height={20}
                    className="object-contain sm:w-6 sm:h-6"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] bg-clip-text text-transparent">ChainGuard</span>
                <span className="text-[10px] sm:text-xs text-[#022b3a]/70 font-medium tracking-wide">EVIDENCE PLATFORM</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="flex items-center space-x-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors">
                <Home className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/dashboard/cases" className="flex items-center space-x-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors">
                <Folder className="h-4 w-4" />
                <span className="font-medium">Cases</span>
              </Link>
              <Link href="/dashboard/cases/new" className="flex items-center space-x-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create New</span>
              </Link>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-full shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden lg:block">
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
                <span className="font-medium">Sign Out</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#022b3a] hover:text-[#1f7a8c] transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#1f7a8c]/10 bg-white/95 backdrop-blur-lg">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-[#022b3a] hover:text-[#1f7a8c] hover:bg-[#1f7a8c]/5 rounded-lg transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link 
                  href="/dashboard/cases" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-[#022b3a] hover:text-[#1f7a8c] hover:bg-[#1f7a8c]/5 rounded-lg transition-colors"
                >
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">Cases</span>
                </Link>
                <Link 
                  href="/dashboard/cases/new" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-[#022b3a] hover:text-[#1f7a8c] hover:bg-[#1f7a8c]/5 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create New</span>
                </Link>
                
                {/* Mobile User Info */}
                <div className="flex items-center space-x-3 px-4 py-3 border-t border-[#1f7a8c]/10 mt-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-full shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#022b3a]">{session.user?.name}</p>
                    <p className="text-xs text-[#022b3a]/60">{session.user?.email}</p>
                  </div>
                </div>

                {/* Mobile Logout Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-[#022b3a] hover:text-[#1f7a8c] hover:bg-[#1f7a8c]/5 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
