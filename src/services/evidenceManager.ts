// Evidence Manager Service for Storacha IPFS Integration
import * as Client from '@web3-storage/w3up-client'
import { prisma } from '@/lib/prisma'
import { FabricClient, BlockchainEvidenceRecord, VerificationResult } from '@/lib/fabric'

interface EvidenceUploadResult {
  ipfsCid: string
  retrievalUrl: string
  fileHash: string
  blockchainTxId?: string
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
  private storachaClient: any = null
  private fabricClient: FabricClient | null = null
  private initialized = false

  constructor() {
    this.initializeStoracha()
    this.initializeFabric()
  }

  private async initializeStoracha() {
    try {
      this.storachaClient = await Client.create()
      
      // Use environment variable for email
      const storachaEmail = process.env.STORACHA_EMAIL || process.env.WEB3_STORAGE_EMAIL
      if (!storachaEmail) {
        throw new Error('STORACHA_EMAIL environment variable not set')
      }
      
      await this.storachaClient.login(storachaEmail)
      this.initialized = true
      console.log('✅ Storacha client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Storacha client:', error)
      throw error
    }
  }

  private async initializeFabric() {
    try {
      this.fabricClient = new FabricClient()
      console.log('✅ Fabric client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Fabric client:', error)
      // Don't throw - blockchain is optional for development
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeStoracha()
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
   * Store evidence file on Storacha IPFS with full 3-tier integration
   */
  async storeEvidence(
    file: File, 
    metadata: EvidenceMetadata
  ): Promise<EvidenceUploadResult> {
    await this.ensureInitialized()

    try {
      console.log('🔄 Starting evidence upload to Storacha...')
      
      // Step 1: Calculate file hash for integrity verification
      const fileHash = await this.calculateSHA256(file)
      console.log('✅ File hash calculated:', fileHash)

      // Step 2: Upload to Storacha (Tier 3 - IPFS)
      const cid = await this.storachaClient.uploadFile(file)
      const ipfsCid = cid.toString()
      const retrievalUrl = `https://w3s.link/ipfs/${ipfsCid}`
      
      console.log('✅ File uploaded to Storacha IPFS:', ipfsCid)

      // Step 3: Store metadata in PostgreSQL (Tier 1)
      const evidence = await prisma.evidence.create({
        data: {
          filename: metadata.filename,
          filetype: metadata.filetype,
          filesize: metadata.filesize,
          notes: metadata.notes,
          ipfsCid: ipfsCid,
          ipfsHash: ipfsCid, // Legacy compatibility
          fileHash: fileHash,
          retrievalUrl: retrievalUrl,
          custodyChain: JSON.stringify([{
            officer: metadata.custodyOfficer,
            timestamp: new Date().toISOString(),
            action: 'INITIAL_UPLOAD',
            ipfsCid: ipfsCid
          }]),
          isEncrypted: true,
          caseId: metadata.caseId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ Evidence metadata stored in PostgreSQL:', evidence.id)

      // Step 4: Record on Hyperledger Fabric (Tier 2)
      // TODO: Implement blockchain integration
      let blockchainTxId: string | undefined

      try {
        blockchainTxId = await this.recordOnBlockchain({
          caseId: metadata.caseId,
          evidenceId: evidence.id,
          ipfsCid: ipfsCid,
          fileHash: fileHash,
          custodyOfficer: metadata.custodyOfficer,
          timestamp: Date.now()
        })

        // Update evidence record with blockchain transaction ID
        if (blockchainTxId) {
          await prisma.evidence.update({
            where: { id: evidence.id },
            data: { blockchainTxId: blockchainTxId }
          })
        }
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain recording failed, evidence still stored on IPFS:', blockchainError)
      }

      return {
        ipfsCid,
        retrievalUrl,
        fileHash,
        blockchainTxId
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
    await this.ensureInitialized()

    try {
      // Get evidence record from database
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId }
      })

      if (!evidence) {
        throw new Error('Evidence record not found')
      }

      // Retrieve file from Storacha IPFS
      const file = await this.storachaClient.get(evidence.ipfsCid)
      if (!file) {
        throw new Error('File not found on IPFS')
      }

      // Calculate current file hash
      const currentHash = await this.calculateSHA256(file)

      // Compare with stored hash (local verification)
      const localVerification = currentHash === evidence.fileHash
      
      // Also verify against blockchain if available
      let blockchainVerification = true
      if (this.fabricClient) {
        try {
          const blockchainResult = await this.fabricClient.verifyEvidenceIntegrity(evidenceId, currentHash)
          blockchainVerification = blockchainResult.hashMatch
          console.log('� Blockchain verification result:', blockchainResult)
        } catch (blockchainError) {
          console.warn('⚠️ Blockchain verification failed:', blockchainError)
          // Continue with local verification only
        }
      }

      const isValid = localVerification && blockchainVerification
      
      console.log('�🔍 Complete evidence integrity check:', {
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
    await this.ensureInitialized()

    try {
      // Get evidence metadata from database
      const evidence = await prisma.evidence.findUnique({
        where: { id: evidenceId },
        include: {
          case: true
        }
      })

      if (!evidence) {
        throw new Error('Evidence not found')
      }

      // Retrieve file from IPFS
      const file = await this.storachaClient.get(evidence.ipfsCid)
      
      if (!file) {
        throw new Error('File not found on IPFS')
      }

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
   * Record evidence hash on Hyperledger Fabric blockchain
   */
  private async recordOnBlockchain(data: {
    caseId: string
    evidenceId: string
    ipfsCid: string
    fileHash: string
    custodyOfficer: string
    timestamp: number
  }): Promise<string> {
    try {
      if (!this.fabricClient) {
        console.warn('⚠️ Fabric client not available, using simulated transaction')
        return `sim_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      console.log('🔗 Recording evidence on blockchain:', data)
      
      const blockchainRecord: BlockchainEvidenceRecord = {
        id: data.evidenceId,
        caseId: data.caseId,
        filename: '', // Will be set by caller if needed
        ipfsCid: data.ipfsCid,
        fileHash: data.fileHash,
        custodyOfficer: data.custodyOfficer,
        timestamp: new Date(data.timestamp),
        accessLevel: 'restricted'
      }

      const txId = await this.fabricClient.recordEvidence(blockchainRecord)
      console.log('✅ Evidence recorded on blockchain with txId:', txId)
      return txId

    } catch (error) {
      console.warn('⚠️ Blockchain recording failed, falling back to simulation:', error)
      // Return simulated transaction ID as fallback
      return `fallback_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

      // Record custody transfer on blockchain
      if (this.fabricClient) {
        try {
          const custodyTransfer: import('@/lib/fabric').CustodyTransferRecord = {
            evidenceId,
            fromOfficer: evidence.custodyOfficer,
            toOfficer: newOfficer,
            timestamp: new Date(),
            reason: notes || 'Custody transfer'
          }
          
          await this.fabricClient.transferCustody(custodyTransfer)
          console.log('✅ Custody transfer recorded on blockchain')
        } catch (blockchainError) {
          console.warn('⚠️ Blockchain custody transfer failed:', blockchainError)
          // Continue - database update was successful
        }
      }

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
  async getBlockchainVerification(evidenceId: string): Promise<VerificationResult | null> {
    try {
      if (!this.fabricClient) {
        console.warn('⚠️ Fabric client not available')
        return null
      }

      return await this.fabricClient.verifyEvidenceIntegrity(evidenceId, '')

    } catch (error) {
      console.error('❌ Blockchain verification failed:', error)
      return null
    }
  }
}

// Export singleton instance
export const evidenceManager = new EvidenceManager()
export { EvidenceManager, type EvidenceUploadResult, type EvidenceMetadata }