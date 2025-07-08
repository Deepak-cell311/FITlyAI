import { useState } from "react";
import { Check, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SubscriptionPlansProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string, priceId: string) => void;
  currentUser?: {
    id: number;
    subscriptionStatus?: string;
  } | null;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    priceId: "",
    popular: false,
    description: "Get started with basic AI coaching",
    features: [
      "10 AI chat messages per day",
      "Basic workout suggestions",
      "Community support",
      "Basic fitness guidance"
    ],
    limitations: [
      "Limited to 10 messages daily",
      "No dashboard access",
      "No macro tracking",
      "Basic features only"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "$15",
    period: "month",
    priceId: "price_1RxYLTHotdPqK5pJzwe7iGed",
    popular: true,
    description: "Unlimited coaching with dashboard access",
    features: [
      "Unlimited AI chat messages",
      "Full dashboard access",
      "Advanced workout plans",
      "Progress tracking",
      "Priority support",
      "Goal-specific coaching",
      "Nutrition guidance"
    ],
    limitations: [
      "No macro tracking features"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "month", 
    priceId: "price_1RxY8CHotdPqK5pJOz5vMRAPs",
    popular: false,
    description: "Everything + advanced macro tracking",
    features: [
      "Everything in Premium",
      "Advanced macro tracking",
      "Daily calorie monitoring",
      "Custom meal planning",
      "Detailed nutrition analytics",
      "Body composition tracking",
      "1-on-1 coaching sessions",
      "Competition prep support"
    ],
    limitations: []
  }
];

export function SubscriptionPlans({ isOpen, onClose, onSelectPlan, currentUser }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  const handleSelectPlan = (planId: string, priceId: string) => {
    if (planId === "free") {
      // Handle free trial signup
      onClose();
      return;
    }
    onSelectPlan(planId, priceId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Fitness Journey
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            Unlock your potential with AI-powered fitness coaching
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-200 bg-gradient-to-b from-blue-50 to-white' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  {plan.id === "free" && <Zap className="w-6 h-6 text-green-500 mr-2" />}
                  {plan.id === "pro" && <Star className="w-6 h-6 text-blue-500 mr-2" />}
                  {plan.id === "premium" && <Crown className="w-6 h-6 text-purple-500 mr-2" />}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500">/{plan.period}</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <span className="w-4 h-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-xs text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id, plan.priceId)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : plan.id === "free"
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                disabled={currentUser?.subscriptionStatus === 'active' && plan.id !== "premium"}
              >
                {plan.id === "free" ? "Start Free Trial" : 
                 currentUser?.subscriptionStatus === 'active' ? "Current Plan" : 
                 `Choose ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              All plans include secure payment processing via Stripe
            </p>
            <p className="text-xs text-gray-500">
              Cancel anytime • No hidden fees • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}