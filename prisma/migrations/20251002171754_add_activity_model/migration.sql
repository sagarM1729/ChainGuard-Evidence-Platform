-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('CASE_CREATED', 'CASE_UPDATED', 'CASE_STATUS_CHANGED', 'CASE_CLOSED', 'EVIDENCE_UPLOADED', 'EVIDENCE_UPDATED', 'EVIDENCE_VERIFIED', 'EVIDENCE_ACCESSED', 'USER_LOGIN', 'USER_LOGOUT', 'SYSTEM_BACKUP', 'CHAIN_CUSTODY_VERIFIED');

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "caseId" TEXT,
    "evidenceId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "public"."Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_caseId_idx" ON "public"."Activity"("caseId");

-- CreateIndex
CREATE INDEX "Activity_evidenceId_idx" ON "public"."Activity"("evidenceId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "public"."Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
