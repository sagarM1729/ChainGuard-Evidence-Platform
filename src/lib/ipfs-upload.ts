// 🌐 Alternative IPFS upload service using Pinata or direct IPFS
import { storachaClient } from './web3storage'

export interface IPFSUploadResult {
  cid: string
  url: string
  size: number
  provider: 'storacha' | 'pinata' | 'local'
}

/**
 * Multi-provider IPFS upload service with automatic fallback
 */
export class IPFSUploadService {
  
  /**
   * Upload file to IPFS with automatic provider fallback
   */
  async uploadFile(file: File | Buffer, filename?: string): Promise<IPFSUploadResult> {
    console.log('🚀 Starting IPFS upload with multi-provider fallback...')
    
    // Try Storacha first
    try {
      console.log('📡 Attempting upload via Storacha...')
      const result = await storachaClient.uploadFile(file, filename)
      
      // Check if it's a real upload or fallback
      if (!result.cid.startsWith('local_')) {
        console.log('✅ Storacha upload successful:', result.cid)
        return {
          ...result,
          provider: 'storacha'
        }
      } else {
        throw new Error('Storacha returned local fallback, trying alternatives')
      }
    } catch (error) {
      console.warn('❌ Storacha upload failed:', error)
    }
    
    // Try Pinata as backup
    try {
      console.log('📡 Attempting upload via Pinata...')
      const result = await this.uploadToPinata(file, filename)
      console.log('✅ Pinata upload successful:', result.cid)
      return {
        ...result,
        provider: 'pinata'
      }
    } catch (error) {
      console.warn('❌ Pinata upload failed:', error)
    }
    
    // If all else fails, create a meaningful local reference
    console.warn('🔄 All IPFS providers failed, using enhanced local storage...')
    return this.createLocalFallback(file, filename)
  }
  
  /**
   * Upload to Pinata IPFS service
   */
  private async uploadToPinata(file: File | Buffer, filename?: string): Promise<IPFSUploadResult> {
    const pinataApiKey = process.env.PINATA_API_KEY
    const pinataSecretKey = process.env.PINATA_SECRET_API_KEY
    
    if (!pinataApiKey || !pinataSecretKey) {
      throw new Error('Pinata API keys not configured')
    }
    
    const formData = new FormData()
    
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to Uint8Array for proper Blob creation
      const uint8Array = new Uint8Array(file)
      const blob = new Blob([uint8Array])
      formData.append('file', blob, filename || 'evidence-file')
    } else {
      formData.append('file', file)
    }
    
    const metadata = JSON.stringify({
      name: filename || 'Evidence File',
      keyvalues: {
        application: 'ChainGuard Evidence Platform',
        timestamp: new Date().toISOString()
      }
    })
    formData.append('pinataMetadata', metadata)
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Pinata upload failed: ${error}`)
    }
    
    const data = await response.json()
    return {
      cid: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      size: data.PinSize || (file instanceof File ? file.size : file.length),
      provider: 'pinata'
    }
  }
  
  /**
   * Create enhanced local fallback with file storage simulation
   */
  private createLocalFallback(file: File | Buffer, filename?: string): IPFSUploadResult {
    // Create a more meaningful local reference
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileSize = file instanceof File ? file.size : Buffer.isBuffer(file) ? file.length : 0
    const fileName = filename || (file instanceof File ? file.name : 'evidence-file')
    
    // Create a hash-like CID for local storage
    const localCid = `local_${timestamp}_${randomId}_${btoa(fileName).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`
    
    console.log('📁 Created local evidence reference:', {
      cid: localCid,
      filename: fileName,
      size: fileSize,
      timestamp: new Date(timestamp).toISOString()
    })
    
    return {
      cid: localCid,
      url: `local://evidence/${localCid}?filename=${encodeURIComponent(fileName)}&size=${fileSize}`,
      size: fileSize,
      provider: 'local'
    }
  }
  
  /**
   * Test all IPFS providers
   */
  async testProviders(): Promise<{ [key: string]: { success: boolean; message: string } }> {
    const results: { [key: string]: { success: boolean; message: string } } = {}
    
    // Test Storacha
    try {
      const storachaResult = await storachaClient.testConnection()
      results.storacha = storachaResult
    } catch (error) {
      results.storacha = {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
    
    // Test Pinata
    try {
      if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
        // Simple test request to Pinata
        const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          results.pinata = {
            success: true,
            message: `Pinata authentication successful: ${data.message}`
          }
        } else {
          results.pinata = {
            success: false,
            message: `Pinata auth failed: ${response.statusText}`
          }
        }
      } else {
        results.pinata = {
          success: false,
          message: 'Pinata API keys not configured'
        }
      }
    } catch (error) {
      results.pinata = {
        success: false,
        message: `Pinata error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
    
    return results
  }
}

export const ipfsUploadService = new IPFSUploadService()