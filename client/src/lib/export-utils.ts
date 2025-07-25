import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportData {
  user: {
    username: string;
    email: string;
  };
  goal?: {
    goalType: string;
    currentWeight: number;
    targetWeight: number;
    timeline: string;
    activityLevel: string;
  };
  macros?: {
    dailyCalories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
  };
  progress: Array<{
    date: string;
    weight?: number;
    bodyFat?: number;
    mood?: string;
    energyLevel?: number;
    workoutCompleted?: boolean;
    caloriesConsumed?: number;
    proteinConsumed?: number;
  }>;
}

export function exportToPDF(data: ExportData) {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  
  // Header
  doc.setFontSize(20);
  doc.text('FitlyAI - Progress Report', 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated: ${currentDate}`, 20, 30);
  doc.text(`User: ${data.user.username} (${data.user.email})`, 20, 40);
  
  let yPosition = 60;
  
  // Goal Information
  if (data.goal) {
    doc.setFontSize(16);
    doc.text('Current Goal', 20, yPosition);
    yPosition += 10;
    
    doc.autoTable({
      startY: yPosition,
      head: [['Goal Type', 'Current Weight', 'Target Weight', 'Timeline', 'Activity Level']],
      body: [[
        data.goal.goalType.replace('_', ' ').toUpperCase(),
        `${data.goal.currentWeight} lbs`,
        `${data.goal.targetWeight} lbs`,
        data.goal.timeline,
        data.goal.activityLevel
      ]],
      margin: { left: 20 },
      styles: { fontSize: 10 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Macro Plan
  if (data.macros) {
    doc.setFontSize(16);
    doc.text('Nutrition Plan', 20, yPosition);
    yPosition += 10;
    
    doc.autoTable({
      startY: yPosition,
      head: [['Daily Calories', 'Protein', 'Carbs', 'Fat']],
      body: [[
        `${data.macros.dailyCalories} cal`,
        `${data.macros.proteinGrams}g`,
        `${data.macros.carbGrams}g`,
        `${data.macros.fatGrams}g`
      ]],
      margin: { left: 20 },
      styles: { fontSize: 10 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // Progress Data
  if (data.progress.length > 0) {
    doc.setFontSize(16);
    doc.text('Progress Tracking', 20, yPosition);
    yPosition += 10;
    
    const progressData = data.progress.map(entry => [
      entry.date,
      entry.weight ? `${entry.weight} lbs` : '-',
      entry.bodyFat ? `${entry.bodyFat}%` : '-',
      entry.energyLevel ? `${entry.energyLevel}/10` : '-',
      entry.workoutCompleted ? 'Yes' : 'No',
      entry.caloriesConsumed ? `${entry.caloriesConsumed} cal` : '-'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Date', 'Weight', 'Body Fat %', 'Energy', 'Workout', 'Calories']],
      body: progressData,
      margin: { left: 20 },
      styles: { fontSize: 9 }
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      'Generated by FitlyAI - Your Personal Fitness Companion',
      20,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Download
  const filename = `FitlyAI_Progress_${data.user.username}_${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}

export function exportToCSV(data: ExportData) {
  const csvData = data.progress.map(entry => ({
    Date: entry.date,
    Weight_lbs: entry.weight || '',
    BodyFat_percent: entry.bodyFat || '',
    Mood: entry.mood || '',
    Energy_Level: entry.energyLevel || '',
    Workout_Completed: entry.workoutCompleted ? 'Yes' : 'No',
    Calories_Consumed: entry.caloriesConsumed || '',
    Protein_Consumed: entry.proteinConsumed || ''
  }));
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `FitlyAI_Progress_${data.user.username}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportGoalsToCSV(goals: any[]) {
  const csvData = goals.map(goal => ({
    Goal_Type: goal.goalType.replace('_', ' ').toUpperCase(),
    Current_Weight: goal.currentWeight,
    Target_Weight: goal.targetWeight,
    Current_Body_Fat: goal.currentBodyFat || '',
    Target_Body_Fat: goal.targetBodyFat || '',
    Timeline: goal.timeline,
    Activity_Level: goal.activityLevel,
    Experience: goal.fitnessExperience,
    Status: goal.isActive ? 'Active' : 'Inactive',
    Created: new Date(goal.createdAt).toLocaleDateString()
  }));
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `FitlyAI_Goals_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}