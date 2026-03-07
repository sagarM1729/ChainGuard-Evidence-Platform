import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user has admin permissions
    if (!hasPermission(session.user.role, 'VIEW_ALL_USERS')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view users' },
        { status: 403 }
      )
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        badge: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      users,
      total: users.length
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user has admin permissions
    if (!hasPermission(session.user.role, 'MANAGE_USERS')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage users' },
        { status: 403 }
      )
    }
    
    const { name, email, role, department, badge, password } = await req.json()
    
    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Name, email, role, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        role: role as any,
        department: department || 'General',
        badge,
        password: hashedPassword,
        updatedAt: new Date()
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

    // Add to whitelist if not already there
    const existingWhitelist = await prisma.whitelist.findUnique({
      where: { email }
    })

    if (!existingWhitelist) {
      await prisma.whitelist.create({
        data: {
          id: crypto.randomUUID(),
          email
        }
      })
    }

    // Log activity
    await prisma.activity.create({
      data: {
        id: crypto.randomUUID(),
        type: 'USER_CREATED',
        title: 'User Created',
        description: `Created user account for ${name} (${email})`,
        userId: session.user.id,
        metadata: {
          targetUserId: newUser.id,
          targetEmail: email,
          role: role,
          department: department || 'General',
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      }
    })
    
    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}