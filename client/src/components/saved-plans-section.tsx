import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon, ClockIcon, TargetIcon } from "lucide-react";

interface SavedPlansProps {
  userId: number;
}

interface MacroPlan {
  id: number;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  createdAt: string;
}

interface MealPlan {
  id: number;
  mealName: string;
  instructions: string;
  calories: number;
  createdAt: string;
}

interface WorkoutPlan {
  id: number;
  planName: string;
  workoutType: string;
  difficulty: string;
  daysPerWeek: number;
  sessionDuration: number;
  exercises: any;
  createdAt: string;
}

export function SavedPlansSection({ userId }: SavedPlansProps) {
  const [macroPlan, setMacroPlan] = useState<MacroPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [macroRes, mealRes, workoutRes] = await Promise.all([
          fetch(`/api/plan/macro/${userId}`),
          fetch(`/api/plan/meal/${userId}`),
          fetch(`/api/plan/workout/${userId}`)
        ]);

        if (macroRes.ok) {
          const macroData = await macroRes.json();
          setMacroPlan(macroData.plan);
        }

        if (mealRes.ok) {
          const mealData = await mealRes.json();
          setMealPlan(mealData.plan);
        }

        if (workoutRes.ok) {
          const workoutData = await workoutRes.json();
          setWorkoutPlan(workoutData.plan);
        }
      } catch (error) {
        console.error("Error fetching saved plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Saved Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasAnyPlan = macroPlan || mealPlan || workoutPlan;

  if (!hasAnyPlan) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TargetIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No Plans Generated Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Click "Generate New AI Plan from My Goal" to create your personalized fitness plan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Saved Plans</h2>
        <Badge variant="secondary">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          AI Generated
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Macro Plan */}
        {macroPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TargetIcon className="h-5 w-5" />
                Daily Macros
              </CardTitle>
              <CardDescription>
                Created {new Date(macroPlan.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-blue-600">{macroPlan.dailyCalories}</div>
                  <div className="text-gray-600 dark:text-gray-300">Calories</div>
                </div>
                <div>
                  <div className="font-semibold text-red-600">{macroPlan.proteinGrams}g</div>
                  <div className="text-gray-600 dark:text-gray-300">Protein</div>
                </div>
                <div>
                  <div className="font-semibold text-green-600">{macroPlan.carbGrams}g</div>
                  <div className="text-gray-600 dark:text-gray-300">Carbs</div>
                </div>
                <div>
                  <div className="font-semibold text-yellow-600">{macroPlan.fatGrams}g</div>
                  <div className="text-gray-600 dark:text-gray-300">Fats</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meal Plan */}
        {mealPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Meal Plan
              </CardTitle>
              <CardDescription>
                {mealPlan.mealName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
                {mealPlan.instructions?.substring(0, 120)}...
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target Calories:</span>
                <span className="font-semibold">{mealPlan.calories}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Plan */}
        {workoutPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TargetIcon className="h-5 w-5" />
                Workout Plan
              </CardTitle>
              <CardDescription>
                {workoutPlan.planName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">{workoutPlan.daysPerWeek}</div>
                  <div className="text-gray-600 dark:text-gray-300">Days/Week</div>
                </div>
                <div>
                  <div className="font-semibold">{workoutPlan.sessionDuration}min</div>
                  <div className="text-gray-600 dark:text-gray-300">Per Session</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {workoutPlan.workoutType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {workoutPlan.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}