import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateCustodyChain } from '@/lib/custody-manager'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ evidenceId: string }> }
): Promise<NextResponse> {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
        { status: 401 }
      )
    }

    const { evidenceId } = await context.params
    const body = await request.json()
    const { action, notes } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence ID is required' },
        { status: 400 }
      )
    }

    // Update custody chain
    await updateCustodyChain(
      evidenceId,
      session.user.email,
      action,
      notes || `Evidence ${action.toLowerCase().replace('_', ' ')} by ${session.user.name || session.user.email}`
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Custody chain updated successfully',
      action: action,
      officer: session.user.email 
    })

  } catch (error) {
    console.error('Error updating custody chain:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update custody chain',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}