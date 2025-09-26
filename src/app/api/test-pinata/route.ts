import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPinataClient } from "@/lib/pinata-client"

const pinataClient = getPinataClient()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('Testing Pinata connection...')

    const result = await pinataClient.testConnection()

    console.log('Pinata connection test result:', result)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
      timestamp: new Date().toISOString(),
      environment: {
        hasJwt: !!process.env.PINATA_JWT,
        hasApiKey: !!process.env.PINATA_API_KEY,
        hasApiSecret: !!process.env.PINATA_API_SECRET,
        gateway: process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs'
      }
    })

  } catch (error) {
    console.error("Pinata test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to test Pinata connection",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
