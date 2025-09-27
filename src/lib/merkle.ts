import { createHash } from 'crypto'

// Evidence metadata that gets hashed into a Merkle leaf
export interface MerkleLeafPayload {
  caseId: string
  evidenceId: string
  ipfsCid: string
  fileHash: string
  timestamp: string
}

// Single node in a Merkle proof path
export interface MerkleProofNode {
  position: 'left' | 'right'
  hash: string
}

// Complete proof for verifying evidence integrity
export interface MerkleProof {
  leaf: string
  siblings: MerkleProofNode[]
  root: string
}

// Empty tree root (64 zeros) for cases with no evidence
export const EMPTY_MERKLE_ROOT = '0'.repeat(64)

// Standard SHA-256 hex hash
export function sha256Hex(data: string | Buffer): string {
  const hash = createHash('sha256')
  hash.update(data)
  return hash.digest('hex')
}

// Creates deterministic hash from evidence metadata for Merkle leaf
export function createLeafHash(payload: MerkleLeafPayload): string {
  const serialized = JSON.stringify([
    payload.caseId,
    payload.evidenceId,
    payload.ipfsCid,
    payload.fileHash,
    payload.timestamp
  ])

  return sha256Hex(Buffer.from(serialized))
}

// Builds complete Merkle tree layers from leaf hashes up to root
// Each layer has half the nodes of the previous layer
export function buildMerkleLayers(leaves: string[]): string[][] {
  if (leaves.length === 0) {
    return []
  }

  const layers: string[][] = []
  layers.push(leaves.map(normalizeHash))

  // Build tree bottom-up until we reach single root
  while (layers[layers.length - 1].length > 1) {
    const current = layers[layers.length - 1]
    const next: string[] = []

    for (let i = 0; i < current.length; i += 2) {
      const left = current[i]
      const right = current[i + 1] ?? current[i]  // Duplicate last node if odd count
      next.push(hashPair(left, right))
    }

    layers.push(next)
  }

  return layers
}

export function getMerkleRoot(leaves: string[]): string {
  const layers = buildMerkleLayers(leaves)
  if (layers.length === 0) {
    return EMPTY_MERKLE_ROOT
  }

  return layers[layers.length - 1][0]
}

// Generates cryptographic proof that a specific evidence exists in the tree
// Returns path of sibling hashes needed to reconstruct root
export function generateMerkleProof(leaves: string[], targetIndex: number): MerkleProof {
  if (leaves.length === 0) {
    throw new Error('Cannot generate a merkle proof from an empty tree')
  }

  if (targetIndex < 0 || targetIndex >= leaves.length) {
    throw new Error(`Target index ${targetIndex} is out of bounds for merkle tree with ${leaves.length} leaves`)
  }

  const layers = buildMerkleLayers(leaves)
  const siblings: MerkleProofNode[] = []
  let index = targetIndex

  // Traverse up tree levels, collecting sibling hashes
  for (let level = 0; level < layers.length - 1; level++) {
    const currentLayer = layers[level]
    const isRightNode = index % 2 === 1
    const siblingIndex = isRightNode ? index - 1 : index + 1
    const siblingHash = currentLayer[siblingIndex] ?? currentLayer[index]

    siblings.push({
      position: isRightNode ? 'left' : 'right',
      hash: siblingHash
    })

    index = Math.floor(index / 2)  // Move to parent node
  }

  return {
    leaf: leaves[targetIndex],
    siblings,
    root: layers[layers.length - 1][0]
  }
}

// Verifies evidence integrity by reconstructing root from proof
// Returns true if computed root matches expected root
export function verifyMerkleProof(leaf: string, proof: MerkleProof, expectedRoot: string): boolean {
  let computedHash = normalizeHash(leaf)

  // Apply sibling hashes in sequence to reconstruct root
  for (const { position, hash } of proof.siblings) {
    if (position === 'left') {
      computedHash = hashPair(hash, computedHash)
    } else {
      computedHash = hashPair(computedHash, hash)
    }
  }

  return computedHash === normalizeHash(expectedRoot) && computedHash === normalizeHash(proof.root)
}

// Combines two hashes into parent node hash (left + right)
function hashPair(left: string, right: string): string {
  return sha256Hex(Buffer.from(normalizeHash(left) + normalizeHash(right), 'hex'))
}

// Ensures consistent lowercase hex format
function normalizeHash(hash: string): string {
  return hash.toLowerCase()
}
