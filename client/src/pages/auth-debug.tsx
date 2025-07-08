import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      const result: any = {
        session: {
          exists: !!session,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            emailConfirmedAt: session.user.email_confirmed_at
          } : null
        },
        user: {
          exists: !!user,
          id: user?.id,
          email: user?.email,
          emailConfirmedAt: user?.email_confirmed_at
        },
        errors: {
          sessionError: sessionError?.message,
          userError: userError?.message
        }
      };

      // Test backend verification if we have a token
      if (session?.access_token) {
        try {
          const backendResponse = await fetch('/api/auth/supabase-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session.access_token })
          });
          
          result.backend = {
            status: backendResponse.status,
            response: await backendResponse.json()
          };
        } catch (error: any) {
          result.backend = {
            error: error.message
          };
        }

        // Test debug endpoint
        try {
          const debugResponse = await fetch('/api/auth/debug-status', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json' 
            }
          });
          
          result.debugEndpoint = {
            status: debugResponse.status,
            response: await debugResponse.json()
          };
        } catch (error: any) {
          result.debugEndpoint = {
            error: error.message
          };
        }
      }

      setDebugInfo(result);
    } catch (error: any) {
      setDebugInfo({ error: error.message });
    }
    setLoading(false);
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Refresh error:', error);
      } else {
        console.log('Session refreshed:', data);
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkAuthStatus} disabled={loading}>
              {loading ? 'Checking...' : 'Check Auth Status'}
            </Button>
            <Button onClick={refreshSession} variant="outline">
              Refresh Session
            </Button>
          </div>

          {debugInfo && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}