import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'user@example.com'; // Replace with the actual user's email
  
  try {
    console.log('Checking user role...');
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { lawyerProfile: true }
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Current user role:', user.role);
    console.log('Has lawyer profile:', !!user.lawyerProfile);

    // If user is not a lawyer, update the role
    if (user.role !== 'LAWYER') {
      console.log('Updating user role to LAWYER...');
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'LAWYER' }
      });
      console.log('User role updated to LAWYER');
    }

    // Create lawyer profile if it doesn't exist
    if (!user.lawyerProfile) {
      console.log('Creating lawyer profile...');
      await prisma.lawyerProfile.create({
        data: {
          userId: user.id,
          specialization: ['General Practice'],
          experience: 1,
          barNumber: `BAR-${Date.now()}`,
        },
      });
      console.log('Lawyer profile created');
    }

    console.log('User verification complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
