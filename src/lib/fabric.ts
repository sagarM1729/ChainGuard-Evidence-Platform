import { Gateway, Network, Contract, Wallets, X509Identity } from 'fabric-network'
import * as fs from 'fs'
import * as path from 'path'

export interface BlockchainEvidenceRecord {
  id: string
  caseId: string
  filename: string
  ipfsCid: string
  fileHash: string
  blockchainHash?: string
  custodyOfficer: string
  timestamp?: Date
  accessLevel: string
}

export interface CustodyTransferRecord {
  evidenceId: string
  fromOfficer: string
  toOfficer: string
  reason: string
  timestamp?: Date
}

export interface VerificationResult {
  evidenceId: string
  originalHash: string
  currentHash: string
  hashMatch: boolean
  blockchainHash: string
  verifiedAt: Date
  custodyOfficer: string
}

class FabricClient {
  private gateway: Gateway | null = null
  private network: Network | null = null
  private contract: Contract | null = null
  private isConnected = false

  constructor() {
    this.gateway = new Gateway()
  }

  /**
   * Connect to Hyperledger Fabric network
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        console.log('Already connected to Fabric network')
        return
      }

      // Check if we should force simulation mode
      const forceSimulation = process.env.FABRIC_SIMULATION_MODE === 'true'
      
      if (forceSimulation) {
        console.log('🔗 Connecting to Hyperledger Fabric network (Forced Simulation Mode)')
        // In simulation mode, we'll simulate the connection
        this.isConnected = true
        console.log('✅ Connected to Fabric network (Simulated)')
        return
      }

      // Try to connect to real Hyperledger Fabric network
      console.log('🔗 Attempting to connect to Hyperledger Fabric network...')

      // Production connection code
      const ccpPath = path.resolve(__dirname, '../../blockchain/network/connection-profile.json')
      const connectionProfile = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))

      // Create wallet
      const walletPath = path.join(process.cwd(), 'blockchain/wallet')
      const wallet = await Wallets.newFileSystemWallet(walletPath)

      // Check if user identity exists
      const identity = await wallet.get('admin')
      if (!identity) {
        throw new Error('Admin identity not found in wallet')
      }

      // Create gateway connection options
      const connectionOptions = {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
      }

      // Connect to gateway
      await this.gateway!.connect(connectionProfile, connectionOptions)

      // Get network and contract
      this.network = await this.gateway!.getNetwork('chainguard-channel')
      this.contract = this.network.getContract('evidence-contract')

      this.isConnected = true
      console.log('✅ Connected to Hyperledger Fabric network')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn('⚠️ Failed to connect to Fabric network, falling back to simulation mode:', errorMessage)
      // Fall back to simulation mode if network is not available
      this.isConnected = true
      console.log('✅ Connected to Fabric network (Simulation Fallback)')
    }
  }

  /**
   * Disconnect from Fabric network
   */
  async disconnect(): Promise<void> {
    if (this.gateway && this.isConnected) {
      await this.gateway.disconnect()
      this.isConnected = false
      console.log('� Disconnected from Fabric network')
    }
  }

