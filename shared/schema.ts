import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, past_due, canceled
  subscriptionTier: text("subscription_tier").default("free"), // free, premium, pro - now enum constrained in DB
  supabaseId: text("supabase_id").unique(),
  dailyMessageCount: integer("daily_message_count").default(0),
  lastMessageDate: text("last_message_date"),
  isBlocked: boolean("is_blocked").default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  email_verification_token: text("email_verification_token"),
  email_verified: boolean("email_verified").default(false),
  passwordResetToken: text("password_reset_token"),
  passwordResetTokenExpiry: timestamp("password_reset_token_expiry"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  tokenCount: integer("token_count").default(0),
  flagged: boolean("flagged").default(false),
  moderationResult: jsonb("moderation_result"),
});

export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalType: text("goal_type").notNull(), // 'weight_loss', 'muscle_gain', 'strength', 'endurance'
  currentWeight: integer("current_weight"), // in lbs
  targetWeight: integer("target_weight"), // in lbs
  currentBodyFat: integer("current_body_fat"), // percentage
  targetBodyFat: integer("target_body_fat"), // percentage
  timeline: text("timeline"), // '3 months', '6 months', etc.
  activityLevel: text("activity_level"), // 'sedentary', 'light', 'moderate', 'active', 'very_active'
  fitnessExperience: text("fitness_experience"), // 'beginner', 'intermediate', 'advanced'
  preferences: jsonb("preferences"), // dietary restrictions, exercise preferences, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const macroPlans = pgTable("macro_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalId: integer("goal_id").notNull(),
  dailyCalories: integer("daily_calories").notNull(),
  proteinGrams: integer("protein_grams").notNull(),
  carbGrams: integer("carb_grams").notNull(),
  fatGrams: integer("fat_grams").notNull(),
  proteinPercent: integer("protein_percent").notNull(),
  carbPercent: integer("carb_percent").notNull(),
  fatPercent: integer("fat_percent").notNull(),
  mealsPerDay: integer("meals_per_day").default(3),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  macroId: integer("macro_id").notNull(),
  mealType: text("meal_type").notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  mealName: text("meal_name").notNull(),
  ingredients: jsonb("ingredients").notNull(), // array of {name, amount, unit}
  instructions: text("instructions"),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fats: integer("fats").notNull(),
  prepTime: integer("prep_time"), // minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalId: integer("goal_id").notNull(),
  planName: text("plan_name").notNull(),
  workoutType: text("workout_type").notNull(), // 'strength', 'cardio', 'flexibility', 'mixed'
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  daysPerWeek: integer("days_per_week").notNull(),
  sessionDuration: integer("session_duration").notNull(), // minutes
  exercises: jsonb("exercises").notNull(), // array of exercise objects
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progressTracking = pgTable("progress_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalId: integer("goal_id").notNull(),
  recordDate: timestamp("record_date").defaultNow().notNull(),
  weight: integer("weight"), // lbs
  bodyFat: integer("body_fat"), // percentage
  measurements: jsonb("measurements"), // chest, waist, hips, arms, etc.
  workoutCompleted: boolean("workout_completed").default(false),
  caloriesConsumed: integer("calories_consumed"),
  proteinConsumed: integer("protein_consumed"),
  notes: text("notes"),
  mood: text("mood"), // 'great', 'good', 'okay', 'tired', 'unmotivated'
  energyLevel: integer("energy_level"), // 1-10 scale
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  supabaseId: true,
  subscriptionStatus: true,
  subscriptionTier: true,
  firstName: true,
  lastName: true,
  email_verification_token: true,
  email_verified: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  role: true,
  content: true,
});

export const insertUserGoalSchema = createInsertSchema(userGoals).pick({
  userId: true,
  goalType: true,
  currentWeight: true,
  targetWeight: true,
  currentBodyFat: true,
  targetBodyFat: true,
  timeline: true,
  activityLevel: true,
  fitnessExperience: true,
  preferences: true,
});

export const insertMacroPlanSchema = createInsertSchema(macroPlans).pick({
  userId: true,
  goalId: true,
  dailyCalories: true,
  proteinGrams: true,
  carbGrams: true,
  fatGrams: true,
  proteinPercent: true,
  carbPercent: true,
  fatPercent: true,
  mealsPerDay: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).pick({
  userId: true,
  macroId: true,
  mealType: true,
  mealName: true,
  ingredients: true,
  instructions: true,
  calories: true,
  protein: true,
  carbs: true,
  fats: true,
  prepTime: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).pick({
  userId: true,
  goalId: true,
  planName: true,
  workoutType: true,
  difficulty: true,
  daysPerWeek: true,
  sessionDuration: true,
  exercises: true,
});

export const insertProgressTrackingSchema = createInsertSchema(progressTracking).pick({
  userId: true,
  goalId: true,
  recordDate: true,
  weight: true,
  bodyFat: true,
  measurements: true,
  workoutCompleted: true,
  caloriesConsumed: true,
  proteinConsumed: true,
  notes: true,
  mood: true,
  energyLevel: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type UserGoal = typeof userGoals.$inferSelect;
export type InsertMacroPlan = z.infer<typeof insertMacroPlanSchema>;
export type MacroPlan = typeof macroPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertProgressTracking = z.infer<typeof insertProgressTrackingSchema>;
export type ProgressTracking = typeof progressTracking.$inferSelect;
