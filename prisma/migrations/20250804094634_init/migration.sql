-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('LAWYER', 'CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'FILE', 'IMAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."VideoCallStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'COURT_FILING', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MESSAGE', 'VIDEO_CALL', 'DOCUMENT');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."LawyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barNumber" TEXT NOT NULL,
    "specialization" TEXT[],
    "experience" INTEGER NOT NULL,
    "hourlyRate" DOUBLE PRECISION,
    "bio" TEXT,

    CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "company" TEXT,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "lawyerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "caseId" TEXT,
    "type" "public"."MessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoCall" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hostId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "caseId" TEXT,
    "status" "public"."VideoCallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "agoraChannelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "caseId" TEXT,
    "type" "public"."DocumentType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON "public"."LawyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_barNumber_key" ON "public"."LawyerProfile"("barNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "public"."ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "Case_lawyerId_idx" ON "public"."Case"("lawyerId");

-- CreateIndex
CREATE INDEX "Case_clientId_idx" ON "public"."Case"("clientId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "public"."Case"("status");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "public"."Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_caseId_idx" ON "public"."Message"("caseId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VideoCall_agoraChannelName_key" ON "public"."VideoCall"("agoraChannelName");

-- CreateIndex
CREATE INDEX "VideoCall_hostId_idx" ON "public"."VideoCall"("hostId");

-- CreateIndex
CREATE INDEX "VideoCall_participantId_idx" ON "public"."VideoCall"("participantId");

-- CreateIndex
CREATE INDEX "VideoCall_caseId_idx" ON "public"."VideoCall"("caseId");

-- CreateIndex
CREATE INDEX "VideoCall_scheduledAt_idx" ON "public"."VideoCall"("scheduledAt");

-- CreateIndex
CREATE INDEX "Document_uploaderId_idx" ON "public"."Document"("uploaderId");

-- CreateIndex
CREATE INDEX "Document_caseId_idx" ON "public"."Document"("caseId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "public"."Document"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "public"."Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LawyerProfile" ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Case" ADD CONSTRAINT "Case_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoCall" ADD CONSTRAINT "VideoCall_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoCall" ADD CONSTRAINT "VideoCall_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoCall" ADD CONSTRAINT "VideoCall_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
