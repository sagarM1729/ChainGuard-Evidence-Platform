import { NextRequest, NextResponse } from "next/server"
import { getPinataClient } from "@/lib/pinata-client"

const pinataClient = getPinataClient()

export async function GET() {
  try {
    console.log('Testing Pinata connection...')

    const result = await pinataClient.testConnection()

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Pinata test connection error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}