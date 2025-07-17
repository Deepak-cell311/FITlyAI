-- Create users table to match Drizzle schema
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
    supabase_id TEXT UNIQUE,
    daily_message_count INTEGER DEFAULT 0,
    last_message_date TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email_verification_token TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    password_reset_token TEXT,
    password_reset_token_expiry TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    token_count INTEGER DEFAULT 0,
    flagged BOOLEAN DEFAULT FALSE,
    moderation_result JSONB
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'strength', 'endurance')),
    current_weight INTEGER,
    target_weight INTEGER,
    current_body_fat INTEGER,
    target_body_fat INTEGER,
    timeline TEXT,
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    fitness_experience TEXT CHECK (fitness_experience IN ('beginner', 'intermediate', 'advanced')),
    preferences JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create macro_plans table
CREATE TABLE IF NOT EXISTS macro_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id INTEGER NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
    daily_calories INTEGER NOT NULL,
    protein_grams INTEGER NOT NULL,
    carb_grams INTEGER NOT NULL,
    fat_grams INTEGER NOT NULL,
    protein_percent INTEGER NOT NULL,
    carb_percent INTEGER NOT NULL,
    fat_percent INTEGER NOT NULL,
    meals_per_day INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    macro_id INTEGER NOT NULL REFERENCES macro_plans(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    meal_name TEXT NOT NULL,
    ingredients JSONB NOT NULL,
    instructions TEXT,
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fats INTEGER NOT NULL,
    prep_time INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS workout_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id INTEGER NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'mixed')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    days_per_week INTEGER NOT NULL,
    session_duration INTEGER NOT NULL,
    exercises JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create progress_tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id INTEGER NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
    record_date TIMESTAMP DEFAULT NOW() NOT NULL,
    weight INTEGER,
    body_fat INTEGER,
    measurements JSONB,
    workout_completed BOOLEAN DEFAULT FALSE,
    calories_consumed INTEGER,
    protein_consumed INTEGER,
    notes TEXT,
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'tired', 'unmotivated')),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10)
);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_macro_plans_user_id ON macro_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_macro_plans_goal_id ON macro_plans(goal_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_macro_id ON meal_plans(macro_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_goal_id ON workout_plans(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_goal_id ON progress_tracking(goal_id); 