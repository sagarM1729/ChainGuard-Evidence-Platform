import { buildMerkleLayers, createLeafHash, generateMerkleProof, getMerkleRoot, verifyMerkleProof, EMPTY_MERKLE_ROOT } from './merkle'

describe('Merkle utilities', () => {
  const basePayload = {
    caseId: 'case-123',
    evidenceId: 'evidence-abc',
    ipfsCid: 'bafy123',
    fileHash: 'deadbeef',
    timestamp: '2024-09-24T12:00:00.000Z'
  }

  it('returns zero root when no leaves', () => {
    expect(getMerkleRoot([])).toBe(EMPTY_MERKLE_ROOT)
  })

  it('creates deterministic leaf hashes', () => {
    const leaf = createLeafHash(basePayload)
    const second = createLeafHash(basePayload)
    expect(leaf).toEqual(second)
    expect(leaf).toMatch(/^[0-9a-f]{64}$/)
  })

  it('builds consistent layers and proofs', () => {
    const leaves = [
      createLeafHash(basePayload),
      createLeafHash({ ...basePayload, evidenceId: 'evidence-b' }),
      createLeafHash({ ...basePayload, evidenceId: 'evidence-c' })
    ]

    const layers = buildMerkleLayers(leaves)
    expect(layers.length).toBeGreaterThan(0)
    expect(layers[0]).toHaveLength(leaves.length)

    const root = getMerkleRoot(leaves)
    const proof = generateMerkleProof(leaves, 1)

    expect(proof.root).toEqual(root)
    expect(verifyMerkleProof(proof.leaf, proof, root)).toBe(true)
  })

  it('throws when proof index is out of range', () => {
    const leaves = [createLeafHash(basePayload)]
    expect(() => generateMerkleProof(leaves, 2)).toThrow()
  })
})
