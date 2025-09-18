import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { storachaClient } from "@/lib/web3storage"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('Testing Storacha connection...')
    
    // Test the connection
    const result = await storachaClient.testConnection()
    
    console.log('Storacha connection test result:', result)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      environment: {
        hasXAuthSecret: !!process.env.STORACHA_X_AUTH_SECRET,
        hasAuthorization: !!process.env.STORACHA_AUTHORIZATION,
        bridgeUrl: 'https://up.web3.storage'
      }
    })
    
  } catch (error) {
    console.error("Storacha test error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to test Storacha connection",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}