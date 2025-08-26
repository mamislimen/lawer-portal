/*
  Warnings:

  - The `status` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `Appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."Appointment_caseId_idx";

-- DropIndex
DROP INDEX "public"."Appointment_clientId_idx";

-- DropIndex
DROP INDEX "public"."Appointment_lawyerId_idx";

-- DropIndex
DROP INDEX "public"."Appointment_startTime_idx";

-- DropIndex
DROP INDEX "public"."Appointment_status_idx";

-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