  /**
   * Ensure connection before operations
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect()
    }
  }

  /**
   * Record evidence on blockchain
   */
  async recordEvidence(evidence: BlockchainEvidenceRecord): Promise<string> {
    await this.ensureConnection()

    try {
      console.log('�🔗 Recording evidence on blockchain:', evidence.id)

      // In development mode, simulate blockchain transaction
      if (process.env.NODE_ENV !== 'production') {
        const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('✅ Evidence recorded on blockchain (Simulated):', txId)
        return txId
      }

      // Production blockchain call
      const result = await this.contract!.submitTransaction(
        'CreateEvidence',
        evidence.id,
        evidence.caseId,
        evidence.filename,
        evidence.ipfsCid,
        evidence.fileHash,
        evidence.custodyOfficer,
        evidence.accessLevel
      )

      const txId = result.toString()
      console.log('✅ Evidence recorded on blockchain:', txId)
      return txId

    } catch (error) {
      console.error('❌ Failed to record evidence on blockchain:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Blockchain recording failed: ${errorMessage}`)
    }
  }

  /**
   * Verify evidence integrity on blockchain
   */
  async verifyEvidenceIntegrity(evidenceId: string, currentFileHash: string): Promise<VerificationResult> {
    await this.ensureConnection()

    try {
      console.log('🔍 Verifying evidence integrity on blockchain:', evidenceId)

      // In development mode, simulate verification
      if (process.env.NODE_ENV !== 'production') {
        const result: VerificationResult = {
          evidenceId,
          originalHash: currentFileHash, // In real scenario, this would be from blockchain
          currentHash: currentFileHash,
          hashMatch: true, // Simulate successful verification
          blockchainHash: `blockchain_hash_${evidenceId}`,
          verifiedAt: new Date(),
          custodyOfficer: 'system@chainguard.dev'
        }
        console.log('✅ Evidence integrity verified (Simulated):', result)
        return result
      }

      // Production blockchain verification
      const result = await this.contract!.evaluateTransaction(
        'VerifyIntegrity',
        evidenceId,
        currentFileHash
      )

      const verificationResult = JSON.parse(result.toString()) as VerificationResult
      console.log('✅ Evidence integrity verified:', verificationResult)
      return verificationResult

    } catch (error) {
      console.error('❌ Failed to verify evidence integrity:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Blockchain verification failed: ${errorMessage}`)
    }
  }

  /**
   * Transfer evidence custody on blockchain
   */
  async transferCustody(transfer: CustodyTransferRecord): Promise<string> {
    await this.ensureConnection()

    try {
      console.log('🔄 Recording custody transfer on blockchain:', transfer)

      // In development mode, simulate custody transfer
      if (process.env.NODE_ENV !== 'production') {
        const txId = `custody_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('✅ Custody transfer recorded (Simulated):', txId)
        return txId
      }

      // Production custody transfer
      const result = await this.contract!.submitTransaction(
        'TransferCustody',
        transfer.evidenceId,
        transfer.toOfficer,
        transfer.reason
      )

      const txId = result.toString()
      console.log('✅ Custody transfer recorded:', txId)
      return txId

    } catch (error) {
      console.error('❌ Failed to record custody transfer:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Custody transfer failed: ${errorMessage}`)
    }
  }

  /**
   * Get evidence from blockchain
   */
  async getEvidence(evidenceId: string): Promise<any> {
    await this.ensureConnection()

    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV !== 'production') {
        return {
          id: evidenceId,
          caseId: 'mock_case',
          filename: 'mock_evidence.pdf',
          ipfsCid: 'QmMockCID123',
          fileHash: 'mock_hash',
          custodyOfficer: 'mock@officer.com',
          timestamp: new Date(),
          status: 'ACTIVE',
          accessLevel: 'RESTRICTED'
        }
      }

      const result = await this.contract!.evaluateTransaction('ReadEvidence', evidenceId)
      return JSON.parse(result.toString())

    } catch (error) {
      console.error('❌ Failed to get evidence from blockchain:', error)
      throw error
    }
  }

  /**
   * Get custody chain for evidence
   */
  async getCustodyChain(evidenceId: string): Promise<any[]> {
    await this.ensureConnection()

    try {
      // In development mode, return mock custody chain
      if (process.env.NODE_ENV !== 'production') {
        return [
          {
            evidenceId,
            fromOfficer: 'initial@officer.com',
            toOfficer: 'current@officer.com',
            timestamp: new Date(),
            reason: 'Initial upload',
            transactionId: `mock_tx_${evidenceId}`
          }
        ]
      }

      const result = await this.contract!.evaluateTransaction('GetCustodyChain', evidenceId)
      return JSON.parse(result.toString())

    } catch (error) {
      console.error('❌ Failed to get custody chain:', error)
      throw error
    }
  }

  /**
   * Get evidence history from blockchain
   */
  async getEvidenceHistory(evidenceId: string): Promise<any[]> {
    await this.ensureConnection()

    try {
      // In development mode, return mock history
      if (process.env.NODE_ENV !== 'production') {
        return [
          {
            key: `mock_tx_${evidenceId}`,
            record: {
              id: evidenceId,
              status: 'ACTIVE',
              timestamp: new Date()
            }
          }
        ]
      }

      const result = await this.contract!.evaluateTransaction('GetEvidenceHistory', evidenceId)
      return JSON.parse(result.toString())

    } catch (error) {
      console.error('❌ Failed to get evidence history:', error)
      throw error
    }
  }
}

// Export singleton instance
export const fabricClient = new FabricClient()

// Export types and interfaces
export {
  FabricClient
}
