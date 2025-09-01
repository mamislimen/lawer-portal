import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'lawyer@example.com';
  
  try {
    console.log('Checking lawyer role...');
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { lawyerProfile: true }
    });

    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Current user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasLawyerProfile: !!user.lawyerProfile
    });

    // Update role to LAWYER if it's not already
    if (user.role !== 'LAWYER') {
      console.log('Updating role to LAWYER...');
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'LAWYER' }
      });
      console.log('Role updated to LAWYER');
    }

    // Create lawyer profile if it doesn't exist
    if (!user.lawyerProfile) {
      console.log('Creating lawyer profile...');
      await prisma.lawyerProfile.create({
        data: {
          userId: user.id,
          specialization: ['Corporate Law', 'Contract Law'],
          experience: 10,
          barNumber: `BAR-${Date.now()}`,
          hourlyRate: 350.0,
          bio: 'Experienced corporate lawyer with 10+ years in contract negotiations and business law.'
        },
      });
      console.log('Lawyer profile created');
    }

    console.log('Verification complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
