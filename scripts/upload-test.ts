import { config } from 'dotenv'

// Load environment variables BEFORE importing anything
config({ path: '.env.local' })

import { getPinataClient } from '../src/lib/pinata-client'

async function main() {
  console.log('🧪 Pinata upload smoke test')
  console.log('Environment check:')
  console.log('- PINATA_JWT:', process.env.PINATA_JWT ? `SET (${process.env.PINATA_JWT.length} chars)` : 'NOT SET')
  console.log('- PINATA_API_KEY:', process.env.PINATA_API_KEY ? 'SET' : 'NOT SET')
  console.log('- PINATA_API_SECRET:', process.env.PINATA_API_SECRET ? 'SET' : 'NOT SET')
  console.log('- PINATA_GATEWAY_URL:', process.env.PINATA_GATEWAY_URL || 'DEFAULT (https://gateway.pinata.cloud/ipfs)')

  const pinataClient = getPinataClient()

  try {
    console.log('Testing Pinata client readiness...')
    await pinataClient.ready()
    console.log('✅ Pinata client is ready!')
  } catch (error) {
    console.warn('⚠️ Pinata client not ready, proceeding with best-effort upload:')
    console.warn('Error details:', error instanceof Error ? error.message : String(error))
  }

  const content = `ChainGuard Pinata upload test\nTimestamp: ${new Date().toISOString()}\nRandom: ${Math.random().toString(36).slice(2)}\n`
  const buffer = Buffer.from(content, 'utf8')
  const filename = `pinata-test-${Date.now()}.txt`

  console.log('📄 Preparing to upload:', {
    filename,
    size: buffer.byteLength,
  })

  try {
    const result = await pinataClient.uploadFile(buffer, filename)

    const isFallback = result.cid.startsWith('dev-')
    console.log('✅ Upload completed:', result)
    console.log(isFallback ? '⚠️ Fallback CID detected (development/local storage).' : '🎉 Real Pinata CID issued.')
  } catch (error) {
    console.error('❌ Upload failed:', error)
    process.exitCode = 1
  }
}

main()
