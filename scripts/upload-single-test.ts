import { config } from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: '.env.local' })

import { getPinataClient } from '../src/lib/pinata-client'

async function uploadTestFile() {
  console.log('📤 Uploading test evidence file to Pinata...')
  
  const pinataClient = getPinataClient()
  
  // Read the test file
  const filePath = './test-evidence.txt'
  const fileBuffer = readFileSync(filePath)
  const filename = 'chainguard-test-evidence.txt'
  
  console.log(`📄 File: ${filename} (${fileBuffer.length} bytes)`)
  
  try {
    // Upload to Pinata
    const result = await pinataClient.uploadFile(fileBuffer, filename)
    
    console.log('✅ Upload successful!')
    console.log('📊 Result:', {
      cid: result.cid,
      size: result.size,
      gateway_url: result.url
    })
    
    console.log(`🌐 Access your file at: ${result.url}`)
    console.log(`🔗 Direct IPFS link: https://gateway.pinata.cloud/ipfs/${result.cid}`)
    
    return result
  } catch (error) {
    console.error('❌ Upload failed:', error)
    throw error
  }
}

uploadTestFile().catch(console.error)