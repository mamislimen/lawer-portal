import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureDefaultLawyer() {
  try {
    // Check if any lawyer exists
    const existingLawyer = await prisma.user.findFirst({
      where: {
        role: 'LAWYER',
      },
    });

    if (!existingLawyer) {
      console.log('No lawyers found. Creating a default lawyer...');
      
      // Create a default lawyer
      const hashedPassword = await hash('lawyer123', 12);
      
      const defaultLawyer = await prisma.user.create({
        data: {
          name: 'Default Lawyer',
          email: 'lawyer@example.com',
          password: hashedPassword,
          role: 'LAWYER',
          emailVerified: new Date(),
        },
      });
      
      console.log('Default lawyer created:', defaultLawyer);
    } else {
      console.log('Lawyer already exists:', existingLawyer);
    }
  } catch (error) {
    console.error('Error ensuring default lawyer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ensureDefaultLawyer();
