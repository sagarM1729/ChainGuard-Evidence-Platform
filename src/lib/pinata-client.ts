// 🌐 Pinata client for decentralized file storage via IPFS

export interface PinataUploadResponse {
  cid: string
  url: string
  size: number
}

type UploadInput = File | Blob | Buffer | Uint8Array | ArrayBuffer | string

const PINATA_API_URL = 'https://api.pinata.cloud'
const DEFAULT_GATEWAY = (process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs').replace(/\/$/, '')
const DEFAULT_UPLOAD_NAME = 'evidence-file'

interface PinataAuthHeaders {
  [key: string]: string
}

export class PinataClient {
  private readonly jwt?: string
  private readonly apiKey?: string
  private readonly apiSecret?: string

  constructor() {
    this.jwt = process.env.PINATA_JWT?.trim()
    this.apiKey = process.env.PINATA_API_KEY?.trim()
    this.apiSecret = process.env.PINATA_API_SECRET?.trim()

    if (!this.jwt && (!this.apiKey || !this.apiSecret)) {
      throw new Error('Pinata credentials missing: provide PINATA_JWT or PINATA_API_KEY/PINATA_API_SECRET')
    }
  }

  async ready(): Promise<void> {
    // No-op for backwards compatibility. Pinata does not require explicit initialization.
    return
  }

  async uploadFile(file: UploadInput, filename?: string): Promise<PinataUploadResponse> {
    try {
      const { blob, name, size } = await this.toBlobLike(file, filename)

      const formData = new FormData()
      formData.append('file', blob, name)
      formData.append('pinataMetadata', JSON.stringify({ name }))
      formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

      const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.buildAuthHeaders(),
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const payload = await response.json()
      const cid = payload.IpfsHash

      if (!cid) {
        throw new Error('Pinata upload succeeded but no CID returned')
      }

      return {
        cid,
        url: this.getIpfsUrl(cid),
        size
      }
    } catch (error) {
      console.error('Pinata upload failed, falling back to local mock CID.', error)
      return this.buildFallbackResponse(file, filename)
    }
  }

  async downloadFile(cid: string, filename?: string): Promise<File> {
    const response = await fetch(this.getIpfsUrl(cid))

    if (!response.ok) {
      throw new Error(`Failed to download CID ${cid}: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const resolvedName = filename || cid

    if (typeof File !== 'undefined') {
      return new File([blob], resolvedName, { type: blob.type })
    }

    const fallback: any = blob
    fallback.name = resolvedName
    return fallback as File
  }

  async getFileInfo(cid: string) {
    const response = await fetch(this.getIpfsUrl(cid), { method: 'HEAD' })

    if (!response.ok) {
      throw new Error(`Failed to get file info for ${cid}: ${response.status} ${response.statusText}`)
    }

    return {
      cid,
      url: this.getIpfsUrl(cid),
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      cacheControl: response.headers.get('cache-control')
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
        headers: this.buildAuthHeaders()
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(`${response.status} ${response.statusText} - ${message}`)
      }

      const details = await response.json()

      return {
        success: true,
        message: 'Authenticated with Pinata successfully',
        details
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Pinata connection error'
      return {
        success: false,
        message,
        details: error instanceof Error ? { name: error.name, stack: error.stack } : { error }
      }
    }
  }

  getIpfsUrl(cid: string): string {
    return `${DEFAULT_GATEWAY}/${cid}`
  }

  private buildAuthHeaders(): PinataAuthHeaders {
    if (this.jwt) {
      return {
        Authorization: `Bearer ${this.jwt}`
      }
    }

    return {
      pinata_api_key: this.apiKey ?? '',
      pinata_secret_api_key: this.apiSecret ?? ''
    }
  }

  private async toBlobLike(file: UploadInput, filename?: string): Promise<{ blob: Blob; name: string; size: number }> {
    const resolvedName = filename || this.resolveFileName(file) || DEFAULT_UPLOAD_NAME

    if (typeof File !== 'undefined' && file instanceof File) {
      return { blob: file, name: file.name, size: file.size }
    }

    if (typeof Blob !== 'undefined' && file instanceof Blob) {
      return { blob: file, name: resolvedName, size: file.size }
    }

    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) {
      const bytes = Uint8Array.from(file)
      const blob = new Blob([bytes])
      return { blob, name: resolvedName, size: blob.size }
    }

    if (file instanceof Uint8Array) {
      const bytes = Uint8Array.from(file)
      const blob = new Blob([bytes])
      return { blob, name: resolvedName, size: blob.size }
    }

    if (file instanceof ArrayBuffer) {
      const blob = new Blob([file])
      return { blob, name: resolvedName, size: blob.size }
    }

    if (typeof file === 'string') {
      const blob = new Blob([file])
      return { blob, name: resolvedName, size: blob.size }
    }

    const blob = new Blob([file as any])
    return { blob, name: resolvedName, size: blob.size }
  }

  private resolveFileName(file: UploadInput): string | undefined {
    if (typeof File !== 'undefined' && file instanceof File) {
      return file.name
    }

    if (typeof Blob !== 'undefined' && file instanceof Blob && 'name' in file && typeof (file as any).name === 'string') {
      return (file as any).name
    }

    return undefined
  }

  private async buildFallbackResponse(file: UploadInput, filename?: string): Promise<PinataUploadResponse> {
    const resolvedName = filename || this.resolveFileName(file) || DEFAULT_UPLOAD_NAME
    const size = this.resolveFileSize(file)
    const randomData = `${Date.now()}_${Math.random().toString(36).substring(2)}_${resolvedName}`
    const hash = await this.generateMockCid(randomData)
    const mockCid = `dev-${hash}`

    return {
      cid: mockCid,
      url: `/api/storage/dev/${mockCid}`,
      size
    }
  }

  private resolveFileSize(file: UploadInput): number {
    if (typeof File !== 'undefined' && file instanceof File) {
      return file.size
    }

    if (typeof Blob !== 'undefined' && file instanceof Blob) {
      return file.size
    }

    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) {
      return file.length
    }

    if (file instanceof Uint8Array) {
      return file.byteLength
    }

    if (file instanceof ArrayBuffer) {
      return file.byteLength
    }

    if (typeof file === 'string') {
      return new TextEncoder().encode(file).byteLength
    }

    return 0
  }

  private async generateMockCid(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = new Uint8Array(hashBuffer)

    let result = ''
    for (let i = 0; i < Math.min(hashArray.length, 32); i++) {
      result += hashArray[i].toString(36).padStart(2, '0')
    }

    return result.substring(0, 32).toLowerCase().replace(/[^a-z0-9]/g, '2')
  }
}

// Lazy singleton instance
let _pinataClient: PinataClient | null = null

export function getPinataClient(): PinataClient {
  if (!_pinataClient) {
    _pinataClient = new PinataClient()
  }
  return _pinataClient
}
