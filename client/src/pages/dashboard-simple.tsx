import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Target, 
  TrendingDown, 
  Users, 
  Calendar,
  Heart,
  Dumbbell,
  Apple,
  ChevronRight,
  ArrowLeft,
  MessageSquare
} from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Sample data for demonstration
const weightData = [
  { date: '2025-01-01', weight: 180 },
  { date: '2025-01-15', weight: 178 },
  { date: '2025-02-01', weight: 175 },
  { date: '2025-02-15', weight: 173 },
  { date: '2025-03-01', weight: 170 },
  { date: '2025-03-15', weight: 168 },
];

const workoutData = [
  { week: 'Week 1', workouts: 3 },
  { week: 'Week 2', workouts: 4 },
  { week: 'Week 3', workouts: 5 },
  { week: 'Week 4', workouts: 4 },
];

const currentGoal = {
  goalType: "weight_loss",
  currentWeight: 168,
  targetWeight: 160,
  timeline: "3 months",
  progress: 60
};

const macroData = {
  dailyCalories: 1800,
  proteinGrams: 135,
  carbGrams: 180,
  fatGrams: 60
};

const recentMeals = [
  { name: "Greek Yogurt with Berries", calories: 200, protein: 20 },
  { name: "Grilled Chicken Salad", calories: 450, protein: 35 },
  { name: "Quinoa Bowl", calories: 380, protein: 12 },
];

const workoutPlans = [
  { name: "Upper Body Strength", type: "Strength Training", duration: "45 min", difficulty: "Intermediate" },
  { name: "HIIT Cardio", type: "Cardio", duration: "30 min", difficulty: "Advanced" },
  { name: "Full Body Circuit", type: "Circuit Training", duration: "40 min", difficulty: "Beginner" },
];

export default function DashboardSimple() {
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
                <span>Back to Chat</span>
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">FITlyAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Pro Member
              </Badge>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">D</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Demo User</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fitness Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your progress and manage your fitness journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentGoal.currentWeight} lbs</div>
                  <p className="text-xs text-muted-foreground">
                    {currentGoal.targetWeight} lbs target
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentGoal.progress}%</div>
                  <Progress value={currentGoal.progress} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Workouts</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">
                    5 planned this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
                  <Apple className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{macroData.dailyCalories}</div>
                  <p className="text-xs text-muted-foreground">
                    Target intake
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Progress</CardTitle>
                  <CardDescription>Your weight loss journey over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Workouts</CardTitle>
                  <CardDescription>Workout completion by week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    Daily Macros
                  </CardTitle>
                  <CardDescription>Your personalized nutrition targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Calories</span>
                      <span className="font-medium">{macroData.dailyCalories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein</span>
                      <span className="font-medium">{macroData.proteinGrams}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs</span>
                      <span className="font-medium">{macroData.carbGrams}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat</span>
                      <span className="font-medium">{macroData.fatGrams}g</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Meals</CardTitle>
                  <CardDescription>Your latest meal entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentMeals.map((meal, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{meal.protein}g protein</p>
                        </div>
                        <span className="text-sm font-medium">{meal.calories} cal</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Your Workout Plans
                </CardTitle>
                <CardDescription>AI-generated workouts tailored to your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workoutPlans.map((workout, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium">{workout.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{workout.type}</span>
                          <span>{workout.duration}</span>
                          <Badge variant="outline" className="text-xs">{workout.difficulty}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Start <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Timeline</CardTitle>
                  <CardDescription>Track your progress toward your fitness goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Weight Loss Progress</span>
                        <span>{currentGoal.progress}%</span>
                      </div>
                      <Progress value={currentGoal.progress} />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Started: 180 lbs</p>
                      <p>Current: {currentGoal.currentWeight} lbs</p>
                      <p>Target: {currentGoal.targetWeight} lbs</p>
                      <p>Timeline: {currentGoal.timeline}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                  <CardDescription>This week's achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Workouts Completed</span>
                      <span className="font-medium">4/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calories Tracked</span>
                      <span className="font-medium">7/7 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight Loss</span>
                      <span className="font-medium text-green-600">-2 lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Streak</span>
                      <span className="font-medium">21 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}