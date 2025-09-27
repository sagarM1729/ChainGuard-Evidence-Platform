#!/usr/bin/env node

import { config } from 'dotenv'
import fetch from 'node-fetch'
import FormData from 'form-data'

config({ path: '.env.local' })

const PINATA_JWT = process.env.PINATA_JWT
const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET

if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
  console.error('❌ Missing Pinata credentials. Set PINATA_JWT or PINATA_API_KEY/PINATA_API_SECRET in .env.local')
  process.exit(1)
}

const AUTH_HEADERS = PINATA_JWT
  ? { Authorization: `Bearer ${PINATA_JWT}` }
  : { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_API_SECRET }

async function pingPinata() {
  const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
    headers: AUTH_HEADERS
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Pinata auth failed: ${response.status} ${JSON.stringify(error)}`)
  }

  return response.json()
}

async function uploadProbe() {
  const formData = new FormData()
  const payload = `PINATA PROBE\nTimestamp: ${new Date().toISOString()}\nToken: ${Math.random().toString(36).slice(2)}`
  formData.append('file', payload, { filename: `pinata-probe-${Date.now()}.txt`, contentType: 'text/plain' })

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: formData
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.status} ${JSON.stringify(json)}`)
  }

  return json
}

async function main() {
  console.log('🔍 Monitoring Pinata availability')

  try {
    const auth = await pingPinata()
    console.log('✅ Pinata authentication OK:', auth)
  } catch (error) {
    console.error('❌ Pinata authentication failed:', error)
    process.exit(1)
  }

  try {
    const result = await uploadProbe()
    console.log('🎉 Pinata upload succeeded:', result)
    console.log('🌐 Gateway URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`)
  } catch (error) {
    console.error('⚠️ Pinata upload probe failed:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Monitor crashed:', error)
  process.exit(1)
})