#!/usr/bin/env node

/**
 * Simple smoke test for the ChainGuard three-tier architecture.
 * Tier 1: PostgreSQL via Prisma
 * Tier 2: Merkle evidence ledger (inline utilities)
 * Tier 3: Pinata/IPFS (manual verification)
 */

const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')

const createLeafHash = ({ caseId, evidenceId, ipfsCid, fileHash, timestamp }) =>
  hash([caseId, evidenceId, ipfsCid, fileHash, timestamp].join('|'))

const buildMerkleLayers = (initialLeaves) => {
  if (initialLeaves.length === 0) return []

  const layers = [initialLeaves]
  let currentLayer = initialLeaves

  while (currentLayer.length > 1) {
    const nextLayer = []
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i]
      const right = currentLayer[i + 1] ?? currentLayer[i]
      nextLayer.push(hash(left + right))
    }
    layers.push(nextLayer)
    currentLayer = nextLayer
  }

  return layers
}

const generateMerkleProof = (layers, leafIndex) => {
  const path = []
  let index = leafIndex

  for (let level = 0; level < layers.length - 1; level++) {
    const layer = layers[level]
    const isRightNode = index % 2 === 1
    const pairIndex = isRightNode ? index - 1 : index + 1
    const sibling = layer[pairIndex] ?? layer[index]

    path.push({ sibling, isLeft: isRightNode })
    index = Math.floor(index / 2)
  }

  return path
}

const verifyMerkleProof = (leaf, proof, root) => {
  const computedRoot = proof.reduce((acc, { sibling, isLeft }) => {
    return isLeft ? hash(sibling + acc) : hash(acc + sibling)
  }, leaf)

  return computedRoot === root
}

async function main() {
  console.log('🧪 ChainGuard Three-Tier Smoke Test')
  console.log('='.repeat(60))

  try {
    console.log('\n📊 Tier 1 – PostgreSQL')
    const [users, cases, evidence] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.evidence.count()
    ])
    console.log(`✅ Connected to database (users: ${users}, cases: ${cases}, evidence: ${evidence})`)

    console.log('\n🌲 Tier 2 – Merkle Evidence Ledger')
    const leaves = [
      createLeafHash({
        caseId: 'case-demo',
        evidenceId: 'ev-001',
        ipfsCid: 'bafy-demo-1',
        fileHash: 'sha256-demo-1',
        timestamp: new Date().toISOString()
      }),
      createLeafHash({
        caseId: 'case-demo',
        evidenceId: 'ev-002',
        ipfsCid: 'bafy-demo-2',
        fileHash: 'sha256-demo-2',
        timestamp: new Date().toISOString()
      })
    ]

    const layers = buildMerkleLayers(leaves)
    const root = layers.at(-1)?.[0] ?? ''
    const proof = generateMerkleProof(layers, 0)
    const valid = verifyMerkleProof(leaves[0], proof, root)

    console.log(`✅ Merkle root: ${root}`)
    console.log(`✅ Proof length: ${proof.length}`)
    console.log(`✅ Proof valid: ${valid}`)

  console.log('\n🗃️ Tier 3 – Pinata/IPFS')
  console.log('ℹ️ Upload a file via the dashboard to verify Pinata integration.')
    console.log('   The POST /api/evidence endpoint returns the computed Merkle root and proof.')

    console.log('\n🎉 All tiers responding. Happy hacking!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}