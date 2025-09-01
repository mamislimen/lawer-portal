'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugSession() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<any>(null);

  useEffect(() => {
    const getToken = async () => {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setToken(data);
    };
    getToken();
  }, []);

  if (status === 'loading') {
    return <div>Loading session data...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">useSession()</h2>
        <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">/api/auth/session</h2>
        <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-auto">
          {JSON.stringify(token, null, 2)}
        </pre>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Check if the user role is correctly set in the session data above</li>
          <li>Verify the user has the correct role in the database</li>
          <li>Check the browser's network tab for any failed API requests</li>
          <li>Look for errors in the browser console</li>
          <li>Check the server logs for any authentication errors</li>
        </ol>
      </div>
    </div>
  );
}
