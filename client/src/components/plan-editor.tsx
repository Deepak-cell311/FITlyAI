import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditIcon, CheckIcon, XIcon, RefreshCwIcon } from "lucide-react";

interface PlanEditorProps {
  plan: {
    macro: string;
    meals: string;
    workout: string;
    full_content: string;
  };
  goalId: number;
  userId: number;
  onSave: () => void;
  onClose: () => void;
}

export function PlanEditor({ plan, goalId, userId, onSave, onClose }: PlanEditorProps) {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isRevising, setIsRevising] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [sections, setSections] = useState({
    macro: plan.macro,
    meals: plan.meals,
    workout: plan.workout
  });

  const [macroData, setMacroData] = useState({
    dailyCalories: 0,
    proteinGrams: 0,
    carbGrams: 0,
    fatGrams: 0,
    proteinPercent: 0,
    carbPercent: 0,
    fatPercent: 0,
    mealsPerDay: 3
  });

  const [mealData, setMealData] = useState({
    weekNumber: 1,
    planName: "AI Generated Meal Plan",
    description: "Personalized 7-day meal plan",
    meals: sections.meals
  });

  const [workoutData, setWorkoutData] = useState({
    weekNumber: 1,
    planName: "AI Generated Workout Plan", 
    description: "Personalized weekly workout routine",
    exercises: sections.workout
  });

  const handleReviseSection = async (section: string, feedback: string) => {
    setIsRevising(true);
    try {
      const response = await fetch(`/api/revise-plan/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPlan: sections[section as keyof typeof sections],
          feedback,
          section
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSections(prev => ({
          ...prev,
          [section]: data.revisedPlan
        }));
        
        toast({
          title: "Plan Revised",
          description: `Your ${section} plan has been updated based on your feedback.`,
        });
      } else {
        throw new Error("Failed to revise plan");
      }
    } catch (error) {
      toast({
        title: "Revision Failed",
        description: "Unable to revise plan at this time.",
        variant: "destructive",
      });
    } finally {
      setIsRevising(false);
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/save-plan/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          macroData,
          mealData,
          workoutData
        })
      });

      if (response.ok) {
        toast({
          title: "Plan Saved",
          description: "Your personalized fitness plan has been saved successfully!",
        });
        onSave();
      } else {
        throw new Error("Failed to save plan");
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save plan at this time.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const RevisionInput = ({ section }: { section: string }) => {
    const [feedback, setFeedback] = useState("");
    
    return (
      <div className="space-y-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Label htmlFor={`feedback-${section}`}>Request Changes:</Label>
        <Input
          id={`feedback-${section}`}
          placeholder={`e.g., "make it lower carb" or "add more upper body exercises"`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => handleReviseSection(section, feedback)}
            disabled={!feedback.trim() || isRevising}
          >
            <RefreshCwIcon className="h-4 w-4 mr-1" />
            {isRevising ? "Revising..." : "Revise with AI"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setEditingSection(null)}
          >
            <XIcon className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Edit Your Personalized Plan</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Review and customize your AI-generated fitness plan
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <Tabs defaultValue="macro" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="macro">Macro Plan</TabsTrigger>
              <TabsTrigger value="meals">Meal Plan</TabsTrigger>
              <TabsTrigger value="workout">Workout Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="macro">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Daily Macro Breakdown</CardTitle>
                      <CardDescription>Your personalized nutrition targets</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(editingSection === "macro" ? null : "macro")}
                    >
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {sections.macro}
                  </div>
                  
                  {editingSection === "macro" && <RevisionInput section="macro" />}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Daily Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={macroData.dailyCalories}
                        onChange={(e) => setMacroData(prev => ({ ...prev, dailyCalories: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={macroData.proteinGrams}
                        onChange={(e) => setMacroData(prev => ({ ...prev, proteinGrams: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={macroData.carbGrams}
                        onChange={(e) => setMacroData(prev => ({ ...prev, carbGrams: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={macroData.fatGrams}
                        onChange={(e) => setMacroData(prev => ({ ...prev, fatGrams: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meals">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>7-Day Meal Plan</CardTitle>
                      <CardDescription>Your weekly meal schedule</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(editingSection === "meals" ? null : "meals")}
                    >
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {sections.meals}
                  </div>
                  
                  {editingSection === "meals" && <RevisionInput section="meals" />}

                  <div className="space-y-2">
                    <Label htmlFor="meal-name">Plan Name</Label>
                    <Input
                      id="meal-name"
                      value={mealData.planName}
                      onChange={(e) => setMealData(prev => ({ ...prev, planName: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workout">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Weekly Workout Plan</CardTitle>
                      <CardDescription>Your training schedule</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(editingSection === "workout" ? null : "workout")}
                    >
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {sections.workout}
                  </div>
                  
                  {editingSection === "workout" && <RevisionInput section="workout" />}

                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Plan Name</Label>
                    <Input
                      id="workout-name"
                      value={workoutData.planName}
                      onChange={(e) => setWorkoutData(prev => ({ ...prev, planName: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 border-t bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={isSaving}>
              <CheckIcon className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}