import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PUT(req: NextRequest, context: RouteContext) {
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
    const { id } = params
    const { name, role, department, badge } = await req.json()
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prevent admins from demoting themselves
    if (id === session.user.id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot demote yourself from admin role' },
        { status: 400 }
      )
    }
    
    // Build list of changed fields for detailed logging
    const changes: Record<string, { from: string | null; to: string | null }> = {}
    if (name && name !== existingUser.name) changes.name = { from: existingUser.name, to: name }
    if (role && role !== existingUser.role) changes.role = { from: existingUser.role, to: role }
    if (department && department !== existingUser.department) changes.department = { from: existingUser.department, to: department }
    if (badge && badge !== existingUser.badge) changes.badge = { from: existingUser.badge, to: badge }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role: role as any }),
        ...(department && { department }),
        ...(badge && { badge })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badge: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // Log activity with detailed metadata
    await prisma.activity.create({
      data: {
        id: crypto.randomUUID(),
        type: 'USER_UPDATED',
        title: 'User Updated',
        description: `Updated user account for ${updatedUser.name} (${updatedUser.email})`,
        userId: session.user.id,
        metadata: {
          targetUserId: id,
          targetEmail: updatedUser.email,
          changedFields: Object.keys(changes),
          changes,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      }
    })
    
    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
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
    const { id } = params
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prevent admins from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }
    
    // Check if user has any cases assigned
    const userCases = await prisma.case.count({
      where: { officerId: id }
    })
    
    if (userCases > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with assigned cases. Reassign cases first.' },
        { status: 400 }
      )
    }
    
    // Delete user (this will cascade delete related whitelist entries)
    await prisma.user.delete({
      where: { id }
    })
    
    // Log activity with metadata
    await prisma.activity.create({
      data: {
        id: crypto.randomUUID(),
        type: 'USER_DELETED',
        title: 'User Deleted',
        description: `Deleted user account for ${existingUser.name} (${existingUser.email})`,
        userId: session.user.id,
        metadata: {
          targetUserId: id,
          targetEmail: existingUser.email,
          targetRole: existingUser.role,
          targetDepartment: existingUser.department,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      }
    })
    
    return NextResponse.json({
      message: 'User deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}