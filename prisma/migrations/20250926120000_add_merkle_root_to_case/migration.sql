-- Add Merkle root column to cases for ledger snapshots
ALTER TABLE "Case"
ADD COLUMN "merkleRoot" TEXT;
