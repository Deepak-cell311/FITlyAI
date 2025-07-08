import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuthentication();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAuthentication();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('fitlyai_user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);
      
      // Check Supabase authentication and get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fitlyai_user');
        return;
      }

      // Verify token and sync user profile with backend using service role
      const response = await fetch('/api/auth/supabase-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.access_token })
      });

      if (!response.ok) {
        // Handle specific email verification error
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.message?.includes('verify your email')) {
            toast({
              title: "Email Verification Required",
              description: "Please check your email and verify your account to continue.",
              variant: "destructive",
            });
          }
        }
        
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fitlyai_user');
        return;
      }

      const { user: userData } = await response.json();
      
      // Verify email is confirmed
      if (!userData.emailVerified) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fitlyai_user');
        return;
      }

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('fitlyai_user', JSON.stringify(userData));

    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('fitlyai_user');
    } finally {
      setIsLoading(false);
    }
  };

  const requireAuth = (redirectPath: string = '/') => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      setLocation(redirectPath);
      return false;
    }
    return isAuthenticated;
  };

  const requireEmailVerification = (redirectPath: string = '/') => {
    if (!isLoading && (!isAuthenticated || !user?.emailVerified)) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email to access this feature.",
        variant: "destructive",
      });
      setLocation(redirectPath);
      return false;
    }
    return isAuthenticated && user?.emailVerified;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('fitlyai_user');
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    requireAuth,
    requireEmailVerification,
    logout,
    checkAuthentication
  };
}