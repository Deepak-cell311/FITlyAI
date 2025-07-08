import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon, TargetIcon, ActivityIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/navigation-header";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  username: string;
  email: string;
  subscriptionStatus: string;
  subscriptionTier: string;
}

interface UserGoal {
  id: number;
  goalType: string;
  currentWeight: number;
  targetWeight: number;
  timeline: string;
  activityLevel: string;
  isActive: boolean;
  createdAt: string;
}

interface MacroPlan {
  id: number;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

interface ProgressEntry {
  id: number;
  weight?: number;
  recordDate: string;
  mood: string;
  energyLevel: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isLoading, requireEmailVerification, logout } = useAuth();

  // Protect dashboard access with authentication
  useEffect(() => {
    if (!isLoading) {
      requireEmailVerification();
    }
  }, [isLoading, requireEmailVerification]);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch user goals
  const { data: goals = [] } = useQuery<UserGoal[]>({
    queryKey: [`/api/goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch macro plans
  const { data: macros = [] } = useQuery<MacroPlan[]>({
    queryKey: [`/api/macros/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch progress data
  const { data: progress = [] } = useQuery<ProgressEntry[]>({
    queryKey: [`/api/progress/${user?.id}`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeGoal = goals.find((goal: UserGoal) => goal.isActive);
  const latestMacro = macros[macros.length - 1];
  const latestProgress = progress[progress.length - 1];

  // Calculate progress percentage
  const progressPercentage = activeGoal && latestProgress?.weight 
    ? Math.min(100, Math.max(0, 
        ((activeGoal.currentWeight - (latestProgress.weight || activeGoal.currentWeight)) / 
         (activeGoal.currentWeight - activeGoal.targetWeight)) * 100
      ))
    : 0;

  // Prepare chart data
  const weightData = progress
    .filter((p: ProgressEntry) => p.weight)
    .slice(-30)
    .map((p: ProgressEntry) => ({
      date: new Date(p.recordDate).toLocaleDateString(),
      weight: p.weight
    }));

  const macroData = latestMacro ? [
    { name: 'Protein', value: latestMacro.proteinGrams, fill: '#3b82f6' },
    { name: 'Carbs', value: latestMacro.carbGrams, fill: '#10b981' },
    { name: 'Fats', value: latestMacro.fatGrams, fill: '#f59e0b' }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationHeader 
        user={user} 
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">
            Track your fitness journey and achieve your goals
          </p>
          <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'} className="mt-2">
            {user.subscriptionTier?.toUpperCase()} Plan
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Goal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Goal</CardTitle>
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {activeGoal ? (
                <div>
                  <div className="text-2xl font-bold">{activeGoal.goalType}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeGoal.currentWeight}lbs → {activeGoal.targetWeight}lbs
                  </p>
                  <Progress value={progressPercentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {progressPercentage.toFixed(1)}% complete
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No active goal set
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Calories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestMacro?.dailyCalories || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Target calories per day
              </p>
            </CardContent>
          </Card>

          {/* Current Weight */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestProgress?.weight || activeGoal?.currentWeight || 0} lbs
              </div>
              <p className="text-xs text-muted-foreground">
                Last recorded weight
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Your weight over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No weight data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Macro Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Macro Distribution</CardTitle>
              <CardDescription>Your current macro breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {macroData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}g`}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No macro plan set up yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {user.subscriptionTier === 'free' && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Unlock Full Dashboard</CardTitle>
              <CardDescription className="text-orange-600">
                Upgrade to Premium or Pro to access advanced tracking features, detailed analytics, and personalized coaching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/')} 
                className="bg-orange-600 hover:bg-orange-700"
              >
                View Upgrade Options
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}