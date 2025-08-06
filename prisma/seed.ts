import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Hash passwords
  const hashedPassword = await bcrypt.hash("password123", 12)

  // Create lawyer user
  const lawyer = await prisma.user.upsert({
    where: { email: "lawyer@example.com" },
    update: {},
    create: {
      email: "lawyer@example.com",
      name: "John Smith",
      password: hashedPassword,
      role: "LAWYER",
      lawyerProfile: {
        create: {
          barNumber: "BAR123456",
          specialization: ["Corporate Law", "Contract Law"],
          experience: 10,
          hourlyRate: 350.0,
          bio: "Experienced corporate lawyer with 10+ years in contract negotiations and business law.",
        },
      },
    },
  })

  // Create client user
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "Jane Doe",
      password: hashedPassword,
      role: "CLIENT",
      clientProfile: {
        create: {
          phone: "+1-555-0123",
          address: "123 Main St, New York, NY 10001",
          company: "Tech Startup Inc.",
        },
      },
    },
  })

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      title: "Contract Review - Software License Agreement",
      description: "Review and negotiate terms for enterprise software licensing agreement with vendor.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      lawyerId: lawyer.id,
      clientId: client.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  })

  const case2 = await prisma.case.create({
    data: {
      title: "Employment Agreement Draft",
      description: "Draft employment agreements for new executive hires including non-compete clauses.",
      status: "OPEN",
      priority: "MEDIUM",
      lawyerId: lawyer.id,
      clientId: client.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  })

  // Create a conversation for the client and lawyer
  const conversation = await prisma.conversation.create({
    data: {
      user1Id: lawyer.id,
      user2Id: client.id,
    },
  })

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        content: "Hi Jane, I've reviewed the initial contract draft. We need to discuss a few key terms.",
        senderId: lawyer.id,
        receiverId: client.id,
        caseId: case1.id,
        conversationId: conversation.id, // Use the conversation ID here
        type: "TEXT",
      },
      {
        content: "Thank you John. I'm available for a call this afternoon to go over the details.",
        senderId: client.id,
        receiverId: lawyer.id,
        caseId: case1.id,
        conversationId: conversation.id, // Use the conversation ID here
        type: "TEXT",
      },
      {
        content: "Perfect. I'll send you a calendar invite for 3 PM EST.",
        senderId: lawyer.id,
        receiverId: client.id,
        caseId: case1.id,
        conversationId: conversation.id, // Use the conversation ID here
        type: "TEXT",
      },
    ],
  })

  // Create sample video call
  await prisma.videoCall.create({
    data: {
      title: "Contract Review Discussion",
      description: "Discuss key terms and negotiate contract clauses",
      hostId: lawyer.id,
      participantId: client.id,
      caseId: case1.id,
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      agoraChannelName: `case_${case1.id}_${Date.now()}`,
    },
  })

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: client.id,
        title: "New Message",
        message: "You have a new message from John Smith regarding Contract Review",
        type: "MESSAGE",
      },
      {
        userId: client.id,
        title: "Video Call Scheduled",
        message: "A video call has been scheduled for today at 3:00 PM",
        type: "VIDEO_CALL",
      },
      {
        userId: lawyer.id,
        title: "Case Update",
        message: 'Case "Contract Review" status updated to In Progress',
        type: "INFO",
      },
    ],
  })

  console.log("✅ Database seeded successfully!")
  console.log("\n👥 Test Accounts Created:")
  console.log("📧 Lawyer: lawyer@example.com | Password: password123")
  console.log("📧 Client: client@example.com | Password: password123")
  console.log("📧 Admin: admin@example.com | Password: password123")
  console.log("\n🎯 You can now login and test all features!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
