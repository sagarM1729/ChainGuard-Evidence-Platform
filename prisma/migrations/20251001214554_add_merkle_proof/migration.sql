/*
  Warnings:

  - The `status` column on the `Case` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[ipfsCid]` on the table `Evidence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[badge]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileHash` to the `Evidence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipfsCid` to the `Evidence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `retrievalUrl` to the `Evidence` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AccessLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'RESTRICTED', 'CONFIDENTIAL', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED', 'COLD_CASE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EvidenceType" AS ENUM ('DOCUMENT', 'PHOTO', 'VIDEO', 'AUDIO', 'DIGITAL_FILE', 'FORENSIC_IMAGE', 'LOG_FILE', 'DATABASE_DUMP', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'DETECTIVE', 'OFFICER', 'FORENSIC_TECH', 'READONLY');

-- AlterTable
ALTER TABLE "public"."Case" ADD COLUMN     "category" TEXT,
ADD COLUMN     "dateClosed" TIMESTAMP(3),
ADD COLUMN     "dateOpened" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."CaseStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "public"."Evidence" ADD COLUMN     "accessLevel" "public"."AccessLevel" NOT NULL DEFAULT 'RESTRICTED',
ADD COLUMN     "blockchainHash" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "collectedAt" TIMESTAMP(3),
ADD COLUMN     "collectedBy" TEXT,
ADD COLUMN     "custodyChain" JSONB,
ADD COLUMN     "deviceInfo" JSONB,
ADD COLUMN     "encryptionKey" TEXT,
ADD COLUMN     "evidenceType" "public"."EvidenceType" NOT NULL DEFAULT 'DOCUMENT',
ADD COLUMN     "fileHash" TEXT NOT NULL,
ADD COLUMN     "filesize" INTEGER,
ADD COLUMN     "ipfsCid" TEXT NOT NULL,
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "merkleProof" JSONB,
ADD COLUMN     "retrievalUrl" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "blockchainTxId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'OFFICER';

-- AlterTable
ALTER TABLE "public"."password_reset_tokens" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Case_caseNumber_idx" ON "public"."Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_category_idx" ON "public"."Case"("category");

-- CreateIndex
CREATE INDEX "Case_description_idx" ON "public"."Case"("description");

-- CreateIndex
CREATE INDEX "Case_officerId_idx" ON "public"."Case"("officerId");

-- CreateIndex
CREATE INDEX "Case_priority_idx" ON "public"."Case"("priority");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "public"."Case"("status");

-- CreateIndex
CREATE INDEX "Case_title_idx" ON "public"."Case"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_ipfsCid_key" ON "public"."Evidence"("ipfsCid");

-- CreateIndex
CREATE INDEX "Evidence_accessLevel_idx" ON "public"."Evidence"("accessLevel");

-- CreateIndex
CREATE INDEX "Evidence_blockchainTxId_idx" ON "public"."Evidence"("blockchainTxId");

-- CreateIndex
CREATE INDEX "Evidence_caseId_idx" ON "public"."Evidence"("caseId");

-- CreateIndex
CREATE INDEX "Evidence_category_idx" ON "public"."Evidence"("category");

-- CreateIndex
CREATE INDEX "Evidence_evidenceType_idx" ON "public"."Evidence"("evidenceType");

-- CreateIndex
CREATE INDEX "Evidence_fileHash_idx" ON "public"."Evidence"("fileHash");

-- CreateIndex
CREATE INDEX "Evidence_filename_idx" ON "public"."Evidence"("filename");

-- CreateIndex
CREATE INDEX "Evidence_ipfsCid_idx" ON "public"."Evidence"("ipfsCid");

-- CreateIndex
CREATE INDEX "Evidence_notes_idx" ON "public"."Evidence"("notes");

-- CreateIndex
CREATE INDEX "Evidence_tags_idx" ON "public"."Evidence"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "User_badge_key" ON "public"."User"("badge");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "public"."User"("department");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");
