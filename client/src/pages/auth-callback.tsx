import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setStatus('error');
            setMessage('Failed to verify your email. Please try signing up again.');
            return;
          }

          if (data.user) {
            setStatus('success');
            setMessage('Email verified successfully! Your account is now active.');
            
            toast({
              title: "Email Verified!",
              description: "Welcome to FitlyAI! Your account is now active.",
            });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              setLocation('/');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid verification link. Please try signing up again.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Something went wrong during verification. Please try again.');
      }
    };

    handleAuthCallback();
  }, [setLocation, toast]);

  const handleReturnHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {status === 'loading' && (
              <div className="bg-blue-100">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message || 'Please wait while we verify your email address...'}
          </p>
          
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Redirecting you to the dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <Button 
              onClick={handleReturnHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Return to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}