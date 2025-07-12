import { createClient } from '@supabase/supabase-js';
import "dotenv/config"
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupUserProfiles() {
  try {
    console.log('Creating user_profiles table...');
    
    // Create the user_profiles table
    const { error } = await supabase.rpc('exec_sql', {
      query: `
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
        DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
        CREATE POLICY "Users can view own profile" ON user_profiles
          FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;  
        CREATE POLICY "Users can update own profile" ON user_profiles
          FOR UPDATE USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
        CREATE POLICY "Service role can manage all profiles" ON user_profiles
          FOR ALL USING (true);
      `
    });

    if (error) {
      console.error('Error creating table:', error);
    } else {
      console.log('User profiles table created successfully!');
    }
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupUserProfiles();