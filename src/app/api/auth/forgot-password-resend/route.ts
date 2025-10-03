import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Resend } from 'resend'
import { prisma } from "@/lib/prisma"
import { cleanupAllExpiredTokens } from "@/lib/cleanup"

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Initialize Resend (if API key is provided)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Verify User Exists (but don't reveal if they don't)
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always send the same response to prevent email enumeration
    const response = { message: "If an account with that email exists, a reset code has been sent." }

    // If user doesn't exist, still send success response
    if (!user) {
      return NextResponse.json(response, { status: 200 })
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Hash the OTP
    const hashedOTP = await bcrypt.hash(otp, 12)

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Delete any existing tokens for this email
    await prisma.password_reset_tokens.deleteMany({
      where: { email }
    })

    // Clean up all expired tokens globally
    await cleanupAllExpiredTokens()

    // Store the Hashed OTP
    await prisma.password_reset_tokens.create({
      data: {
        id: crypto.randomUUID(),
        email,
        token: hashedOTP,
        expiresAt
      }
    })

    // Send email using Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: 'ChainGuard <noreply@resend.dev>', // Resend provides this domain for free
          to: email,
          subject: 'ChainGuard - Password Reset Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f7a8c; margin: 0;">ChainGuard Evidence Platform</h1>
              </div>
              
              <h2 style="color: #022b3a;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>You requested a password reset for your ChainGuard Evidence Platform account.</p>
              
              <div style="background: linear-gradient(135deg, #e1e5f2 0%, #bfdbf7 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px solid #1f7a8c;">
                <p style="margin: 0 0 10px 0; color: #022b3a; font-weight: bold;">Your Reset Code:</p>
                <h1 style="color: #1f7a8c; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px;">⏰ This code will expire in <strong>15 minutes</strong>.</p>
              <p style="color: #666; font-size: 14px;">🔒 If you didn't request this reset, please ignore this email.</p>
              
              <hr style="border: none; height: 1px; background: #e1e5f2; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                ChainGuard Evidence Platform - Secure Digital Evidence Management
              </p>
            </div>
          `
        })
        console.log(`✅ Password reset email sent to ${email}`)
      } catch (emailError) {
        console.error("Email sending failed:", emailError)
        // Continue execution - don't fail the request if email fails
      }
    } else {
      // Fallback for development - log the OTP to console
      console.log(`🔐 Password reset OTP for ${email}: ${otp}`)
      console.log("💡 To enable email sending, add RESEND_API_KEY to your environment variables")
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
