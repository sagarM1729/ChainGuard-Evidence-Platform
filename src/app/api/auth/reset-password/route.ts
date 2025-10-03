import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cleanupAllExpiredTokens } from "@/lib/cleanup"

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Find the Token
    const resetToken = await prisma.password_reset_tokens.findFirst({
      where: {
        email,
        expiresAt: {
          gt: new Date() // Token hasn't expired
        }
      },
      orderBy: {
        createdAt: 'desc' // Get the most recent token
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      )
    }

    // Verify the OTP
    const isOTPValid = await bcrypt.compare(otp, resetToken.token)

    if (!isOTPValid) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the Password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // Delete the Token (so it can't be used again)
    await prisma.password_reset_tokens.delete({
      where: { id: resetToken.id }
    })

    // Clean up all expired tokens globally
    await cleanupAllExpiredTokens()

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
