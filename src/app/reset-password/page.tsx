"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Pre-populate email from URL params
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to login with success message (replace history)
        router.replace('/login?message=Password updated successfully')
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e1e5f2] to-[#bfdbf7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#1f7a8c]/20">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/forgot-password" 
            className="inline-flex items-center text-[#1f7a8c] hover:text-[#022b3a] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forgot Password
          </Link>
        </div>

        {/* Header */}
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
          <h1 className="text-3xl font-bold text-[#022b3a] mb-2">Reset Password</h1>
          <p className="text-[#022b3a]/70">Enter the 6-digit code sent to your email and your new password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none"
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          {/* OTP Field */}
          <div>
            <Label htmlFor="otp" className="text-[#022b3a] font-semibold mb-2 block">Reset Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-[#022b3a]/60 mt-2">Enter the 6-digit code sent to your email</p>
          </div>

          {/* New Password Field */}
          <div>
            <Label htmlFor="newPassword" className="text-[#022b3a] font-semibold mb-2 block">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none"
                placeholder="Enter your new password"
                required
                disabled={isLoading}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#022b3a]/60 hover:text-[#1f7a8c] transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-[#022b3a]/60 mt-2">Use 8+ characters with letters, numbers & symbols</p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || otp.length !== 6}
            className="group relative w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
            <span className="relative z-10">
              {isLoading ? "Updating Password..." : "Update Password"}
            </span>
          </Button>
        </form>

        {/* Bottom Link */}
        <div className="text-center mt-8 pt-6 border-t border-[#1f7a8c]/20">
          <p className="text-[#022b3a]">
            Didn&apos;t receive a code?{" "}
            <Link href="/forgot-password" className="text-[#1f7a8c] hover:text-[#022b3a] font-semibold hover:underline transition-colors">
              Try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
