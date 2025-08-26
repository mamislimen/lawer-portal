import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Server } from 'socket.io';
import { getIo } from '@/lib/socket';

// Import the WebSocket server instance directly
import { ioInstance } from '@/lib/socket';

// Helper function to validate date strings
const isValidDate = (date: unknown): boolean => {
  if (typeof date !== 'string') return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};

// Define the request schema
const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string()
    .refine((val) => isValidDate(val), {
      message: 'Start time must be a valid date string',
    })
    .transform((val) => new Date(val).toISOString()),
  endTime: z.string()
    .refine((val) => isValidDate(val), {
      message: 'End time must be a valid date string',
    })
    .transform((val) => new Date(val).toISOString()),
  type: z.enum(['CONSULTATION', 'CASE_REVIEW', 'COURT_APPEARANCE', 'MEETING', 'VIDEO_CALL', 'PHONE_CALL', 'IN_PERSON', 'OTHER']),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
  location: z.string().optional(),
  notes: z.string().optional(),
  lawyerId: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  caseId: z.string().optional().nullable(),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      
      // Check if user is authenticated
      if (!session?.user) {
        return NextResponse.json(
          { error: 'You must be signed in to create an appointment' },
          { status: 401 }
        );
      }
  
      const body = await req.json();
      
      // Log the incoming request body for debugging
      console.log('Incoming request body:', JSON.stringify(body, null, 2));
      
      // Log the session user for debugging
      console.log('Session user:', JSON.stringify(session.user, null, 2));
      
      // Validate request body
      const validation = appointmentSchema.safeParse({
        ...body,
        // Ensure required fields have values
        title: body.title || 'New Appointment',
        description: body.description || '',
        location: body.location || '',
        notes: body.notes || '',
      });
      
      if (!validation.success) {
        console.log('Validation errors:', validation.error.issues);
        return NextResponse.json(
          { 
            error: 'Invalid request data', 
            details: validation.error.issues,
            receivedData: body
          },
          { status: 400 }
        );
      }
  
      let { 
        title, 
        description, 
        startTime, 
        endTime, 
        type, 
        status = 'SCHEDULED',
        location, 
        notes, 
        lawyerId, 
        clientId, 
        caseId 
      } = validation.data;

      // If no lawyerId is provided, find the first available lawyer
      if (!lawyerId) {
        const availableLawyer = await prisma.user.findFirst({
          where: {
            role: 'LAWYER',
          },
          select: {
            id: true,
          },
          orderBy: {
            id: 'asc',
          },
        });

        if (!availableLawyer) {
          return NextResponse.json(
            { error: 'No lawyers available to assign this appointment' },
            { status: 400 }
          );
        }
        
        lawyerId = availableLawyer.id;
      }
  
      // Check if the authenticated user is the client making the request
      if (session.user.id !== clientId) {
        return NextResponse.json(
          { error: 'You can only create appointments for yourself' },
          { status: 403 }
        );
      }
  
      // Check if the lawyer exists
      const lawyer = await prisma.user.findUnique({
        where: { id: lawyerId, role: 'LAWYER' },
      });
  
      if (!lawyer) {
        return NextResponse.json(
          { error: 'Lawyer not found' },
          { status: 404 }
        );
      }
  
      // Check if the client exists
      const client = await prisma.user.findUnique({
        where: { id: clientId, role: 'CLIENT' },
      });
  
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
  
      // Check if case exists if caseId is provided
      if (caseId) {
        const caseExists = await prisma.case.findUnique({
          where: { id: caseId },
        });
  
        if (!caseExists) {
          return NextResponse.json(
            { error: 'Case not found' },
            { status: 404 }
          );
        }
      }
  
      // Create the appointment with transaction
      let appointment;
      try {
        appointment = await prisma.$transaction(async (tx) => {
          const [lawyer, client] = await Promise.all([
            tx.user.findUnique({ where: { id: lawyerId, role: 'LAWYER' } }),
            tx.user.findUnique({ where: { id: clientId, role: 'CLIENT' } }),
          ]);
  
          if (!lawyer || !client) {
            throw new Error(lawyer ? 'Client not found' : 'Lawyer not found');
          }
  
          const newAppointment = await tx.appointment.create({
            data: {
              title,
              description: description || null,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              type,
              status,
              location: location || null,
              notes: notes || null,
              lawyerId,
              clientId,
              caseId: caseId || null,
            },
            include: {
              lawyer: { select: { id: true, name: true, email: true, image: true } },
              client: { select: { id: true, name: true, email: true, image: true } },
              case: true
            }
          });
  
          if (ioInstance) {
            try {
              ioInstance.to(`appointment_${newAppointment.id}`).emit('appointment_updated', {
                action: 'created',
                id: newAppointment.id,
              });
              ioInstance.to(`lawyer_${lawyerId}_appointments`).emit('appointments_updated');
            } catch (wsError) {
              console.error('Failed to emit WebSocket event:', wsError);
            }
          }
  
          return newAppointment;
        });
  
        return NextResponse.json(appointment, { status: 201 });
      } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
          { 
            error: 'Failed to create appointment',
            details: error instanceof Error ? error.message : 'Unknown error',
            code: 'DATABASE_ERROR'
          },
          { status: 500 }
        );
      }
    } catch (outerError) {
      console.error('Unexpected error in POST handler:', outerError);
      return NextResponse.json(
        { error: 'Unexpected server error' },
        { status: 500 }
      );
    }
  }  

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to view appointments' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the where clause based on user role
    const where: any = {};
    
    if (role === 'LAWYER') {
      where.lawyerId = userId;
    } else if (role === 'CLIENT') {
      where.clientId = userId;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by date range if provided
    if (startDate) {
      where.startTime = {
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.endTime = {
        lte: new Date(endDate),
      };
    }

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        case: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching appointments' },
      { status: 500 }
    );
  }
}
