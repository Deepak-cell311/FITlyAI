import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { TrendingUpIcon, TargetIcon, ActivityIcon, DownloadIcon, FileTextIcon, TableIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportToPDF, exportToCSV } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { PlanEditor } from "@/components/plan-editor";
import { SavedPlansSection } from "@/components/saved-plans-section";
import { useState } from "react";

const COLORS = {
  protein: '#ef4444',
  carbs: '#3b82f6', 
  fat: '#f59e0b'
};

// Sample data for demonstration
const sampleUser = {
  id: 1,
  username: "Demo User",
  email: "demo@fitmindeai.com",
  subscriptionStatus: "active"
};

const sampleGoal = {
  id: 1,
  goalType: 'weight_loss',
  currentWeight: 180,
  targetWeight: 160,
  timeline: '3 months',
  activityLevel: 'moderate',
  fitnessExperience: 'intermediate',
  isActive: true
};

const sampleMacro = {
  dailyCalories: 1800,
  proteinGrams: 135,
  carbGrams: 180,
  fatGrams: 60,
  proteinPercent: 30,
  carbPercent: 40,
  fatPercent: 30,
  mealsPerDay: 3
};

const sampleProgress = [
  { date: '12/1', weight: 180, bodyFat: 22, energy: 7 },
  { date: '12/2', weight: 179, bodyFat: 21.8, energy: 8 },
  { date: '12/3', weight: 179, bodyFat: 21.6, energy: 6 },
  { date: '12/4', weight: 178, bodyFat: 21.4, energy: 9 },
  { date: '12/5', weight: 178, bodyFat: 21.2, energy: 7 },
  { date: '12/6', weight: 177, bodyFat: 21.0, energy: 8 },
  { date: '12/7', weight: 176, bodyFat: 20.8, energy: 9 }
];

const macroChartData = [
  { name: 'Protein', value: sampleMacro.proteinPercent, grams: sampleMacro.proteinGrams, color: COLORS.protein },
  { name: 'Carbs', value: sampleMacro.carbPercent, grams: sampleMacro.carbGrams, color: COLORS.carbs },
  { name: 'Fat', value: sampleMacro.fatPercent, grams: sampleMacro.fatGrams, color: COLORS.fat }
];

export default function DashboardDemo() {
  const { toast } = useToast();
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const goalProgress = 65; // Demo progress percentage

  const handleExportPDF = () => {
    const exportData = {
      user: sampleUser,
      goal: sampleGoal,
      macros: sampleMacro,
      progress: sampleProgress
    };
    
    exportToPDF(exportData);
    toast({
      title: "PDF Downloaded",
      description: "Your progress report has been saved as a PDF file.",
    });
  };

  const handleExportCSV = () => {
    const exportData = {
      user: sampleUser,
      goal: sampleGoal,
      macros: sampleMacro,
      progress: sampleProgress
    };
    
    exportToCSV(exportData);
    toast({
      title: "CSV Downloaded", 
      description: "Your progress data has been saved as a CSV file.",
    });
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/generate-plan/${sampleUser.id}`, {
        method: "POST"
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedPlan(data.plan);
        setShowPlanEditor(true);
        toast({
          title: "Plan Generated",
          description: "Your personalized fitness plan is ready for review!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Generation Failed",
          description: error.message || "Unable to generate plan at this time.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {sampleUser.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your fitness journey and achieve your goals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button 
                  onClick={handleExportPDF} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileTextIcon className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button 
                  onClick={handleExportCSV} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TableIcon className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <Badge variant="default">
                Premium Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Goal Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Current Goal: WEIGHT LOSS
            </CardTitle>
            <CardDescription>
              Target: {sampleGoal.currentWeight} → {sampleGoal.targetWeight} lbs | Timeline: {sampleGoal.timeline}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{goalProgress}% complete</span>
                </div>
                <Progress value={goalProgress} className="h-3" />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Tips to Improve Results:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Great progress! Consider adjusting your macro ratios for better results</li>
                  <li>• Increase workout intensity gradually</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleGeneratePlan}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate New AI Plan from My Goal"}
                </Button>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Creates personalized macro plan, meal plan, and workout routine
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Weight & Body Fat Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Weight (lbs)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Body Fat (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Macro Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Macro Breakdown</CardTitle>
              <CardDescription>
                {sampleMacro.dailyCalories} calories • {sampleMacro.mealsPerDay} meals/day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={macroChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {macroChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  {macroChartData.map((macro) => (
                    <div key={macro.name} className="space-y-1">
                      <div className="text-2xl font-bold" style={{color: macro.color}}>
                        {macro.grams}g
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {macro.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Energy Levels (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sampleProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar 
                  dataKey="energy" 
                  fill="#22c55e" 
                  name="Energy Level"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Workouts This Month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">7</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Days Tracked
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">Moderate</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Activity Level
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">Intermediate</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Experience Level
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Plans Section */}
        <SavedPlansSection userId={sampleUser.id} />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.href = '/'}>
            Chat with FitlyAI
          </Button>
          <Button variant="outline">
            Update Goals
          </Button>
          <Button variant="outline">
            Log Progress
          </Button>
        </div>

        {/* Plan Editor Modal */}
        {showPlanEditor && generatedPlan && (
          <PlanEditor
            plan={generatedPlan}
            goalId={sampleGoal.id}
            userId={sampleUser.id}
            onSave={() => {
              setShowPlanEditor(false);
              setGeneratedPlan(null);
              toast({
                title: "Plan Saved",
                description: "Your personalized fitness plan has been saved to your dashboard.",
              });
            }}
            onClose={() => {
              setShowPlanEditor(false);
              setGeneratedPlan(null);
            }}
          />
        )}
      </div>
    </div>
  );
}