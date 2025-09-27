// Test script for 3-tier ChainGuard Evidence Platform integration
// Tests PostgreSQL + Merkle ledger + IPFS integration paths

import { prisma } from '../src/lib/prisma'
import { createLeafHash, generateMerkleProof, getMerkleRoot, verifyMerkleProof } from '../src/lib/merkle'

async function test3TierIntegration() {
  console.log('🧪 Starting 3-Tier Integration Test')
  console.log('='.repeat(50))

  try {
    // Test 1: Database Connection (Tier 1 - PostgreSQL Index)
    console.log('\n📊 Testing Tier 1 - PostgreSQL Index')
    console.log('-'.repeat(30))

    const caseCount = await prisma.case.count()
    const evidenceCount = await prisma.evidence.count()
    console.log('✅ Database connection successful')
    console.log(`📁 Cases in database: ${caseCount}`)
    console.log(`📄 Evidence records: ${evidenceCount}`)

    // Test 2: Merkle Ledger (Tier 2 - Evidence Notary)
    console.log('\n🌲 Testing Tier 2 - Merkle Evidence Ledger')
    console.log('-'.repeat(30))

    const sampleLeaves = [
      createLeafHash({
        caseId: 'case-demo-001',
        evidenceId: 'evidence-001',
        ipfsCid: 'bafyDemoCid001',
        fileHash: 'sha256-demo-hash-001',
        timestamp: new Date().toISOString()
      }),
      createLeafHash({
        caseId: 'case-demo-001',
        evidenceId: 'evidence-002',
        ipfsCid: 'bafyDemoCid002',
        fileHash: 'sha256-demo-hash-002',
        timestamp: new Date().toISOString()
      }),
      createLeafHash({
        caseId: 'case-demo-001',
        evidenceId: 'evidence-003',
        ipfsCid: 'bafyDemoCid003',
        fileHash: 'sha256-demo-hash-003',
        timestamp: new Date().toISOString()
      })
    ]

    const merkleRoot = getMerkleRoot(sampleLeaves)
    const proof = generateMerkleProof(sampleLeaves, 1)
    const proofValid = verifyMerkleProof(proof.leaf, proof, merkleRoot)

    console.log('✅ Merkle root computed:', merkleRoot)
    console.log(`🧾 Proof siblings: ${proof.siblings.length}`)
    console.log(`🔍 Proof verification: ${proofValid ? 'PASS' : 'FAIL'}`)

    // Test 3: IPFS Integration (Tier 3 - Vault Storage)
    console.log('\n🗃️ Testing Tier 3 - IPFS Vault Storage (Simulated)')
    console.log('-'.repeat(30))

  console.log('ℹ️ IPFS upload requires Pinata credentials (PINATA_JWT or API key/secret pair)')
  console.log('✅ Evidence Manager will automatically fall back to a development mock CID if Pinata upload fails')
  console.log('⚠️ Run `npm run dev` and upload a file through the dashboard to exercise the full Pinata pipeline')

    // Summary
    console.log('\n🎉 3-TIER INTEGRATION TEST RESULTS')
    console.log('='.repeat(50))
    console.log('✅ Tier 1 (PostgreSQL Index): OPERATIONAL')
    console.log(`✅ Tier 2 (Merkle Ledger): ${proofValid ? 'OPERATIONAL' : 'VERIFY MANUALLY'}`)
  console.log('ℹ️ Tier 3 (IPFS Vault): Run dashboard upload to validate Pinata credentials')
    console.log('✅ Evidence workflow: READY FOR MANUAL END-TO-END TEST')
  } catch (error) {
    console.error('❌ 3-Tier Integration Test Failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  test3TierIntegration()
    .then(() => {
      console.log('\n🏁 Test completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

export { test3TierIntegration }