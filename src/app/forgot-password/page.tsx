"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("If an account with that email exists, a reset code has been sent.")
        // Redirect to reset password page after 2 seconds
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        }, 2000)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
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
            href="/login" 
            className="inline-flex items-center text-[#1f7a8c] hover:text-[#022b3a] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
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
          <h1 className="text-3xl font-bold text-[#022b3a] mb-2">Forgot Password</h1>
          <p className="text-[#022b3a]/70">Enter your email to receive a password reset code</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Success Message */}
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-600 font-medium">{message}</p>
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#1f7a8c]/20 rounded-xl bg-white/80 text-[#022b3a] placeholder-[#022b3a]/50 focus:border-[#1f7a8c] focus:outline-none focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all outline-none"
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
            <span className="relative z-10">
              {isLoading ? "Sending..." : "Send Reset Code"}
            </span>
          </Button>
        </form>

        {/* Bottom Link */}
        <div className="text-center mt-8 pt-6 border-t border-[#1f7a8c]/20">
          <p className="text-[#022b3a]">
            Remember your password?{" "}
            <Link href="/login" className="text-[#1f7a8c] hover:text-[#022b3a] font-semibold hover:underline transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
