import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Receive Data from Frontend
    const { name, email, password } = await req.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Security Check #1: Check Whitelist
    const whitelistedEmail = await (prisma as any).whitelist.findUnique({
      where: { email }
    })

    if (!whitelistedEmail) {
      return NextResponse.json(
        { error: "Access Denied: Email not authorized" },
        { status: 403 }
      )
    }

    // Security Check #2: Validate and Check for Duplicates
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Security Critical: Hash the Password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create the User in the Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    // Send Success Response
    return NextResponse.json(
      { 
        message: "Account created successfully",
        user: newUser
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
