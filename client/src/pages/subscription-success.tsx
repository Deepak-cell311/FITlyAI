import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleSuccessfulPayment = async () => {
      try {
        // Get payment intent from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntentId = urlParams.get('payment_intent');
        const redirectStatus = urlParams.get('redirect_status');

        if (redirectStatus === 'succeeded' && paymentIntentId) {
          // Update user subscription status in backend
          const userData = localStorage.getItem('fitbodyai_user');
          if (userData) {
            const user = JSON.parse(userData);
            
            // Sync updated subscription status with backend
            await apiRequest("POST", "/api/user", {
              supabaseId: user.supabaseId,
              email: user.email,
              username: user.username,
              subscriptionStatus: 'active'
            });

            // Update local storage
            user.subscriptionStatus = 'active';
            localStorage.setItem('fitbodyai_user', JSON.stringify(user));

            toast({
              title: "Welcome to FITlyAI Pro!",
              description: "Your subscription is now active. You can start using all premium features.",
            });
          }
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
        toast({
          title: "Subscription Activated",
          description: "Welcome to FITlyAI Pro! You can now access all premium features.",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handleSuccessfulPayment();
  }, [toast]);

  const handleContinue = () => {
    setLocation('/');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Processing your subscription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Welcome to FITlyAI Pro! Your subscription is now active and you have access to all premium features.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">What's included:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Unlimited AI conversations</li>
              <li>• Personalized workout & diet plans</li>
              <li>• Progress tracking & insights</li>
              <li>• 24/7 AI coaching availability</li>
            </ul>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
          >
            Start Using FITlyAI Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-gray-500">
            Your subscription will automatically renew monthly. You can cancel anytime from your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}