const { PrismaClient } = require('@prisma/client');

async function checkLawyerUser() {
  console.log('Connecting to database...');
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    console.log('Checking lawyer@example.com...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'lawyer@example.com' },
      include: { lawyerProfile: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      hasLawyerProfile: !!user.lawyerProfile,
      createdAt: user.createdAt
    });

    // Update role to LAWYER if needed
    if (user.role !== 'LAWYER') {
      console.log('🔄 Updating role to LAWYER...');
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'LAWYER' }
      });
      console.log('✅ Role updated to LAWYER');
    }

    // Create lawyer profile if it doesn't exist
    if (!user.lawyerProfile) {
      console.log('🔄 Creating lawyer profile...');
      await prisma.lawyerProfile.create({
        data: {
          userId: user.id,
          specialization: ['Corporate Law', 'Contract Law'],
          experience: 10,
          barNumber: `BAR-${Date.now()}`,
          hourlyRate: 350.0,
          bio: 'Experienced corporate lawyer with 10+ years in contract negotiations and business law.'
        }
      });
      console.log('✅ Lawyer profile created');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed');
  }
}

checkLawyerUser();
