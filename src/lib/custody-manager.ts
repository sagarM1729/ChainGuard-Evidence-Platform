import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

interface CustodyEntry {
  officer: string
  timestamp: string
  action: string
  ipfsCid: string
  notes?: string
  location?: string
}

export class CustodyChainManager {
  
  static async addCustodyEntry(
    evidenceId: string,
    officer: string,
    action: string,
    notes?: string,
    location?: string
  ): Promise<void> {
    try {
      // Get current evidence with custody chain
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId },
        select: { 
          custodyChain: true, 
          ipfsCid: true,
          filename: true,
          caseId: true
        }
      })

      if (!evidence) {
        throw new Error('Evidence not found')
      }

      // Parse existing custody chain
      let existingChain: CustodyEntry[] = []
      try {
        if (evidence.custodyChain) {
          existingChain = typeof evidence.custodyChain === 'string'
            ? JSON.parse(evidence.custodyChain)
            : evidence.custodyChain as unknown as CustodyEntry[]
        }
      } catch (error) {
        console.error('Error parsing existing custody chain:', error)
        existingChain = []
      }

      // Create new custody entry
      const newEntry: CustodyEntry = {
        officer: officer,
        timestamp: new Date().toISOString(),
        action: action,
        ipfsCid: evidence.ipfsCid || 'N/A',
        notes: notes,
        location: location
      }

      // Add to chain
      const updatedChain = [...existingChain, newEntry]

      // Update evidence record
      await prisma.evidence.update({
        where: { id: evidenceId },
        data: {
          custodyChain: JSON.stringify(updatedChain)
        }
      })

      // Log activity
      await prisma.activity.create({
        data: {
          id: randomUUID(),
          type: 'CHAIN_CUSTODY_VERIFIED',
          title: `Custody chain updated: ${action}`,
          description: `${action} performed on evidence ${evidence.filename} by ${officer}`,
          userId: officer,
          caseId: evidence.caseId,
          evidenceId: evidenceId
        }
      })

    } catch (error) {
      console.error('Error adding custody entry:', error)
      throw error
    }
  }

  static async getCustodyChain(evidenceId: string): Promise<CustodyEntry[]> {
    try {
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId },
        select: { custodyChain: true }
      })

      if (!evidence?.custodyChain) {
        return []
      }

      return typeof evidence.custodyChain === 'string'
        ? JSON.parse(evidence.custodyChain)
        : evidence.custodyChain as unknown as CustodyEntry[]
        
    } catch (error) {
      console.error('Error getting custody chain:', error)
      return []
    }
  }

  static validateCustodyAction(action: string): boolean {
    const validActions = [
      'INITIAL_UPLOAD',
      'EVIDENCE_VIEWED', 
      'EVIDENCE_DOWNLOADED',
      'EVIDENCE_VERIFIED',
      'EVIDENCE_ANALYZED',
      'EVIDENCE_SHARED',
      'EVIDENCE_MODIFIED',
      'EVIDENCE_DELETED',
      'CUSTODY_TRANSFERRED',
      'CUSTODY_REPORT_GENERATED'
    ]
    
    return validActions.includes(action)
  }
}

// Helper function for quick custody updates
export async function updateCustodyChain(
  evidenceId: string,
  userEmail: string,
  action: string,
  notes?: string
): Promise<void> {
  if (!CustodyChainManager.validateCustodyAction(action)) {
    throw new Error(`Invalid custody action: ${action}`)
  }

  await CustodyChainManager.addCustodyEntry(
    evidenceId,
    userEmail,
    action,
    notes
  )
}