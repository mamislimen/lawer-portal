import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ServiceWithLawyer = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  status: string;
  clientsServed: number;
  createdAt: Date;
  updatedAt: Date;
  lawyer: {
    id: string;
    name: string | null;
    email: string;
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get services for the current user (lawyer)
    const services = await prisma.service.findMany({
      where: {
        lawyerId: session.user.id,
      },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Received service data:', data);

    // Validate required fields
    if (!data.name || !data.price || !data.duration || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price is a valid number
    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a valid number greater than 0' },
        { status: 400 }
      );
    }

    // Get full user details and check role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, name: true }
    });
    
    console.log('Current user details:', currentUser);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }
    
    // Check if user has lawyer role
    if (currentUser.role !== 'LAWYER') {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. Only lawyers can create services.',
          currentRole: currentUser.role
        },
        { status: 403 }
      );
    }

    // Create a new service
    const service = await prisma.service.create({
      data: {
        name: data.name.trim(),
        description: (data.description || '').trim(),
        price: price,
        duration: data.duration.trim(),
        category: data.category.trim(),
        status: (data.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
        lawyerId: currentUser.id,  // Directly assign the lawyer ID
      },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('Created service:', service);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific Prisma errors
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A service with this name already exists' },
          { status: 409 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid lawyer reference' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create service',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse('Service ID is required', { status: 400 });
    }

    const data = await request.json();
    console.log('Updating service:', { id: params.id, data });

    // Validate required fields
    if (!data.name || !data.price || !data.duration || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price is a valid number
    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a valid number greater than 0' },
        { status: 400 }
      );
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: {
        id: params.id,
        lawyerId: session.user.id, // Ensure the service belongs to the current user
      },
      data: {
        name: data.name.trim(),
        description: (data.description || '').trim(),
        price: price,
        duration: data.duration.trim(),
        category: data.category.trim(),
        status: (data.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
      },
    });

    console.log('Updated service:', updatedService);
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse('Service ID is required', { status: 400 });
    }

    // Check if service exists and belongs to the current user

    // Delete the service
    await prisma.service.delete({
      where: {
        id: params.id,
        lawyerId: session.user.id, // Ensure the service belongs to the current user
      },
    });

    console.log('Successfully deleted service:', params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting service:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Service not found or already deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
