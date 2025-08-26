import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function createLawyerProfile() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('No authenticated user found');
      process.exit(1);
    }

    console.log('Current user:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Check if user already has a lawyer profile
    const existingProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      console.log('Lawyer profile already exists:', existingProfile);
      return;
    }

  }
}

