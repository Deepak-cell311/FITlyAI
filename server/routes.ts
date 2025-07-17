import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import OpenAI from "openai";
import { storage } from "./storage";
import { supabaseAdmin, verifySupabaseToken, createUserProfile, getUserProfile } from "./supabase";
import { emailService } from "./email";
// import { sendVerificationEmail } from "../utils/email"; // Replaced with emailService
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";
import { insertChatMessageSchema, insertUserGoalSchema, insertMacroPlanSchema, insertMealPlanSchema, insertWorkoutPlanSchema, insertProgressTrackingSchema, users } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize OpenAI (will work once API key is provided)
let openaiClient: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Safety constants - no message limits for premium experience
const SAFETY_PROMPTS = {
  SYSTEM: `
You are FITlyAI, a licensed virtual health and fitness coach.

IMPORTANT INSTRUCTIONS:
- Always provide comprehensive, detailed fitness advice
- Focus on evidence-based recommendations
- Be encouraging and motivational
- If asked about progress tracking, suggest the dashboard features
- For macro tracking questions, mention the macro tracking tools
- Always prioritize user safety and recommend consulting healthcare providers for medical concerns

Your expertise includes:
- Personalized workout plans
- Nutrition guidance and macro calculations
- Progress tracking strategies
- Motivation and goal setting
- Exercise form and technique
- Recovery and rest protocols

Always maintain a professional, encouraging tone while providing actionable fitness guidance.
`,
  MODERATION: `
Analyze this fitness-related message for any inappropriate content:
- Harmful medical advice
- Dangerous exercise recommendations
- Eating disorder triggers
- Inappropriate personal requests

Respond with either "SAFE" or "UNSAFE" followed by a brief reason if unsafe.
`
};

// Helper function to parse AI-generated plan responses
function parseAIPlanResponse(content: string) {
  const sections = {
    macro: '',
    meals: '',
    workout: '',
    full_content: content
  };

  // Try to split content into sections based on common patterns
  const macroMatch = content.match(/(macro|nutrition|calories?)([\s\S]*?)(?=meal|workout|$)/i);
  const mealMatch = content.match(/(meal|food|diet)([\s\S]*?)(?=workout|macro|$)/i);
  const workoutMatch = content.match(/(workout|exercise|training)([\s\S]*?)(?=meal|macro|$)/i);

  if (macroMatch) sections.macro = macroMatch[1].trim();
  if (mealMatch) sections.meals = mealMatch[1].trim();
  if (workoutMatch) sections.workout = workoutMatch[1].trim();

  return sections;
}

// Helper function to save plan sections to database
async function savePlanSections(userId: number, goalId: number, planSections: any) {
  const results = [];

  // Save macro plan if available
  if (planSections.macro) {
    const calories = extractCaloriesFromText(planSections.macro);
    const protein = extractProteinFromText(planSections.macro);
    const carbs = extractCarbsFromText(planSections.macro);
    const fats = extractFatsFromText(planSections.macro);

    if (calories > 0) {
      const macroPlan = await storage.createMacroPlan({
        userId,
        goalId,
        dailyCalories: calories,
        proteinGrams: protein,
        carbGrams: carbs,
        fatGrams: fats,
        proteinPercent: Math.round((protein * 4 / calories) * 100),
        carbPercent: Math.round((carbs * 4 / calories) * 100),
        fatPercent: Math.round((fats * 9 / calories) * 100),
        mealsPerDay: 3
      });
      results.push({ type: 'macro', data: macroPlan });
    }
  }

  return results;
}

// Helper functions to extract nutritional info from text
function extractCaloriesFromText(text: string): number {
  const match = text.match(/(\d+)\s*(?:calories|kcal|cal)/i);
  return match ? parseInt(match[1]) : 0;
}

function extractProteinFromText(text: string): number {
  const match = text.match(/(\d+)\s*(?:g|grams?)\s*(?:of\s+)?protein/i);
  return match ? parseInt(match[1]) : 0;
}

function extractCarbsFromText(text: string): number {
  const match = text.match(/(\d+)\s*(?:g|grams?)\s*(?:of\s+)?(?:carbs?|carbohydrates?)/i);
  return match ? parseInt(match[1]) : 0;
}

