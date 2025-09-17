"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, CheckCircle, X } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  // --- State Hooks for Form Inputs ---
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // --- Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Show success popup
      setSuccessMessage("Account created successfully! Signing you in...")
      setShowSuccess(true)

      // Automatically sign in the user
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (signInResult?.ok) {
        // Redirect to cases page after a short delay
        setTimeout(() => {
          router.replace('/dashboard/cases')
        }, 2000)
      } else {
        // If auto sign-in fails, redirect to login
        setTimeout(() => {
          router.replace('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const goToLogin = () => {
    router.replace('/login')
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
          <h1 className="text-3xl font-bold text-[#022b3a] mb-2">Create Account</h1>
          <p className="text-[#022b3a]/70">Join ChainGuard Evidence Platform</p>
        </div>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <Label htmlFor="name" className="text-[#022b3a] font-semibold mb-2 block">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

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
                placeholder="Create a strong password"
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
            <p className="text-xs text-[#022b3a]/60 mt-2">Use 8+ characters with letters, numbers & symbols</p>
          </div>

          {/* Terms and Privacy */}
          <div className="text-sm text-[#022b3a] bg-[#bfdbf7]/30 p-4 rounded-xl border border-[#1f7a8c]/10">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-[#1f7a8c] hover:text-[#022b3a] hover:underline font-semibold transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-[#1f7a8c] hover:text-[#022b3a] hover:underline font-semibold transition-colors">Privacy Policy</a>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
            <span className="relative z-10">
              {isLoading ? "Creating Account..." : "Create Account"}
            </span>
          </Button>
        </form>

        {/* Bottom Link */}
        <div className="text-center mt-8 pt-6 border-t border-[#1f7a8c]/20">
          <p className="text-[#022b3a]">
            Already have an account?{" "}
            <button 
              onClick={goToLogin}
              className="text-[#1f7a8c] hover:text-[#022b3a] font-semibold hover:underline transition-colors cursor-pointer"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-in slide-in-from-bottom duration-300">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-[#1f7a8c] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}