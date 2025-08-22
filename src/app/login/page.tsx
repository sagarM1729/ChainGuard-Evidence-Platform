"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  // --- State Hooks for Form Inputs ---
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Check for success message from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const message = urlParams.get('message')
      if (message) {
        setSuccessMessage(message)
        // Clear the URL params
        window.history.replaceState({}, '', '/login')
      }
    }
  }, [])

  // --- Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        // Login successful - redirect to dashboard
        router.push('/dashboard')
      } else {
        // Login failed
        setError('Invalid email or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const goToSignup = () => {
    router.replace('/signup')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e1e5f2] to-[#bfdbf7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#1f7a8c]/20">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-[#1f7a8c] hover:text-[#022b3a] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* --- Header --- */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] rounded-2xl shadow-lg">
              <Image 
                src="/blockchain.png" 
                alt="ChainGuard Logo" 
                width={48} 
                height={48}
                className="object-contain filter brightness-0 invert"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#022b3a] mb-2">Welcome Back</h1>
          <p className="text-[#022b3a]/70">Sign in to ChainGuard Evidence Platform</p>
        </div>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-[#022b3a] font-semibold mb-2 block">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-[#022b3a] font-semibold mb-2 block">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#022b3a]/60 hover:text-[#1f7a8c] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-[#1f7a8c] hover:text-[#022b3a] hover:underline transition-colors font-medium">
              Forgot your password?
            </Link>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
            <span className="relative z-10">
              {isLoading ? "Signing In..." : "Sign In"}
            </span>
          </Button>
        </form>

        {/* Bottom Link */}
        <div className="text-center mt-8 pt-6 border-t border-[#1f7a8c]/20">
          <p className="text-[#022b3a]">
            Don&apos;t have an account?{" "}
            <button 
              onClick={goToSignup}
              className="text-[#1f7a8c] hover:text-[#022b3a] font-semibold hover:underline transition-colors cursor-pointer"
            >
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}