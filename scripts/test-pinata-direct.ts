import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function testPinataDirectly() {
  console.log('🔍 Testing Pinata API directly...')
  
  const jwt = process.env.PINATA_JWT
  const apiKey = process.env.PINATA_API_KEY
  const apiSecret = process.env.PINATA_API_SECRET

  if (jwt) {
    console.log('Testing with JWT authentication...')
    try {
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      console.log('JWT Test Result:', response.status, result)
    } catch (error) {
      console.error('JWT Test Error:', error)
    }
  }

  if (apiKey && apiSecret) {
    console.log('Testing with API Key/Secret authentication...')
    try {
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      console.log('API Key Test Result:', response.status, result)
    } catch (error) {
      console.error('API Key Test Error:', error)
    }
  }

  // Test upload endpoint directly
  if (jwt) {
    console.log('Testing file upload with JWT...')
    const formData = new FormData()
    const blob = new Blob(['Test file content for Pinata'], { type: 'text/plain' })
    formData.append('file', blob, 'test.txt')

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`
        },
        body: formData
      })

      const result = await response.json()
      console.log('Upload Test Result:', response.status, result)
    } catch (error) {
      console.error('Upload Test Error:', error)
    }
  }
}

testPinataDirectly().catch(console.error)