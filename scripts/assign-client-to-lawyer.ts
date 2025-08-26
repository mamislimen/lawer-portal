import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignClientToLawyer() {
  try {
    // 1. Find the lawyer
    const lawyer = await prisma.user.findFirst({
      where: {
        email: 'lawyer@example.com',
        role: 'LAWYER'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!lawyer) {
      console.error('Lawyer not found');
      return;
    }

    // 2. Find the client
    const client = await prisma.user.findFirst({
      where: {
        email: 'sami@gmail.com',
        role: 'CLIENT'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!client) {
      console.error('Client not found');
      return;
    }

    console.log(`Assigning client ${client.email} to lawyer ${lawyer.email}`);

    // 3. Check if client profile exists, if not create one
    const clientProfile = await prisma.clientProfile.upsert({
      where: {
        userId: client.id
      },
      update: {
        assignedLawyerId: lawyer.id
      },
      create: {
        userId: client.id,
        assignedLawyerId: lawyer.id,
        phone: '',
        address: '',
        company: ''
      }
    });

    console.log('Successfully assigned client to lawyer');
    console.log('Client Profile:', clientProfile);

  } catch (error) {
    console.error('Error assigning client to lawyer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignClientToLawyer();
