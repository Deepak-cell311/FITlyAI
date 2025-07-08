import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MacroTrackerProps {
  userId: number;
}

interface MacroGoals {
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

interface DailyIntake {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export function MacroTracker({ userId }: MacroTrackerProps) {
  const [macroGoals, setMacroGoals] = useState<MacroGoals>({
    dailyCalories: 2000,
    proteinGrams: 150,
    carbGrams: 200,
    fatGrams: 65
  });
  
  const [dailyIntake, setDailyIntake] = useState<DailyIntake>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const [foodEntry, setFoodEntry] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyProgress();
  }, [userId]);

  const loadDailyProgress = async () => {
    try {
      const response = await fetch(`/api/macro-tracking/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.goals) setMacroGoals(data.goals);
        if (data.todayIntake) setDailyIntake(data.todayIntake);
      }
    } catch (error) {
      console.error('Failed to load macro data:', error);
    }
  };

  const addFoodEntry = async () => {
    if (!foodEntry.name || !foodEntry.calories) {
      toast({
        title: "Missing Information",
        description: "Please enter at least food name and calories.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/macro-tracking/add-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          food: {
            name: foodEntry.name,
            calories: parseFloat(foodEntry.calories) || 0,
            protein: parseFloat(foodEntry.protein) || 0,
            carbs: parseFloat(foodEntry.carbs) || 0,
            fats: parseFloat(foodEntry.fats) || 0
          }
        }),
      });

      if (response.ok) {
        const newIntake = {
          calories: dailyIntake.calories + (parseFloat(foodEntry.calories) || 0),
          protein: dailyIntake.protein + (parseFloat(foodEntry.protein) || 0),
          carbs: dailyIntake.carbs + (parseFloat(foodEntry.carbs) || 0),
          fats: dailyIntake.fats + (parseFloat(foodEntry.fats) || 0)
        };
        setDailyIntake(newIntake);
        setFoodEntry({ name: "", calories: "", protein: "", carbs: "", fats: "" });
        
        toast({
          title: "Food Added",
          description: `${foodEntry.name} has been added to your daily intake.`,
        });
      } else {
        throw new Error('Failed to add food entry');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 50) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    if (percentage <= 100) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Daily Macro Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Calories */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(dailyIntake.calories)}
              </div>
              <div className="text-sm text-gray-500">
                / {macroGoals.dailyCalories} cal
              </div>
              <Progress 
                value={calculateProgress(dailyIntake.calories, macroGoals.dailyCalories)}
                className="h-2"
              />
              <div className="text-xs font-medium">
                {Math.round(calculateProgress(dailyIntake.calories, macroGoals.dailyCalories))}%
              </div>
            </div>

            {/* Protein */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(dailyIntake.protein)}g
              </div>
              <div className="text-sm text-gray-500">
                / {macroGoals.proteinGrams}g protein
              </div>
              <Progress 
                value={calculateProgress(dailyIntake.protein, macroGoals.proteinGrams)}
                className="h-2"
              />
              <div className="text-xs font-medium">
                {Math.round(calculateProgress(dailyIntake.protein, macroGoals.proteinGrams))}%
              </div>
            </div>

            {/* Carbs */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(dailyIntake.carbs)}g
              </div>
              <div className="text-sm text-gray-500">
                / {macroGoals.carbGrams}g carbs
              </div>
              <Progress 
                value={calculateProgress(dailyIntake.carbs, macroGoals.carbGrams)}
                className="h-2"
              />
              <div className="text-xs font-medium">
                {Math.round(calculateProgress(dailyIntake.carbs, macroGoals.carbGrams))}%
              </div>
            </div>

            {/* Fats */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(dailyIntake.fats)}g
              </div>
              <div className="text-sm text-gray-500">
                / {macroGoals.fatGrams}g fats
              </div>
              <Progress 
                value={calculateProgress(dailyIntake.fats, macroGoals.fatGrams)}
                className="h-2"
              />
              <div className="text-xs font-medium">
                {Math.round(calculateProgress(dailyIntake.fats, macroGoals.fatGrams))}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Food Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="food-name">Food Name</Label>
                <Input
                  id="food-name"
                  placeholder="e.g., Chicken breast, 200g"
                  value={foodEntry.name}
                  onChange={(e) => setFoodEntry(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="250"
                  value={foodEntry.calories}
                  onChange={(e) => setFoodEntry(prev => ({ ...prev, calories: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="25"
                  value={foodEntry.protein}
                  onChange={(e) => setFoodEntry(prev => ({ ...prev, protein: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="5"
                  value={foodEntry.carbs}
                  onChange={(e) => setFoodEntry(prev => ({ ...prev, carbs: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  placeholder="15"
                  value={foodEntry.fats}
                  onChange={(e) => setFoodEntry(prev => ({ ...prev, fats: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={addFoodEntry} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Adding..." : "Add to Daily Intake"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}