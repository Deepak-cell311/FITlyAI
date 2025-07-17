import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./components/Fitly Ai/app/page";
import SubscriptionSuccess from "@/pages/subscription-success";
import Dashboard from "@/pages/dashboard";
import DashboardDemo from "@/pages/dashboard-demo";
import DashboardSimple from "@/pages/dashboard-simple";
import AuthCallback from "@/pages/auth-callback";
import Verify from "@/pages/verify";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import AuthDebug from "@/pages/auth-debug";
import LoginPage from "./components/Fitly Ai/app/login/page";
import SignupPage from "./components/Fitly Ai/app/signup/page";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth-debug" element={<AuthDebug />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/dashboard" element={<DashboardSimple />} />
            <Route path="/demo" element={<DashboardDemo />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