function extractFatsFromText(text: string): number {
  const match = text.match(/(\d+)\s*(?:g|grams?)\s*(?:of\s+)?(?:fats?|lipids?)/i);
  return match ? parseInt(match[1]) : 0;
}

// Intelligent fitness action detection and execution
async function detectAndExecuteFitnessActions(message: string, userId: number): Promise<string[]> {
  const actions = [];
  const lowerMessage = message.toLowerCase();

  // Weight tracking detection
  if (lowerMessage.includes('weigh') && /\d+/.test(message)) {
    const weightMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg|kilograms?)?/);
    if (weightMatch) {
      const weight = parseFloat(weightMatch[1]);
      const goals = await storage.getUserGoals(userId);
      if (goals.length > 0) {
        await storage.createProgressEntry({
          userId,
          goalId: goals[0].id,
          recordDate: new Date(),
          weight,
          bodyFat: null,
          mood: 'good',
          energyLevel: 7,
          workoutCompleted: false,
          caloriesConsumed: 0,
          proteinConsumed: 0
        });
        actions.push(`Logged weight: ${weight} lbs`);
      }
    }
  }

  // Macro tracking detection
  if (lowerMessage.includes('calories') || lowerMessage.includes('macro')) {
    const calories = extractCaloriesFromText(message);
    const protein = extractProteinFromText(message);
    const carbs = extractCarbsFromText(message);
    const fats = extractFatsFromText(message);

    if (calories > 0) {
      const goals = await storage.getUserGoals(userId);
      if (goals.length > 0) {
        await storage.createMacroPlan({
          userId,
          goalId: goals[0].id,
          dailyCalories: calories,
          proteinGrams: protein,
          carbGrams: carbs,
          fatGrams: fats,
          proteinPercent: Math.round((protein * 4 / calories) * 100),
          carbPercent: Math.round((carbs * 4 / calories) * 100),
          fatPercent: Math.round((fats * 9 / calories) * 100),
          mealsPerDay: 3
        });
        actions.push(`Created macro plan: ${calories} calories`);
      }
    }
  }

  // Meal planning detection
  if ((lowerMessage.includes('meal') || lowerMessage.includes('recipe')) && lowerMessage.includes('plan')) {
    const mealName = message.match(/(?:meal|recipe)\s+(?:for\s+)?([^.!?]+)/i)?.[1]?.trim();
    if (mealName) {
      await storage.createMealPlan({
        userId,
        macroId: 1, // Default macro plan
        mealType: 'dinner',
        mealName: mealName,
        ingredients: {},
        calories: extractCaloriesFromText(message) || 400,
        protein: extractProteinFromText(message) || 25,
        carbs: extractCarbsFromText(message) || 30,
        fats: extractFatsFromText(message) || 15,
        instructions: `Meal plan for ${mealName}`,
        prepTime: 30
      });
      actions.push(`Created meal plan: ${mealName}`);
    }
  }

  return actions;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create an API router to ensure proper route precedence
  const apiRouter = express.Router();
  app.use(express.json());

  // Stripe webhook endpoint - must come before express.json() middleware
  // app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  //   const sig = req.headers['stripe-signature'];
  //   let event: Stripe.Event;

  //   try {
  //     event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET!);
  //   } catch (err: any) {
  //     console.error('⚠️ Webhook signature verification failed.', err.message);
  //     return res.status(400).send(`Webhook Error: ${err.message}`);
  //   }

  //   // Handle event types
  //   switch (event.type) {
  //     case 'checkout.session.completed': {
  //       const session = event.data.object as Stripe.Checkout.Session;
  //       const userEmail = session.customer_email;
  //       const customerId = session.customer as string;

  //       // Update the user's subscription info in user_profiles table
  //       const { data: user, error } = await supabaseAdmin
  //         .from('user_profiles')
  //         .update({ 
  //           plan: session.metadata?.tier || 'premium'
  //         })
  //         .eq('id', session.metadata?.userId)
  //         .select();

  //       if (error) {
  //         console.error('❌ Supabase update error:', error.message);
  //         return res.status(500).send('Failed to update user subscription.');
  //       }

  //       // Send subscription confirmation email
  //       if (user && user[0] && session.customer_email) {
  //         try {
  //           const planName = session.metadata?.tier === 'pro' ? 'Pro' : 'Premium';
  //           const amount = session.metadata?.tier === 'pro' ? '19.99' : '14.99';
            
  //           await emailService.sendSubscriptionConfirmationEmail(
  //             session.customer_email, 
  //             user[0].first_name || 'User',
  //             planName,
  //             amount
  //           );
  //         } catch (emailError) {
  //           console.error('Failed to send subscription confirmation email:', emailError);
  //           // Don't fail webhook if email fails
  //         }
  //       }

  //       console.log('✅ User subscription updated for:', userEmail);
  //       break;
  //     }

  //     // Handle other events like cancellations, renewals, etc.
  //     default:
  //       console.log(`Unhandled event type ${event.type}`);
  //   }

  //   res.status(200).json({ received: true });
  // });


  // Signup endpoint using Resend verification flow
  
  apiRouter.post('/signup', async (req, res) => {
    try {
      const { supabaseId, email, username, first_name, last_name } = req.body;
      console.log("Signup request body:", req.body);
      
      // if (!supabaseId || !email || !username || !first_name || !last_name) {
      //   return res.status(400).json({ error: "All fields are required" });
      // }

      // if (!email || !username || !first_name || !last_name) {
      //   return res.status(400).json({ error: "All fields are required" });
      // }

      // Check if user already exists in PostgreSQL first
      const existingPostgresUser = await storage.getUserByEmail(email);
      if (existingPostgresUser) {
        return res.status(400).json({ error: 'User already exists. Please sign in instead.' });
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const userInsertData = {
        username: username,
        email,
        firstName: first_name,
        lastName: last_name,
        supabaseId: supabaseId,
        email_verification_token: verificationToken,
        email_verified: false,
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
        dailyMessageCount: 0,
        isBlocked: false
      };
      console.log('Attempting to insert user:', userInsertData);
      try {
        await db.insert(users).values(userInsertData);
      } catch (insertErr) {
        let errMsg = 'Unknown error';
        if (insertErr instanceof Error) {
          errMsg = insertErr.message;
        }
        console.error('User insert error:', insertErr);
        return res.status(500).json({ error: 'Failed to insert user in database', details: errMsg });
      }
      console.log("Saved token to DB for", email, ":", verificationToken);

      // Send verification email
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS}`
        : `${req.protocol}://${req.get("host")}`;

      const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;
      await emailService.sendVerificationEmail(email, verificationUrl);

      return res.status(200).json({ 
        message: 'Signup successful. Please check your email to verify your account.' 
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: "Internal server error during signup" });
    }
  });

  // Email verification endpoint
  apiRouter.post('/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      // Find user by verification token in PostgreSQL database
      const userList = await db.select()
        .from(users)
        .where(and(
          eq(users.email_verification_token, token),
          eq(users.email_verified, false)
        ))
        .limit(1);

      if (!userList.length) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      const foundUser = userList[0];

      // Update user to mark email as verified
      const result = await db.update(users)
        .set({ 
          email_verified: true,
          email_verification_token: null
        })
        .where(eq(users.email_verification_token, token))
        .returning();
      
      console.log("Verification updated:", result);

      // Update Supabase auth user if supabaseId exists, or try to find and link it
      let supabaseUserId = foundUser.supabaseId;
      
      if (!supabaseUserId) {
        // Try to find Supabase user by email and link it
        try {
          const { data: supabaseUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (!listError && supabaseUsers?.users) {
            const supabaseUser = supabaseUsers.users.find(user => user.email === foundUser.email);
            if (supabaseUser) {
              supabaseUserId = supabaseUser.id;
              // Link the accounts
              await db.update(users)
                .set({ supabaseId: supabaseUser.id })
                .where(eq(users.id, foundUser.id));
              console.log('Linked Supabase account:', supabaseUser.id, 'to user:', foundUser.id);
            }
          }
        } catch (linkError) {
          console.error('Failed to find/link Supabase user:', linkError);
        }
      }
      
      if (supabaseUserId) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(
            supabaseUserId,
            { email_confirm: true }
          );
          console.log('Updated Supabase email_confirm to true for user:', supabaseUserId);
        } catch (authError) {
          console.error('Failed to update Supabase auth:', authError);
          // Continue - don't fail the verification if auth update fails
        }
      } else {
        console.log('No Supabase user found to update for email:', foundUser.email);
      }

      res.status(200).json({ 
        message: "Email verified successfully",
        user: {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          emailVerified: true
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Password reset request endpoint
  apiRouter.post("/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!existingUser.length) {
        // For security, return success even if user doesn't exist
        return res.json({ message: "If an account with that email exists, a password reset email has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

      // Update DB with token and expiry
      await db
        .update(users)
        .set({
          passwordResetToken: token,
          passwordResetTokenExpiry: expiry,
        })
        .where(eq(users.email, email));

      const resetLink = `https://www.fitlyai.com/reset-password?token=${token}`;

      // Send password reset email using Resend
      try {
        await emailService.sendPasswordResetEmail(email, resetLink, existingUser[0].firstName || 'User');
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({ error: "Failed to send password reset email" });
      }

      return res.json({ message: "If an account with that email exists, a password reset email has been sent." });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Password reset endpoint
  apiRouter.post("/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Missing token or new password" });
      }

      // Find user by reset token
      const userList = await db.select()
        .from(users)
        .where(eq(users.passwordResetToken, token))
        .limit(1);

      if (!userList.length) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const user = userList[0];

      // Check if token has expired
      if (!user.passwordResetTokenExpiry || new Date(user.passwordResetTokenExpiry) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Update password in Supabase Auth if user has supabaseId
      if (user.supabaseId) {
        try {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseId, {
            password: newPassword,
          });

          if (error) {
            console.error('Supabase password update error:', error);
            return res.status(500).json({ error: "Failed to update password" });
          }
        } catch (authError) {
          console.error('Auth update error:', authError);
          return res.status(500).json({ error: "Failed to update password" });
        }
      }

      // Clear reset token and expiry
      await db
        .update(users)
        .set({
          passwordResetToken: null,
          passwordResetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      return res.json({ message: "Password successfully updated" });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Send verification email route
  apiRouter.post("/send-verification-email", async (req, res) => {
    const { email, userId, token } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ error: "Missing email or userId" });
    }

    // Use provided token or generate new crypto token
    const verificationToken = token || crypto.randomBytes(32).toString("hex");
    const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;

    try {
      // Update user in PostgreSQL database with verification token
      const userList = await db.select()
        .from(users)
        .where(eq(users.supabaseId, userId))
        .limit(1);

      if (!userList.length) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.update(users)
        .set({
          email_verification_token: verificationToken,
          email_verified: false,
        })
        .where(eq(users.supabaseId, userId));

      await emailService.sendVerificationEmail(email, verificationUrl);
      return res.status(200).json({ message: "Verification email sent" });
    } catch (err) {
      console.error("Error sending verification email:", err);
      return res.status(500).json({ error: "Failed to send verification email" });
    }
  });

  // Resend verification email by email address
  apiRouter.post("/resend-verification", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      // Find user by email in PostgreSQL database
      const userList = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!userList.length) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userList[0];

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : `${req.protocol}://${req.get('host')}`;
      const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;

      // Update user with new token
      await db.update(users)
        .set({
          email_verification_token: verificationToken,
          email_verified: false,
        })
        .where(eq(users.id, user.id));

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationUrl);
      return res.status(200).json({ message: "Verification email resent successfully" });
    } catch (err) {
      console.error("Error resending verification email:", err);
      return res.status(500).json({ error: "Failed to resend verification email" });
    }
  });

  apiRouter.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    if (typeof token !== "string") {
      return res.status(400).send("Invalid token.");
    }

    try {
      // Find user by verification token in PostgreSQL database
      const userList = await db.select()
        .from(users)
        .where(eq(users.email_verification_token, token))
        .limit(1);

      if (!userList.length) {
        return res.status(400).send("Invalid or expired verification token.");
      }

      const foundUser = userList[0];

      // Update user to mark email as verified and clear token
      const result = await db.update(users)
        .set({ 
          email_verified: true,
          email_verification_token: null
        })
        .where(eq(users.email_verification_token, token))
        .returning();
      
      console.log("GET Verification update result:", result);

      // Update Supabase auth user if supabaseId exists
      if (foundUser.supabaseId) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(
            foundUser.supabaseId,
            { email_confirm: true }
          );
        } catch (authError) {
          console.error('Failed to update Supabase auth:', authError);
          // Continue - don't fail the verification if auth update fails
        }
      }

      // Redirect to home page with verification success
      return res.redirect("https://www.fitlyai.com/?verified=1");
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).send("Could not verify email.");
    }
  });

  // Password reset endpoint
  apiRouter.post('/auth/reset-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists in user_profiles
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, first_name, email')
        .eq('email', email)
        .single();

      if (!userProfile) {
        // Don't reveal if user exists or not for security
        return res.status(200).json({ 
          message: "If an account with that email exists, you will receive a password reset link." 
        });
      }

      // Generate password reset link using Supabase
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${req.headers.origin || 'https://www.fitlyai.com'}/auth/reset-password`
        }
      });

      if (error) {
        console.error('Password reset link generation failed:', error);
        return res.status(500).json({ message: "Failed to generate reset link" });
      }

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(
          email,
          data.properties.action_link,
          userProfile.first_name
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      res.status(200).json({ 
        message: "If an account with that email exists, you will receive a password reset link." 
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Direct login endpoint
  apiRouter.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Get user profile from PostgreSQL database using Supabase ID
      const userList = await db.select()
        .from(users)
        .where(eq(users.supabaseId, authData.user.id))
        .limit(1);

      if (!userList.length) {
        return res.status(500).json({ error: "Failed to fetch user profile." });
      }

      const user = userList[0];

      if (!user.email_verified) {
        return res.status(403).json({ error: "Please verify your email before logging in." });
      }

      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          emailVerified: user.email_verified,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionTier: user.subscriptionTier
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Direct registration endpoint
  apiRouter.post('/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Create Supabase auth user
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      const userId = authUser.user?.id;
      if (!userId) {
        return res.status(400).json({ error: "Failed to create user account" });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create user in PostgreSQL database
      try {
        const newDbUser = await db.insert(users).values({
          username: username || email.split('@')[0],
          email: email,
          firstName: username || email.split('@')[0],
          lastName: '',
          supabaseId: authUser.user?.id,
          subscriptionTier: 'free',
          email_verification_token: verificationToken,
          email_verified: false,
          subscriptionStatus: 'inactive',
          dailyMessageCount: 0,
          isBlocked: false
        }).returning();
        
        console.log('Created user in PostgreSQL:', newDbUser[0]?.id, 'for email:', email);
      } catch (dbError) {
        console.error('Database user creation error:', dbError);
        return res.status(400).json({ error: "Failed to create user profile" });
      }

      // Send verification email
      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : `${req.protocol}://${req.get('host')}`;
      const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;
      try {
        await emailService.sendVerificationEmail(email, verificationUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      res.status(200).json({ 
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          email: authUser.user?.email || email,
          emailVerified: false
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Supabase authentication verification endpoint using service role key
  apiRouter.post('/auth/supabase-verify', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      // Verify token using service role key
      const supabaseUser = await verifySupabaseToken(token);
      
      if (!supabaseUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Find user by Supabase ID in PostgreSQL database
      let userList = await db.select()
        .from(users)
        .where(eq(users.supabaseId, supabaseUser.id))
        .limit(1);

      let profile = null;

      if (!userList.length) {
        // Fallback: try to find by email and link the account
        const email = supabaseUser.email;
        if (!email) {
          return res.status(400).json({ message: "No user found for this account" });
        }

        const emailUserList = await db.select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!emailUserList.length) {
          return res.status(404).json({ message: "User not found" });
        }

        profile = emailUserList[0];

        // Link the Supabase ID to existing user
        if (!profile.supabaseId) {
          try {
            await db.update(users)
              .set({ supabaseId: supabaseUser.id })
              .where(eq(users.email, email));
            
            profile.supabaseId = supabaseUser.id;
          } catch (updateError: any) {
            if (updateError.code !== '23505') {
              throw updateError;
            }
          }
        }
      } else {
        profile = userList[0];
      }

      // Check email verification status
      if (!profile || !profile.email_verified) {
        return res.status(403).json({ 
          verified: false,
          message: "Please verify your email before logging in." 
        });
      }

      res.json({ 
        verified: true,
        user: {
          id: profile.id,
          email: profile.email || '',
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          username: profile.username || '',
          subscriptionStatus: profile.subscriptionStatus || 'inactive',
          subscriptionTier: profile.subscriptionTier || 'free',
          emailVerified: profile.email_verified,
          messageCount: profile.dailyMessageCount || 0,
          maxMessages: profile.subscriptionTier === 'free' ? 10 : 999999
        }
      });
    } catch (error) {
      console.error('Supabase verification error:', error);
      res.status(500).json({ message: "Authentication verification failed" });
    }
  });

  // Debug endpoint for pro user testing
  apiRouter.get('/auth/debug-pro', async (req, res) => {
    try {
      // Get pro test user data directly
      const userList = await db.select()
        .from(users)
        .where(eq(users.email, 'pro.test@fitlyai.com'))
        .limit(1);

      if (!userList.length) {
        return res.json({ error: "Pro test user not found" });
      }

      const user = userList[0];
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionTier: user.subscriptionTier,
          emailVerified: user.email_verified
        },
        macroAccessCheck: {
          hasActiveStatus: user.subscriptionStatus === 'active',
          hasProTier: user.subscriptionTier === 'pro',
          canAccessMacros: user.subscriptionStatus === 'active' && user.subscriptionTier === 'pro'
        }
      });
    } catch (error: any) {
      return res.json({ error: error?.message || "Unknown error" });
    }
  });

  // Debug endpoint to check user authentication status
  apiRouter.get('/auth/debug-status', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.json({ authenticated: false, reason: "No authorization header" });
      }

      const token = authHeader.replace('Bearer ', '');
      const supabaseUser = await verifySupabaseToken(token);
      
      if (!supabaseUser) {
        return res.json({ authenticated: false, reason: "Invalid token" });
      }

      // Check PostgreSQL user
      const userList = await db.select()
        .from(users)
        .where(eq(users.supabaseId, supabaseUser.id))
        .limit(1);

      if (!userList.length) {
        return res.json({ 
          authenticated: false, 
          reason: "User not found in database",
          supabaseUser: { id: supabaseUser.id, email: supabaseUser.email }
        });
      }

      const profile = userList[0];

      return res.json({
        authenticated: true,
        supabaseUser: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          email_confirmed_at: supabaseUser.email_confirmed_at
        },
        postgresUser: {
          id: profile.id,
          email: profile.email,
          emailVerified: profile.email_verified,
          subscriptionTier: profile.subscriptionTier
        }
      });
    } catch (error: any) {
      return res.json({ authenticated: false, reason: "Error", error: error?.message || "Unknown error" });
    }
  });

  // Supabase user verification middleware
  async function verifySupabaseUser(req: any, res: any, next: any) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.replace('Bearer ', '');
      const user = await verifySupabaseToken(token);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Authentication failed" });
    }
  }

  // User management routes
  apiRouter.get("/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user: " + error.message });
    }
  });

  apiRouter.post("/user", async (req, res) => {
    try {
      const { username, email, supabaseId } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email required" });
      }

      // Check if user already exists
      let user = await storage.getUserBySupabaseId(supabaseId);
      if (user) {
        return res.json(user);
      }

      user = await storage.getUserByEmail(email);
      if (user) {
        // Update with Supabase ID if missing
        user = await storage.updateUserSupabaseId(user.id, supabaseId);
        return res.json(user);
      }

      // Create new user
      let uniqueUsername = username || email.split('@')[0];
      let counter = 1;
      
      while (await storage.getUserByUsername(uniqueUsername)) {
        uniqueUsername = `${username || email.split('@')[0]}_${counter}`;
        counter++;
      }
      
      user = await storage.createUser({
        username: uniqueUsername,
        email,
        supabaseId,
        subscriptionStatus: 'free',
        subscriptionTier: 'free'
      });
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });

  // Chat and AI routes
  apiRouter.get("/chat/messages/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching messages: " + error.message });
    }
  });

  apiRouter.post("/chat/message", async (req, res) => {
    try {
      const { userId, message, role = 'user' } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ message: "User ID and message are required" });
      }

      // Get user for subscription checking
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check message limits for free tier
      if (user.subscriptionTier === 'free') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMessages = await storage.getChatMessages(userId, 1000);
        const todayUserMessages = todayMessages.filter(m => 
          m.role === 'user' && 
          new Date(m.timestamp) >= today
        );

        if (todayUserMessages.length >= 10) {
          return res.status(429).json({ 
            message: "Daily message limit reached. Upgrade to Premium for unlimited messages.",
            limitReached: true 
          });
        }
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        role: 'user',
        content: message
      });

      // Detect and execute fitness actions
      const actions = await detectAndExecuteFitnessActions(message, userId);

      let aiResponse = "I'm here to help with your fitness journey! However, I need an OpenAI API key to provide personalized responses.";
      
      if (openaiClient) {
        try {
          // Get recent messages for context
          const recentMessages = await storage.getChatMessages(userId, 10);
          const contextMessages = recentMessages
            .reverse()
            .slice(-5)
            .map(m => ({ role: m.role, content: m.content }));

          const completion = await openaiClient.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              { role: "system", content: SAFETY_PROMPTS.SYSTEM },
              ...contextMessages as any,
              { role: "user", content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
          });

          aiResponse = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";

          // Add action summaries to response
          if (actions.length > 0) {
            aiResponse += "\n\n✅ Actions completed:\n" + actions.map(a => `• ${a}`).join('\n');
          }

        } catch (error) {
          console.error('OpenAI API error:', error);
          aiResponse = "I'm experiencing some technical difficulties. Please try again in a moment.";
        }
      }

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        role: 'assistant',
        content: aiResponse
      });

      // Update user message count
      await storage.updateUserMessageCount(userId);

      res.json({
        message: aiMessage
      });

    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ message: "Error processing message: " + error.message });
    }
  });

  // Fitness tracking routes
  apiRouter.get("/goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching goals: " + error.message });
    }
  });

  apiRouter.post("/goals", async (req, res) => {
    try {
      const goalData = insertUserGoalSchema.parse(req.body);
      const goal = await storage.createUserGoal(goalData);
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating goal: " + error.message });
    }
  });

  // Macro tracking routes
  apiRouter.get("/macros/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const macros = await storage.getMacroPlans(userId);
      res.json(macros);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching macros: " + error.message });
    }
  });

  apiRouter.post("/macros", async (req, res) => {
    try {
      const macroData = insertMacroPlanSchema.parse(req.body);
      const macro = await storage.createMacroPlan(macroData);
      res.json(macro);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating macro plan: " + error.message });
    }
  });

  // Progress tracking routes
  apiRouter.get("/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goalId = req.query.goalId ? parseInt(req.query.goalId as string) : undefined;
      const progress = await storage.getProgressTracking(userId, goalId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching progress: " + error.message });
    }
  });

  apiRouter.post("/progress", async (req, res) => {
    try {
      const progressData = insertProgressTrackingSchema.parse(req.body);
      const progress = await storage.createProgressEntry(progressData);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating progress entry: " + error.message });
    }
  });

  // Stripe checkout routes
  app.post('/create-checkout-session', async (req, res) => {
    try {
      const { email, price } = req.body;
      
      if (!email || !price) {
        return res.status(400).json({ message: "Missing required fields: email, price" });
      }

      let priceData;
      if (price === 'premium') {
        priceData = {
          currency: 'usd',
          product_data: {
            name: 'FitlyAI Premium',
            description: 'Unlimited AI messages + full dashboard access'
          },
          unit_amount: 1499, // $14.99
          recurring: {
            interval: 'month' as const
          }
        };
      } else if (price === 'pro') {
        priceData = {
          currency: 'usd',
          product_data: {
            name: 'FitlyAI Pro',
            description: 'Everything + full macro/calorie tracking'
          },
          unit_amount: 1999, // $19.99
          recurring: {
            interval: 'month' as const
          }
        };
      } else {
        return res.status(400).json({ message: "Invalid price tier. Must be 'premium' or 'pro'" });
      }

      // Get user ID from Supabase to include in metadata
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', req.body.userId)
        .single();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: priceData,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin || 'http://localhost:5000'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/`,
        customer_email: email,
        metadata: {
          userId: userProfile?.id || req.body.userId,
          email: email,
          tier: price
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // Stripe webhook for subscription management
  app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = parseInt(session.metadata?.userId || '0');
        const tier = session.metadata?.tier;
        
        if (userId && tier) {
          await storage.updateUserSubscriptionStatus(userId, 'active');
          // Update subscription tier based on price
          const user = await storage.getUser(userId);
          if (user && tier) {
            // Update user with new subscription info
            await storage.updateUserStripeInfo(userId, session.customer as string, session.subscription as string);
          }
        }
      }
      
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
        if (user) {
          await storage.updateUserSubscriptionStatus(user.id, 'cancelled');
        }
      }

      res.json({received: true});
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Mount the API router before static file serving
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}