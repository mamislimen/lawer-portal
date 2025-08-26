'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface AnalyticsData {
  caseProgressData: Array<{ month: string; progress: number }>;
  communicationData: Array<{ month: string; messages: number; calls: number }>;
  satisfactionHistory: Array<{ date: string; rating: number }>;
  metrics: {
    caseProgress: number;
    satisfaction: number;
    responseTime: number;
    totalInvestment: number;
    totalCases: number;
  };
  serviceQuality: {
    communication: number;
    expertise: number;
    responsiveness: number;
    value: number;
  };
}

export function useAnalytics() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/client/analytics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  return { data, loading, error };
}
