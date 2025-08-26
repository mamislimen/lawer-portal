import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if this is a view request (not a download)
  const isView = request.nextUrl.searchParams.get('view') === 'true';
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the document from the database
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        case: {
          select: { clientId: true },
        },
      },
    });

    // Check if document exists and user has access to it
    if (!document || 
        (document.uploaderId !== session.user.id && 
         document.case?.clientId !== session.user.id)) {
      return new NextResponse('Document not found or access denied', { status: 404 });
    }

    // Get the file path
    const filePath = join(process.cwd(), 'public', 'uploads', document.filename);
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Get the content type from the mimeType or default to 'application/octet-stream'
    const contentType = document.mimeType || 'application/octet-stream';
    
    // Return the file as a response
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    
    // Only set Content-Disposition to attachment if it's a download
    if (!isView) {
      headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
    }
    
    return new NextResponse(fileBuffer, {
      headers,
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
