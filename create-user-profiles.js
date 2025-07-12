import { createClient } from '@supabase/supabase-js';
import "dotenv/config"
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserProfilesTable() {
  try {
    console.log('Checking if user_profiles table exists...');
    
    // First, try to select from the table to see if it exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('user_profiles table already exists!');
      return;
    }

    console.log('Table does not exist, please create it manually in Supabase SQL Editor:');
    console.log(`
-- Run this SQL in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
  email_verification_token UUID,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
    `);

  } catch (error) {
    console.error('Error:', error);
  }
}

createUserProfilesTable();