import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { clientId: session.user.id },
          { lawyerId: session.user.id },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Format the response to match the frontend's expected format
    const formattedAppointments = appointments.map((appointment) => {
      const durationMinutes = Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
      
      return {
        id: appointment.id,
        title: appointment.title,
        lawyer: appointment.lawyer?.name || 'Unknown',
        date: appointment.startTime.toISOString().split('T')[0],
        time: appointment.startTime.toTimeString().slice(0, 5),
        duration: `${durationMinutes} min`,
        type: appointment.type || 'In-Person',
        status: appointment.status || 'Scheduled',
        location: appointment.location || 'Not specified',
        description: appointment.notes || 'No additional notes',
      };
    });

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
