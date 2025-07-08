import { users, chatMessages, userGoals, macroPlans, mealPlans, workoutPlans, progressTracking, type User, type InsertUser, type ChatMessage, type InsertChatMessage, type UserGoal, type InsertUserGoal, type MacroPlan, type InsertMacroPlan, type MealPlan, type InsertMealPlan, type WorkoutPlan, type InsertWorkoutPlan, type ProgressTracking, type InsertProgressTracking } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserSubscriptionStatus(userId: number, status: string): Promise<User>;
  updateUserSupabaseId(userId: number, supabaseId: string): Promise<User>;
  updateUserMessageCount(userId: number): Promise<User>;
  updateUserProfile(userId: number, updates: Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'email' | 'phone'>>): Promise<User>;
  blockUser(userId: number): Promise<User>;
  softDeleteUser(userId: number): Promise<User>;
  restoreUser(userId: number): Promise<User>;
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  flagMessage(messageId: number, moderationResult: any): Promise<ChatMessage>;
  
  // Fitness tracking methods
  getUserGoals(userId: number): Promise<UserGoal[]>;
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  updateUserGoal(goalId: number, updates: Partial<InsertUserGoal>): Promise<UserGoal>;
  deactivateUserGoal(goalId: number): Promise<UserGoal>;
  
  getMacroPlans(userId: number): Promise<MacroPlan[]>;
  createMacroPlan(plan: InsertMacroPlan): Promise<MacroPlan>;
  updateMacroPlan(planId: number, updates: Partial<InsertMacroPlan>): Promise<MacroPlan>;
  
  getMealPlans(userId: number): Promise<MealPlan[]>;
  createMealPlan(meal: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(mealId: number, updates: Partial<InsertMealPlan>): Promise<MealPlan>;
  
  getWorkoutPlans(userId: number): Promise<WorkoutPlan[]>;
  createWorkoutPlan(workout: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(workoutId: number, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan>;
  
  getProgressTracking(userId: number, goalId?: number): Promise<ProgressTracking[]>;
  createProgressEntry(progress: InsertProgressTracking): Promise<ProgressTracking>;
  getLatestProgress(userId: number, goalId: number): Promise<ProgressTracking | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.supabaseId, supabaseId));
    return user;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        subscriptionStatus: insertUser.subscriptionStatus || 'free',
        subscriptionTier: insertUser.subscriptionTier || 'free'
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscriptionStatus(userId: number, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ subscriptionStatus: status })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSupabaseId(userId: number, supabaseId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ supabaseId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserMessageCount(userId: number): Promise<User> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) throw new Error("User not found");
    
    const [user] = await db
      .update(users)
      .set({ 
        dailyMessageCount: (currentUser.dailyMessageCount || 0) + 1,
        lastMessageDate: new Date().toISOString().split('T')[0]
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: number, updates: Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'email' | 'phone'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async blockUser(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBlocked: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async softDeleteUser(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async restoreUser(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ deletedAt: null })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getChatMessages(userId: number, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async flagMessage(messageId: number, moderationResult: any): Promise<ChatMessage> {
    const [message] = await db
      .update(chatMessages)
      .set({ moderationResult })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return message;
  }

  async getUserGoals(userId: number): Promise<UserGoal[]> {
    return await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));
  }

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const [userGoal] = await db
      .insert(userGoals)
      .values(goal)
      .returning();
    return userGoal;
  }

  async updateUserGoal(goalId: number, updates: Partial<InsertUserGoal>): Promise<UserGoal> {
    const [userGoal] = await db
      .update(userGoals)
      .set(updates)
      .where(eq(userGoals.id, goalId))
      .returning();
    return userGoal;
  }

  async deactivateUserGoal(goalId: number): Promise<UserGoal> {
    const [userGoal] = await db
      .update(userGoals)
      .set({ isActive: false })
      .where(eq(userGoals.id, goalId))
      .returning();
    return userGoal;
  }

  async getMacroPlans(userId: number): Promise<MacroPlan[]> {
    return await db
      .select()
      .from(macroPlans)
      .where(eq(macroPlans.userId, userId))
      .orderBy(desc(macroPlans.createdAt));
  }

  async createMacroPlan(plan: InsertMacroPlan): Promise<MacroPlan> {
    const [macroPlan] = await db
      .insert(macroPlans)
      .values(plan)
      .returning();
    return macroPlan;
  }

  async updateMacroPlan(planId: number, updates: Partial<InsertMacroPlan>): Promise<MacroPlan> {
    const [macroPlan] = await db
      .update(macroPlans)
      .set(updates)
      .where(eq(macroPlans.id, planId))
      .returning();
    return macroPlan;
  }

  async getMealPlans(userId: number): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId))
      .orderBy(desc(mealPlans.createdAt));
  }

  async createMealPlan(meal: InsertMealPlan): Promise<MealPlan> {
    const [mealPlan] = await db
      .insert(mealPlans)
      .values(meal)
      .returning();
    return mealPlan;
  }

  async updateMealPlan(mealId: number, updates: Partial<InsertMealPlan>): Promise<MealPlan> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set(updates)
      .where(eq(mealPlans.id, mealId))
      .returning();
    return mealPlan;
  }

  async getWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, userId))
      .orderBy(desc(workoutPlans.createdAt));
  }

  async createWorkoutPlan(workout: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [workoutPlan] = await db
      .insert(workoutPlans)
      .values(workout)
      .returning();
    return workoutPlan;
  }

  async updateWorkoutPlan(workoutId: number, updates: Partial<InsertWorkoutPlan>): Promise<WorkoutPlan> {
    const [workoutPlan] = await db
      .update(workoutPlans)
      .set(updates)
      .where(eq(workoutPlans.id, workoutId))
      .returning();
    return workoutPlan;
  }

  async getProgressTracking(userId: number, goalId?: number): Promise<ProgressTracking[]> {
    if (goalId) {
      return await db
        .select()
        .from(progressTracking)
        .where(and(eq(progressTracking.userId, userId), eq(progressTracking.goalId, goalId)))
        .orderBy(desc(progressTracking.recordDate));
    } else {
      return await db
        .select()
        .from(progressTracking)
        .where(eq(progressTracking.userId, userId))
        .orderBy(desc(progressTracking.recordDate));
    }
  }

  async createProgressEntry(progress: InsertProgressTracking): Promise<ProgressTracking> {
    const [progressEntry] = await db
      .insert(progressTracking)
      .values(progress)
      .returning();
    return progressEntry;
  }

  async getLatestProgress(userId: number, goalId: number): Promise<ProgressTracking | undefined> {
    const [latest] = await db
      .select()
      .from(progressTracking)
      .where(and(eq(progressTracking.userId, userId), eq(progressTracking.goalId, goalId)))
      .orderBy(desc(progressTracking.recordDate))
      .limit(1);
    return latest;
  }
}

export const storage = new DatabaseStorage();