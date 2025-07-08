import { Crown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionStatusProps {
  user: {
    subscriptionStatus: string;
  };
  onManageSubscription: () => void;
}

export function SubscriptionStatus({ user, onManageSubscription }: SubscriptionStatusProps) {
  if (user.subscriptionStatus !== 'active') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 mb-8 border border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Crown className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pro Membership Active</h3>
            <p className="text-gray-600">Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} • $15/month</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onManageSubscription}
          className="text-primary hover:bg-primary/5"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </div>
    </div>
  );
}
