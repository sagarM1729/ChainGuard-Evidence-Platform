// Evidence Manager Service for IPFS Integration with Multi-Provider Support
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { ipfsUploadService } from '@/lib/ipfs-upload'
import { getPinataClient } from '@/lib/pinata-client'
import {
  createLeafHash,
  generateMerkleProof,
  getMerkleRoot,
  verifyMerkleProof,
  type MerkleProof
} from '@/lib/merkle'

interface EvidenceUploadResult {
  ipfsCid: string
  retrievalUrl: string
  fileHash: string
  merkleRoot: string
  merkleProof: MerkleProof
}

interface EvidenceMetadata {
  caseId: string
  filename: string
  filetype: string
  filesize: number
  notes?: string
  custodyOfficer: string
}

class EvidenceManager {
  private readonly pinataClient = getPinataClient()

  /**
   * Ensure Pinata credentials are valid before performing operations.
   */
  private async ensurePinataAuth(): Promise<void> {
    try {
      await this.pinataClient.ready()
    } catch (error) {
      console.error('❌ Pinata authentication failed:', error)
      throw new Error('Pinata authentication failed - upload feature unavailable')
    }
  }

  /**
   * Calculate SHA-256 hash of a file for integrity verification
   */
  async calculateSHA256(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Store evidence file on Pinata IPFS with full 3-tier integration
   */
  async storeEvidence(
    file: File, 
    metadata: EvidenceMetadata
  ): Promise<EvidenceUploadResult> {
    await this.ensurePinataAuth()

    try {
      console.log('🔄 Starting evidence upload to Pinata...')
      
      // Step 1: Calculate file hash for integrity verification
      const fileHash = await this.calculateSHA256(file)
      console.log('✅ File hash calculated:', fileHash)

      // Step 2: Upload to IPFS with multi-provider fallback
      const uploadResult = await ipfsUploadService.uploadFile(file, metadata.filename)
      const ipfsCid = uploadResult.cid
      const retrievalUrl = uploadResult.url
      
      console.log('✅ File uploaded to IPFS:', { 
        cid: ipfsCid, 
        provider: uploadResult.provider,
        size: uploadResult.size 
      })
      
  console.log('✅ File uploaded to Pinata IPFS:', ipfsCid)

      // Step 3: Store metadata in PostgreSQL (Tier 1)
      const evidence = await prisma.evidence.create({
        data: {
          id: crypto.randomUUID(),
          filename: metadata.filename,
          filetype: metadata.filetype,
          filesize: metadata.filesize,
          notes: metadata.notes,
          ipfsCid: ipfsCid,
          ipfsHash: `${ipfsCid}-${Date.now()}`, // Make unique by adding timestamp
          fileHash: fileHash,
          retrievalUrl: retrievalUrl,
          custodyChain: JSON.stringify([{
            officer: metadata.custodyOfficer,
            timestamp: new Date().toISOString(),
            action: 'INITIAL_UPLOAD',
            ipfsCid: ipfsCid
          }]),
          isEncrypted: true,
          verified: false,
          caseId: metadata.caseId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ Evidence metadata stored in PostgreSQL:', evidence.id)

      // Step 4: Update Merkle ledger (Tier 2)
      const { merkleRoot, merkleProof, leafHash } = await this.updateMerkleLedger({
        caseId: metadata.caseId,
        evidenceId: evidence.id,
        ipfsCid,
        fileHash,
        timestamp: evidence.createdAt.toISOString()
      })

      await prisma.evidence.update({
        where: { id: evidence.id },
        data: {
          blockchainHash: leafHash,
          blockchainTxId: merkleRoot, // legacy field now stores root snapshot
          merkleProof: merkleProof as unknown as Prisma.InputJsonValue,
          verified: true
        }
      })

      return {
        ipfsCid,
        retrievalUrl,
        fileHash,
        merkleRoot,
        merkleProof
      }

    } catch (error) {
      console.error('❌ Evidence storage failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to store evidence: ${message}`)
    }
  }

  /**
   * Verify evidence integrity by comparing IPFS content with stored hash and blockchain record
   */
  async verifyEvidenceIntegrity(evidenceId: string): Promise<boolean> {
    await this.ensurePinataAuth()

    try {
      // Get evidence record from database
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId }
      })

      if (!evidence) {
        throw new Error('Evidence record not found')
      }

    // Retrieve file from Pinata IPFS
      const file = await this.pinataClient.downloadFile(evidence.ipfsCid, evidence.filename)

      // Calculate current file hash
      const currentHash = await this.calculateSHA256(file)

      // Compare with stored hash (local verification)
      const localVerification = currentHash === evidence.fileHash
      
      const caseRecord = await prisma.case.findUnique({
        where: { id: evidence.caseId },
        select: {
          id: true,
          merkleRoot: true
        }
      })

      const caseEvidence = await prisma.evidence.findMany({
        where: { caseId: evidence.caseId },
        orderBy: { createdAt: 'asc' }
      })

      const leaves = caseEvidence.map(item =>
        item.blockchainHash ||
        createLeafHash({
          caseId: item.caseId,
          evidenceId: item.id,
          ipfsCid: item.ipfsCid,
          fileHash: item.fileHash,
          timestamp: item.createdAt.toISOString()
        })
      )

      const merkleRoot = getMerkleRoot(leaves)
      const targetIndex = caseEvidence.findIndex(item => item.id === evidence.id)
      const merkleProof =
        targetIndex >= 0
          ? generateMerkleProof(leaves, targetIndex)
          : null

      const blockchainVerification =
        !!merkleProof &&
        !!caseRecord?.merkleRoot &&
        caseRecord.merkleRoot === merkleRoot &&
        verifyMerkleProof(
          merkleProof.leaf,
          merkleProof,
          caseRecord.merkleRoot
        )

      const isValid = localVerification && blockchainVerification

      await prisma.evidence.update({
        where: { id: evidence.id },
        data: {
          verified: isValid,
          merkleProof: merkleProof
            ? (merkleProof as unknown as Prisma.InputJsonValue)
            : undefined
        }
      })

      console.log('🔍 Complete evidence integrity check:', {
        evidenceId,
        ipfsCid: evidence.ipfsCid,
        storedHash: evidence.fileHash,
        currentHash,
        localVerification,
        blockchainVerification,
        isValid
      })

  return isValid

    } catch (error) {
      console.error('❌ Evidence integrity verification failed:', error)
      return false
    }
  }

  /**
   * Retrieve evidence file from IPFS
   */
  async retrieveEvidence(evidenceId: string): Promise<{ file: File, metadata: any }> {
  await this.ensurePinataAuth()

    try {
      // Get evidence metadata from database
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              merkleRoot: true
            }
          }
        }
      })

      if (!evidence) {
        throw new Error('Evidence not found')
      }

      // Retrieve file from IPFS
      const file = await this.pinataClient.downloadFile(evidence.ipfsCid, evidence.filename)

      return {
        file,
        metadata: evidence
      }

    } catch (error) {
      console.error('❌ Evidence retrieval failed:', error)
      throw error
    }
  }

  /**
   * Add custody transfer to evidence chain
   */
  async transferCustody(evidenceId: string, newOfficer: string, notes?: string): Promise<void> {
    try {
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId }
      })

      if (!evidence) {
        throw new Error('Evidence not found')
      }

      // Parse existing custody chain
      let custodyChain = []
      if (evidence.custodyChain) {
        custodyChain = JSON.parse(evidence.custodyChain as string)
      }

      // Add new custody entry
      custodyChain.push({
        officer: newOfficer,
        timestamp: new Date().toISOString(),
        action: 'CUSTODY_TRANSFER',
        notes: notes,
        ipfsCid: evidence.ipfsCid
      })

      // Update database
      await prisma.evidence.update({
        where: { id: evidenceId },
        data: {
          custodyChain: JSON.stringify(custodyChain),
          updatedAt: new Date()
        }
      })

      console.log('✅ Custody transferred:', { evidenceId, newOfficer })

    } catch (error) {
      console.error('❌ Custody transfer failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to transfer custody: ${message}`)
    }
  }

  /**
   * Get blockchain verification result for evidence
   */
  async getMerkleVerification(evidenceId: string) {
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: { case: true }
    })

    if (!evidence) {
      return null
    }

    const caseEvidence = await prisma.evidence.findMany({
      where: { caseId: evidence.caseId },
      orderBy: { createdAt: 'asc' }
    })

    const leaves = caseEvidence.map(item =>
      item.blockchainHash ||
      createLeafHash({
        caseId: item.caseId,
        evidenceId: item.id,
        ipfsCid: item.ipfsCid,
        fileHash: item.fileHash,
        timestamp: item.createdAt.toISOString()
      })
    )

    const targetIndex = caseEvidence.findIndex(item => item.id === evidence.id)
    if (targetIndex === -1) {
      return null
    }

    const proof = generateMerkleProof(leaves, targetIndex)
    const root = getMerkleRoot(leaves)

    const caseRoot = evidence.case?.merkleRoot || null

    return {
      merkleRoot: root,
      proof,
      isValid: caseRoot === root
    }
  }

  private async updateMerkleLedger(input: {
    caseId: string
    evidenceId: string
    ipfsCid: string
    fileHash: string
    timestamp: string
  }) {
    const leafHash = createLeafHash(input)

    const caseEvidence = await prisma.evidence.findMany({
      where: { caseId: input.caseId },
      orderBy: { createdAt: 'asc' }
    })

    const leafById: Record<string, string> = {}

    for (const item of caseEvidence) {
      if (item.id === input.evidenceId) {
        leafById[item.id] = leafHash
        continue
      }

      if (item.blockchainHash) {
        leafById[item.id] = item.blockchainHash
        continue
      }

      leafById[item.id] = createLeafHash({
        caseId: item.caseId,
        evidenceId: item.id,
        ipfsCid: item.ipfsCid,
        fileHash: item.fileHash,
        timestamp: item.createdAt.toISOString()
      })
    }

    const leaves = caseEvidence.map(item => leafById[item.id])
    const merkleRoot = getMerkleRoot(leaves)

    await prisma.case.update({
      where: { id: input.caseId },
      data: {
        merkleRoot
      }
    })

    const missingHashes = Object.entries(leafById).filter(([id, hash]) => {
      const evidence = caseEvidence.find(item => item.id === id)
      return evidence && evidence.blockchainHash !== hash
    })

    if (missingHashes.length > 0) {
      await prisma.$transaction(
        missingHashes.map(([id, hash]) =>
          prisma.evidence.update({
            where: { id },
            data: { blockchainHash: hash }
          })
        )
      )
    }

    const targetIndex = caseEvidence.findIndex(item => item.id === input.evidenceId)
    const merkleProof = generateMerkleProof(leaves, targetIndex)

    return { merkleRoot, merkleProof, leafHash }
  }
}

// Export singleton instance
export const evidenceManager = new EvidenceManager()
export { EvidenceManager, type EvidenceUploadResult, type EvidenceMetadata }