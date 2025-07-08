import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { SubscriptionStatus } from "@/components/subscription-status";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { ChatInterface } from "@/components/chat-interface";
import { MacroTracker } from "@/components/macro-tracker";
import { SafetyFooter } from "@/components/safety-footer";
import { supabaseAuth, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Crown, Check } from "lucide-react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    setLocation: (path: string) => void;
  }
}

// Global types for Supabase authentication


interface User {
  id: number;
  username: string;
  email: string;
  subscriptionStatus: string;
  subscriptionTier?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupPlan, setSignupPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Debug logging for user data changes
  useEffect(() => {
    if (user) {
      console.log('User data updated:', {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
        macroAccessCheck: user.subscriptionStatus === 'active' && user.subscriptionTier === 'pro'
      });
    }
  }, [user]);

  const subscribe = async (plan: string) => {
    setSignupPlan(plan);
    setShowSignupModal(true);
    // Close pricing modal
    const modal = document.getElementById('pricing-modal');
    if (modal) modal.style.display = 'none';
  };

  const handleAuth = async () => {
    // Enhanced validation
    if (!userEmail || !userPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both email and password fields.",
        variant: "destructive",
      });
      return;
    }

    if (authMode === 'register' && (!userFirstName || !userLastName)) {
      toast({
        title: "Missing Information",
        description: "Please fill in your first and last name.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (userPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (authMode === 'register') {
        // Use server-side signup endpoint with service role key
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            password: userPassword,
            first_name: userFirstName,
            last_name: userLastName,
            plan: signupPlan
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast({
            title: "Signup Failed",
            description: data.error || "Failed to create account. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Store user info in localStorage for personalization
        localStorage.setItem('userFirstName', userFirstName);
        localStorage.setItem('userLastName', userLastName);
        localStorage.setItem('userPlan', signupPlan);
        localStorage.setItem('userEmail', userEmail);

        toast({
          title: "Account Created Successfully",
          description: `Welcome ${userFirstName}! Please check your email and click the verification link to activate your account.`,
          duration: 8000,
        });

        // Clear form and close modal
        setUserEmail('');
        setUserPassword('');
        setUserFirstName('');
        setUserLastName('');
        setShowSignupModal(false);
        return;

      } else {
        // Sign in existing user
        const data = await supabaseAuth.signIn(userEmail, userPassword);
        
        if (data.user) {
          // Verify with backend
          const session = await supabaseAuth.getSession();
          if (session?.access_token) {
            const response = await fetch('/api/auth/supabase-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: session.access_token })
            });

            if (response.ok) {
              const userData = await response.json();
              setUser(userData.user);
              toast({
                title: "Welcome back!",
                description: "Successfully signed in.",
              });
            }
          }
        }
      }

      // Handle post-authentication flow for sign-in only
      if (authMode === 'login') {
        setShowSignupModal(false);
        setUserEmail('');
        setUserPassword('');
        await initializeUser();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };



  useEffect(() => {
    initializeUser();
    
    // Check for email verification success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === '1') {
      toast({
        title: "Email Verified Successfully!",
        description: "Your account has been verified. You can now sign in to access all features.",
        duration: 8000,
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          initializeUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('fitlyai_user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      
      // Check Supabase authentication first
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error || !supabaseUser) {
        // No authenticated user
        setUser(null);
        localStorage.removeItem('fitlyai_user');
        setIsLoading(false);
        return;
      }

      // Verify email is confirmed
      if (!supabaseUser.email_confirmed_at) {
        setUser(null);
        localStorage.removeItem('fitlyai_user');
        setIsLoading(false);
        toast({
          title: "Email Verification Required",
          description: "Please check your email and click the verification link to access your account.",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile from backend which uses user_profiles table
      const session = await supabase.auth.getSession();
      if (session.data.session?.access_token) {
        try {
          const response = await fetch('/api/auth/supabase-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session.data.session.access_token })
          });

          if (response.ok) {
            const { user: userData } = await response.json();
            console.log('User data from supabase-verify:', userData);
            setUser(userData);
            localStorage.setItem('fitlyai_user', JSON.stringify(userData));
          } else {
            console.error('Supabase verify failed with status:', response.status);
            const errorData = await response.text();
            console.error('Error response:', errorData);
            // Fallback to basic user data if profile fetch fails
            const userData = {
              id: parseInt(supabaseUser.id.slice(-8), 16),
              username: supabaseUser.email?.split('@')[0] || 'User',
              email: supabaseUser.email || '',
              subscriptionStatus: 'free',
              subscriptionTier: 'free',
              firstName: localStorage.getItem('userFirstName') || '',
              lastName: localStorage.getItem('userLastName') || '',
              emailVerified: !!supabaseUser.email_confirmed_at
            };
            console.log('Using fallback user data:', userData);
            setUser(userData);
            localStorage.setItem('fitlyai_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Profile fetch error:', error);
          setUser(null);
          localStorage.removeItem('fitlyai_user');
        }
      }

    } catch (error) {
      console.error('Error initializing user:', error);
      setUser(null);
      localStorage.removeItem('fitlyai_user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setShowSubscriptionModal(true);
  };



  const handlePlanSelection = async (plan: string) => {
    if (plan === 'free') {
      toast({
        title: "Free Plan Selected",
        description: "You're all set with the free plan! Start chatting with FitlyAI.",
      });
      const modal = document.getElementById('pricing-modal');
      if (modal) modal.style.display = 'none';
      return;
    }

    // Check if user is authenticated for paid plans
    try {
      const currentUser = await supabaseAuth.getCurrentUser();
      if (!currentUser) {
        window.location.href = "/login.html";
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tier: plan,
          userId: user?.id || 1,
          email: currentUser.email || 'user@example.com'
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        toast({
          title: "Payment Error",
          description: errorData.error || "Unable to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignIn = async () => {
    if (!userEmail || !userPassword) {
      toast({
        title: "Complete Required Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Sign in with Supabase
      const signInResult = await supabaseAuth.signIn(userEmail, userPassword);
      
      if (signInResult.user) {
        // Get session token and verify with backend
        const session = await supabaseAuth.getSession();
        if (session?.access_token) {
          const response = await fetch('/api/auth/supabase-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: session.access_token }),
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            toast({
              title: "Welcome Back!",
              description: "Successfully signed in to your account.",
            });
            
            // Clear form
            setUserEmail('');
            setUserPassword('');
          } else {
            toast({
              title: "Authentication Error",
              description: "Unable to verify your account. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Login Error", 
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabaseAuth.signOut();
    localStorage.removeItem('fitlyai_user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  const handleDirectCheckout = async () => {
    if (!userEmail || !userPassword) {
      toast({
        title: "Complete Required Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setShowSubscriptionModal(false);
      
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          priceAmount: 1500, // $15.00 in cents
          planName: 'FitlyAI Pro Monthly',
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Account Creation Error",
        description: "Unable to create account and start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribeRequired = async () => {
    setShowSubscriptionModal(true);
  };

  const handleDemoLogin = async () => {
    if (!userEmail || !userPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword
        })
      });

      if (response.ok) {
        const { user } = await response.json();
        setUser(user);
        localStorage.setItem('fitlyai_user', JSON.stringify(user));
        toast({
          title: "Logged In Successfully",
          description: `Welcome! You have ${user.subscriptionTier || 'free'} tier access.`,
        });
      } else {
        // Try registration if login fails
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userEmail.split('@')[0],
            email: userEmail,
            password: userPassword
          })
        });

        if (registerResponse.ok) {
          const { user } = await registerResponse.json();
          setUser(user);
          localStorage.setItem('fitlyai_user', JSON.stringify(user));
          toast({
            title: "Account Created",
            description: `Welcome to FitlyAI! You have ${user.subscriptionTier || 'free'} tier access.`,
          });
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: "Invalid credentials. Try demo accounts: pro@demo.com / premium@demo.com with password 'password'",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async () => {
    if (!userEmail || !userPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create free Supabase account
      const response = await supabaseAuth.signUp(userEmail, userPassword, userEmail.split('@')[0]);
      
      if (response.user) {
        // Sync with backend to create user record
        await fetch('/api/auth/supabase-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: response.session?.access_token })
        });

        toast({
          title: "Account Created",
          description: "Your free account has been created successfully!",
        });
        
        setShowSubscriptionModal(false);
        setUserEmail('');
        setUserPassword('');
        initializeUser();
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlan = async (planId: string, priceId: string) => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in before selecting a plan.",
        variant: "destructive",
      });
      setShowSubscriptionModal(false);
      return;
    }

    try {
      // Create Stripe checkout session with optimized API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: planId,
          userId: user.id,
          email: user.email
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        toast({
          title: "Payment Error",
          description: errorData.error || "Unable to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifySubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/verify-subscription/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const { user: updatedUser, hasActiveSubscription } = await response.json();
        setUser(updatedUser);
        
        if (hasActiveSubscription) {
          toast({
            title: "Subscription Verified",
            description: "Your Pro subscription is now active!",
          });
        } else {
          toast({
            title: "No Active Subscription",
            description: "No active subscription found. Please complete your payment.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Unable to verify subscription status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => {
          setAuthMode('login');
          setShowSignupModal(true);
        }} 
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
        {user ? (
          <>
            {/* Dashboard with feature tabs based on subscription tier */}
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">AI Chat</TabsTrigger>
                <TabsTrigger value="dashboard">
                  Dashboard {user.subscriptionStatus !== 'active' && '(Preview)'}
                </TabsTrigger>
                <TabsTrigger value="macro">
                  Macro Tracking {user.subscriptionTier !== 'pro' && '(Pro)'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-6">
                <ChatInterface user={user} onSubscribeRequired={handleSubscribeRequired} />
              </TabsContent>
              
              <TabsContent value="dashboard" className="mt-6">
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Full Dashboard</h3>
                    <p className="text-gray-600 mb-6">Click the button below to navigate to your complete dashboard with all features and analytics.</p>
                    <Button 
                      onClick={() => setLocation('/dashboard')} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="macro" className="mt-6">
                {user.subscriptionStatus === 'active' && user.subscriptionTier === 'pro' ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro Macro Tracking</h2>
                      <p className="text-gray-600">Advanced nutrition monitoring and macro management for optimal results.</p>
                    </div>
                    <MacroTracker userId={user.id} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {user.subscriptionStatus === 'active' ? 'Upgrade to Pro Macro Tracking' : 'Pro Macro Tracking Preview'}
                      </h2>
                      <p className="text-gray-600 mb-8">
                        Take your nutrition to the next level with advanced macro tracking and detailed analytics.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="relative">
                        <div className="absolute inset-0 bg-purple-50/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-purple-700">Pro Feature</p>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">Daily Macro Goals</h3>
                          <p className="text-gray-600">Set and track protein, carbs, and fat targets with precision.</p>
                          <div className="mt-4 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Macro Circles</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="relative">
                        <div className="absolute inset-0 bg-purple-50/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-purple-700">Pro Feature</p>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">Calorie Tracking</h3>
                          <p className="text-gray-600">Monitor daily calorie intake with detailed breakdowns.</p>
                          <div className="mt-4 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Calorie Chart</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="relative">
                        <div className="absolute inset-0 bg-purple-50/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-purple-700">Pro Feature</p>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">Nutrition Analytics</h3>
                          <p className="text-gray-600">Advanced insights and progress reports for optimization.</p>
                          <div className="mt-4 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Analytics Dashboard</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center py-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlock Pro Macro Tracking</h3>
                      <p className="text-gray-600 mb-4">
                        {user.subscriptionStatus === 'active' 
                          ? 'Upgrade from Premium to Pro for just $14 more per month' 
                          : 'Get Pro access for $29/month and unlock advanced nutrition features'}
                      </p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Precise macro and calorie tracking
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Detailed nutrition analytics and insights
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Personalized macro goal recommendations
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Progress tracking and optimization tips
                        </div>
                      </div>
                      <Button onClick={handleSubscribeRequired} className="bg-purple-600 hover:bg-purple-700">
                        {user.subscriptionStatus === 'active' ? 'Upgrade to Pro' : 'Start Pro Trial'}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <SafetyFooter />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Premium AI Fitness Coaching
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Professional-grade personalized workout plans, nutrition guidance, and 24/7 AI support with premium features.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-blue-800 font-medium text-center">
                  Choose your plan - Free trial available, Premium features unlock advanced AI coaching
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    const modal = document.getElementById('pricing-modal');
                    if (modal) modal.style.display = 'block';
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  View Plans & Pricing
                </button>

              </div>
            </div>
            <SafetyFooter />
          </div>
        )}

        {/* Pricing Modal */}
        <div 
          id="pricing-modal" 
          style={{
            display: 'none',
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 999,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          <div style={{
            maxWidth: '950px',
            margin: '60px auto',
            background: 'white',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <button 
                onClick={() => {
                  const modal = document.getElementById('pricing-modal');
                  if (modal) modal.style.display = 'none';
                }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                ×
              </button>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                color: '#1a1a1a'
              }}>
                Choose Your Fitness Journey
              </h2>
              <p style={{ color: '#666', margin: '0', fontSize: '16px' }}>
                Unlock your potential with AI-powered fitness coaching
              </p>
            </div>

            {/* Pricing Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              
              {/* Free Tier */}
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                background: '#fafafa',
                position: 'relative'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#10b981', marginRight: '8px' }}>⚡</span>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      margin: '0',
                      color: '#1a1a1a'
                    }}>
                      Free
                    </h3>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#1a1a1a'
                    }}>
                      $0
                    </span>
                    <span style={{ color: '#666', fontSize: '16px' }}>
                      /forever
                    </span>
                  </div>
                  <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                    Get started with basic AI coaching
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      color: '#10b981',
                      marginRight: '8px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </span>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      10 AI chat messages per day
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      color: '#10b981',
                      marginRight: '8px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </span>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      Basic workout suggestions
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      color: '#10b981',
                      marginRight: '8px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </span>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      Community support
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      color: '#10b981',
                      marginRight: '8px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </span>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      Basic fitness guidance
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase'
                  }}>
                    Limitations:
                  </h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    • Limited to 10 messages daily<br />
                    • No dashboard access<br />
                    • No macro tracking<br />
                    • Basic features only
                  </div>
                </div>

                <button 
                  onClick={() => subscribe('free')}
                  style={{
                    width: '100%',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Start Free Trial
                </button>
              </div>

              {/* Premium Tier */}
              <div style={{
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                padding: '1.5rem',
                background: 'white',
                position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  👑 Most Popular
                </div>
                
                <div style={{ marginBottom: '1rem', marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#3b82f6', marginRight: '8px' }}>👑</span>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      margin: '0',
                      color: '#1a1a1a'
                    }}>
                      Premium
                    </h3>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#1a1a1a'
                    }}>
                      $14.99
                    </span>
                    <span style={{ color: '#666', fontSize: '16px' }}>
                      /month
                    </span>
                  </div>
                  <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                    Unlimited coaching with dashboard access
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  {[
                    'Unlimited AI chat messages',
                    'Full dashboard access',
                    'Advanced workout plans',
                    'Progress tracking',
                    'Priority support',
                    'Goal-specific coaching',
                    'Nutrition guidance'
                  ].map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        color: '#10b981',
                        marginRight: '8px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase'
                  }}>
                    Limitations:
                  </h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    • No macro tracking features
                  </div>
                </div>

                <button 
                  onClick={() => subscribe('premium')}
                  style={{
                    width: '100%',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Choose Premium
                </button>
              </div>

              {/* Pro Tier */}
              <div style={{
                border: '2px solid #1f2937',
                borderRadius: '12px',
                padding: '1.5rem',
                background: '#f9fafb',
                position: 'relative'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#1f2937', marginRight: '8px' }}>⭐</span>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      margin: '0',
                      color: '#1a1a1a'
                    }}>
                      Pro
                    </h3>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#1a1a1a'
                    }}>
                      $19.99
                    </span>
                    <span style={{ color: '#666', fontSize: '16px' }}>
                      /month
                    </span>
                  </div>
                  <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                    Everything + advanced macro tracking
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  {[
                    'Everything in Premium',
                    'Advanced macro tracking',
                    'Daily calorie monitoring',
                    'Custom meal planning',
                    'Detailed nutrition analytics',
                    'Body composition tracking',
                    '1-on-1 coaching sessions',
                    'Competition prep support'
                  ].map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        color: '#10b981',
                        marginRight: '8px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => subscribe('pro')}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Choose Pro
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '13px',
              lineHeight: '1.4'
            }}>
              All plans include secure payment processing via Stripe<br />
              Cancel anytime • No hidden fees • 30-day money-back guarantee
            </div>
          </div>
        </div>

      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl">
          <DialogHeader className="space-y-3 pb-6">
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              {signupPlan === 'free' ? 'Join FitlyAI Free' : `Subscribe to FitlyAI ${signupPlan.charAt(0).toUpperCase() + signupPlan.slice(1)}`}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              {authMode === 'register' 
                ? 'Create your account to start your fitness journey' 
                : 'Welcome back! Sign in to continue'}
            </DialogDescription>
            {signupPlan !== 'free' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center font-medium">
                  {signupPlan === 'premium' ? '$14.99/month' : '$19.99/month'} • Cancel anytime
                </p>
              </div>
            )}
          </DialogHeader>
          
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
              >
                Log In
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="register" className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    placeholder="John"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    placeholder="Doe"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSignupModal(false);
                    setUserEmail('');
                    setUserPassword('');
                    setUserFirstName('');
                    setUserLastName('');
                  }}
                  className="flex-1 h-11 border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAuth} 
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {signupPlan === 'free' ? 'Create Account' : 'Continue to Checkout'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="login" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSignupModal(false);
                    setUserEmail('');
                    setUserPassword('');
                    setUserFirstName('');
                    setUserLastName('');
                  }}
                  className="flex-1 h-11 border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAuth} 
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {signupPlan === 'free' ? 'Sign In' : 'Continue to Checkout'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      </div>



      {/* Authentication Modal - No subscription required */}
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center space-x-2">
              <span>Create Free Account</span>
            </DialogTitle>
            <DialogDescription>
              Sign up for unlimited AI coaching and personalized fitness plans
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Get unlimited AI coaching, personalized plans, and progress tracking - completely free.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Unlimited AI conversations</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Personalized workout & diet plans</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Progress tracking & insights</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Voice input support</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">100% Free</div>
                <div className="text-sm text-gray-500">No payment required - just create an account</div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  By signing up, you agree to our terms. No payment required.
                </div>
              </div>
              
              <button 
                onClick={handleRegister}
                disabled={!userEmail || !userPassword}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Create Free Account
              </button>
              <Button 
                variant="ghost"
                onClick={() => setShowSubscriptionModal(false)}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Subscription Plans Modal */}
      <SubscriptionPlans
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelectPlan={handleSelectPlan}
        currentUser={user}
      />



    </div>
  );
}


