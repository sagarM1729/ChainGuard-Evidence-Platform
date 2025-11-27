-- DropForeignKey
ALTER TABLE "public"."Activity" DROP CONSTRAINT "Activity_caseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Activity" DROP CONSTRAINT "Activity_evidenceId_fkey";

-- DropIndex
DROP INDEX "public"."Evidence_ipfsCid_key";
