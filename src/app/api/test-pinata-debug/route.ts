import { NextRequest, NextResponse } from "next/server"
import { getPinataClient } from "@/lib/pinata-client"

const pinataClient = getPinataClient()

// Diagnostic endpoint to verify Pinata connectivity without auth requirements
export async function GET(req: NextRequest) {
  try {
    const result = await pinataClient.testConnection()

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message,
        details: result.details,
        suggestedFix: "Verify PINATA_JWT or API key/secret environment variables"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      details: result.details
    })
  } catch (error) {
    console.error("Pinata debug test failed", error)

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
