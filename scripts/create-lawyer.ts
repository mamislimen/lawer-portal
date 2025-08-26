import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createLawyer() {
  const hashedPassword = await hash('lawyer123', 12);
  
  const lawyer = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'lawyer@example.com',
      password: hashedPassword,
      role: 'LAWYER',
      emailVerified: new Date(),
      lawyerProfile: {
        create: {
          barNumber: 'BAR123456',
          specialization: ['Corporate Law'],
          bio: 'Experienced corporate lawyer with 10+ years of experience',
          experience: 10,
          hourlyRate: 200,
        },
      },
    },
  });

  console.log('Created lawyer:', lawyer);
}

createLawyer()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
