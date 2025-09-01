-- Add new columns to User table
ALTER TABLE "User" 
ADD COLUMN "phone" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "occupation" TEXT,
ADD COLUMN "notificationPrefsId" TEXT UNIQUE;

-- Add new columns to ClientProfile table
ALTER TABLE "ClientProfile"
ADD COLUMN "emergencyContactName" TEXT,
ADD COLUMN "emergencyContactPhone" TEXT,
ADD COLUMN "emergencyContactRelation" TEXT;

-- Create NotificationPreferences table
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "caseUpdates" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "reminderTime" TEXT NOT NULL DEFAULT '24h',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint for notification preferences
ALTER TABLE "User" ADD CONSTRAINT "User_notificationPrefsId_fkey" 
FOREIGN KEY ("notificationPrefsId") 
REFERENCES "NotificationPreferences"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;
