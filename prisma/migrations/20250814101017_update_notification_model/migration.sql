-- Drop default before changing type
ALTER TABLE "public"."Notification" ALTER COLUMN "type" DROP DEFAULT;

--  Create a temp enum that includes old + new values
CREATE TYPE "public"."NotificationType_temp" AS ENUM (
  'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MESSAGE', 'VIDEO_CALL', 'DOCUMENT',
  'APPOINTMENT_CREATED', 'APPOINTMENT_UPDATED', 'APPOINTMENT_CANCELLED',
  'DOCUMENT_UPLOADED', 'PAYMENT_RECEIVED', 'GENERAL'
);

--  Switch the column to use the temp enum
ALTER TABLE "public"."Notification"
  ALTER COLUMN "type" TYPE "public"."NotificationType_temp"
  USING "type"::text::"public"."NotificationType_temp";

--  Add new isRead column and copy values from read
ALTER TABLE "public"."Notification" ADD COLUMN "isRead" BOOLEAN DEFAULT false;
UPDATE "public"."Notification" SET "isRead" = ("read" = true);

--  Update all old values to GENERAL
UPDATE "public"."Notification"
SET "type" = 'GENERAL'
WHERE "type" IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MESSAGE', 'VIDEO_CALL', 'DOCUMENT');

--  Create the final new enum without old values
CREATE TYPE "public"."NotificationType_new" AS ENUM (
  'APPOINTMENT_CREATED', 'APPOINTMENT_UPDATED', 'APPOINTMENT_CANCELLED',
  'DOCUMENT_UPLOADED', 'PAYMENT_RECEIVED', 'GENERAL'
);

--  Switch column to final enum
ALTER TABLE "public"."Notification"
  ALTER COLUMN "type" TYPE "public"."NotificationType_new"
  USING "type"::text::"public"."NotificationType_new";

--  Drop old enums
DROP TYPE "public"."NotificationType";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_temp";

--  Drop old read column and index
DROP INDEX IF EXISTS "public"."Notification_read_idx";
ALTER TABLE "public"."Notification" DROP COLUMN "read";

-- Add missing columns from the new schema if not present
ALTER TABLE "public"."Notification"
  ADD COLUMN IF NOT EXISTS "referenceId" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

--  Create the new index for (userId, isRead)
DROP INDEX IF EXISTS "public"."Notification_userId_read_idx";
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

--  Recreate the foreign key
ALTER TABLE "public"."Notification"
  DROP CONSTRAINT IF EXISTS "Notification_userId_fkey",
  ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

--  Re-add default for type
ALTER TABLE "public"."Notification" ALTER COLUMN "type" SET DEFAULT 'GENERAL';
