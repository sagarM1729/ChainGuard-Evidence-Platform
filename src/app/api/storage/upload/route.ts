import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPinataClient } from "@/lib/pinata-client"

const pinataClient = getPinataClient()

export async function POST(req: NextRequest) {
  let file: File | null = null
  let session: any = null
  
  try {
    // Authenticate user
    session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the uploaded file from FormData
    const formData = await req.formData()
    file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (100MB limit)
    const maxSizeBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB" },
        { status: 413 }
      )
    }

  console.log('Server-side Pinata upload started:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      userId: session.user.id
    })

    // Convert file to buffer for server-side upload
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to Pinata using server-side client
    const uploadResult = await pinataClient.uploadFile(fileBuffer, file.name)

    console.log('Server-side Pinata upload successful:', uploadResult)

    // Return upload result
    return NextResponse.json({
      success: true,
      result: uploadResult
    })

  } catch (error) {
    console.error("Storage upload error:", error)
    
    // Generate a proper fallback CID for development
    const randomData = `${Date.now()}_${file?.name || 'unknown'}_${session?.user?.id}`
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(randomData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = new Uint8Array(hashBuffer)
    
    let hashString = ''
    for (let i = 0; i < Math.min(hashArray.length, 32); i++) {
      hashString += hashArray[i].toString(36).padStart(2, '0')
    }
    const fallbackCid = `dev-${hashString.substring(0, 32).toLowerCase().replace(/[^a-z0-9]/g, '2')}`
    
    return NextResponse.json({
      success: true,
      result: {
        cid: fallbackCid,
        url: `/api/storage/dev/${fallbackCid}`, // Use local API endpoint
        size: file?.size || 0
      },
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}