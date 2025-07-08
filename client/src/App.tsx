import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import SubscriptionSuccess from "@/pages/subscription-success";
import Dashboard from "@/pages/dashboard";
import DashboardDemo from "@/pages/dashboard-demo";
import DashboardSimple from "@/pages/dashboard-simple";
import AuthCallback from "@/pages/auth-callback";
import Verify from "@/pages/verify";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import AuthDebug from "@/pages/auth-debug";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/verify" component={Verify} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/auth-debug" component={AuthDebug} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/dashboard" component={DashboardSimple} />
      <Route path="/demo" component={DashboardDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
