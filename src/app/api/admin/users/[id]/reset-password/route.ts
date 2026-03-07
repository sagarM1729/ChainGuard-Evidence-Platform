import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'
import bcrypt from 'bcryptjs'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!hasPermission(session.user.role, 'MANAGE_USERS')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage users' },
        { status: 403 }
      )
    }
    
    const params = await context.params
    const { id: userId } = params
    const { newPassword } = await req.json()
    
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    
    // Log activity
    await prisma.activity.create({
      data: {
        id: crypto.randomUUID(),
        type: 'USER_UPDATED',
        title: 'Password Reset',
        description: `Password reset for user ${existingUser.name} (${existingUser.email})`,
        userId: session.user.id,
        metadata: {
          targetUserId: userId,
          targetEmail: existingUser.email,
          action: 'password_reset',
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      }
    })
    
    return NextResponse.json({
      message: 'Password reset successfully'
    })
    
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}