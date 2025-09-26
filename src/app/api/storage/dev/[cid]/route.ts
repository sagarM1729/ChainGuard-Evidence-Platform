import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params
    
    // Check if this is a development CID
    if (!cid.startsWith('dev-')) {
      return NextResponse.json(
        { error: "Invalid development CID" },
        { status: 400 }
      )
    }
    
    // For development, return a placeholder response indicating the file is not available
    const placeholderContent = `
# Development File Placeholder

**CID**: ${cid}

This is a placeholder for evidence stored during development when Pinata/IPFS is unavailable.

**Status**: File upload simulated successfully, but actual file content is not available in development mode.

**Original filename**: ${cid.includes('_') ? 'Unknown' : 'File'}
**Upload timestamp**: ${new Date().toISOString()}

To view actual files:
1. Ensure Pinata credentials are configured (PINATA_JWT or API key/secret)
2. Upload evidence again once Pinata is reachable
3. Files will be stored on IPFS and accessible via your configured gateway
`
    
    return new NextResponse(placeholderContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
        'X-Development-Placeholder': 'true'
      }
    })
    
  } catch (error) {
    console.error("Development storage error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve development file" },
      { status: 500 }
    )
  }
}