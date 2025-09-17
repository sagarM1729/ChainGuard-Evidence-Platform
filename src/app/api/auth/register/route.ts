import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    console.log('Register API called')
    
    // Receive Data from Frontend
    const { name, email, password } = await req.json()
    console.log('Received data:', { name, email, passwordLength: password?.length })

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    console.log('Checking whitelist for email:', email)
    // Security Check #1: Check Whitelist
    const whitelistedEmail = await prisma.whitelist.findUnique({
      where: { email }
    })
    console.log('Whitelist check result:', whitelistedEmail)

    if (!whitelistedEmail) {
      console.log('Email not whitelisted:', email)
      return NextResponse.json(
        { error: "Access Denied: Email not authorized" },
        { status: 403 }
      )
    }

    console.log('Checking for existing user')
    // Security Check #2: Validate and Check for Duplicates
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    console.log('Hashing password')
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
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
