import { NextRequest, NextResponse } from "next/server"
import { storachaClient } from "@/lib/web3storage"

// Temporarily remove auth requirement for testing
export async function GET(req: NextRequest) {
  try {
    console.log('Running Storacha connection test...')
    
    // Test the connection
    const result = await storachaClient.testConnection()
    
    console.log('Storacha connection test result:', result)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
      timestamp: new Date().toISOString(),
      environment: {
        hasXAuthSecret: !!process.env.STORACHA_X_AUTH_SECRET,
        hasAuthorization: !!process.env.STORACHA_AUTHORIZATION,
        authTokenLength: process.env.STORACHA_AUTHORIZATION?.length || 0,
        authTokenStart: process.env.STORACHA_AUTHORIZATION?.substring(0, 20) + '...' || 'none'
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