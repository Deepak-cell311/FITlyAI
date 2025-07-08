import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const statusParam = urlParams.get('status');
        const token = urlParams.get('token');

        // Handle redirected verification success from backend
        if (statusParam === 'success') {
          setStatus('success');
          setMessage('Email verified successfully! Your FitlyAI account is now active.');
          
          toast({
            title: "Email Verified!",
            description: "Welcome to FitlyAI! Your account is now active.",
          });

          // Redirect to login page after success
          setTimeout(() => {
            setLocation('/?login=true');
          }, 3000);
          return;
        }

        // Legacy token-based verification (if still needed)
        if (token && !statusParam) {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });

          if (response.ok) {
            const data = await response.json();
            setStatus('success');
            setMessage('Email verified successfully! Your FitlyAI account is now active.');
            
            toast({
              title: "Email Verified!",
              description: "Welcome to FitlyAI! Your account is now active.",
            });

            setTimeout(() => {
              setLocation('/?login=true');
            }, 3000);
          } else {
            const errorData = await response.json();
            setStatus('error');
            setMessage(errorData.message || 'Verification failed. Please try again.');
          }
        } else {
          // Check for hash parameters in URL (Supabase auth tokens fallback)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set the session with the tokens from email verification
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              setStatus('error');
              setMessage('Verification failed. Please try again or contact support.');
              return;
            }

            if (data.user) {
              setStatus('success');
              setMessage('Email verified successfully! Your FitlyAI account is now active.');
              
              toast({
                title: "Email Verified!",
                description: "Welcome to FitlyAI! Your account is now active.",
              });

              // Redirect to dashboard after success
              setTimeout(() => {
                setLocation('/');
              }, 3000);
            }
          } else {
            setStatus('error');
            setMessage('Invalid verification link. Please check your email for the correct link.');
          }
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('Something went wrong during verification. Please try again.');
      }
    };

    handleEmailVerification();
  }, [setLocation, toast]);

  const handleReturnHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {status === 'loading' && (
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
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
          <p className="text-gray-600 dark:text-gray-300">
            {message || 'Please wait while we verify your email address...'}
          </p>
          
          {status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                You can now log in to your FitlyAI account. You'll be redirected to the homepage in a few seconds.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                If this problem persists, please try signing up again or contact our support team.
              </p>
            </div>
          )}
          
          <div className="pt-4">
            <Button onClick={handleReturnHome} variant="outline" className="w-full">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}