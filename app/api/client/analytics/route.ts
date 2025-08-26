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

    // Get the current date and calculate date ranges
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Get last 6 months

    // Get cases for the client
    const cases = await prisma.case.findMany({
      where: {
        clientId: session.user.id,
      },
      include: {
        messages: true,
        videoCalls: true,
      },
    });

    // Calculate case progress data (last 6 months)
    const caseProgressData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      const month = date.toLocaleString('default', { month: 'short' });
      
      // Calculate progress for this month (mock calculation - replace with your actual logic)
      const progress = Math.min(100, Math.floor(Math.random() * 30) + 70); // 70-100%
      
      return { month, progress };
    });

    // Calculate communication data (last 6 months)
    const communicationData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      const month = date.toLocaleString('default', { month: 'short' });
      
      // Count messages and calls for this month
      const monthStart = new Date(date);
      monthStart.setDate(1);
      const monthEnd = new Date(date);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      
      const messages = cases.reduce((count, c) => {
        return count + c.messages.filter(m => {
          const msgDate = new Date(m.createdAt);
          return msgDate >= monthStart && msgDate <= monthEnd;
        }).length;
      }, 0);
      
      const calls = cases.reduce((count, c) => {
        return count + c.videoCalls.filter(v => {
          const callDate = new Date(v.scheduledAt);
          return callDate >= monthStart && callDate <= monthEnd;
        }).length;
      }, 0);
      
      return { month, messages, calls };
    });

    // Calculate satisfaction history (last 6 months)
    const satisfactionHistory = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);
      const month = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear().toString().slice(-2);
      
      // Mock satisfaction rating (4.2-5.0)
      const rating = 4.2 + (Math.random() * 0.8);
      
      return { date: month, rating: parseFloat(rating.toFixed(1)) };
    });

    // Calculate overall metrics
    // Calculate total investment based on case status and messages
    // For this example, we'll use a simple calculation based on the number of messages
    // and video calls as a proxy for engagement
    const totalInvestment = cases.reduce((sum, c) => {
      // Base value per case
      let caseValue = 1000; // Base value per case
      
      // Add value based on messages and video calls
      const messageCount = c.messages?.length || 0;
      const videoCallCount = c.videoCalls?.length || 0;
      
      // Add $10 per message and $50 per video call
      caseValue += (messageCount * 10) + (videoCallCount * 50);
      
      return sum + caseValue;
    }, 0);
    
    const totalCases = cases.length;
    const responseTime = 1.8; // Mock value - replace with actual calculation
    
    // Mock service quality metrics (4.5-5.0)
    const serviceQuality = {
      communication: 4.9,
      expertise: 4.8,
      responsiveness: 5.0,
      value: 4.7,
    };

    return NextResponse.json({
      caseProgressData,
      communicationData,
      satisfactionHistory,
      metrics: {
        caseProgress: 85, // Mock value - replace with actual calculation
        satisfaction: 4.9, // Mock value - replace with actual calculation
        responseTime,
        totalInvestment,
        totalCases,
      },
      serviceQuality,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
