import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://nythxdxvrgvrchfddnzk.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function verifySupabaseToken(token: string) {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function createUserProfile(userData: {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  plan?: string;
}) {
  try {
    // Insert user profile into user_profiles table
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userData.id,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        plan: userData.plan || 'free'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Profile creation error:', error)
      return { success: false, error: error.message }
    }
    
    return { 
      success: true, 
      data: {
        id: data.id,
        email: userData.email,
        first_name: data.first_name,
        last_name: data.last_name,
        plan: data.plan
      }
    }
  } catch (error) {
    console.error('Profile creation error:', error)
    return { success: false, error: 'Failed to create profile' }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Profile fetch error:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

export async function updateUserSubscription(userId: string, subscriptionData: {
  subscription_status?: string;
  subscription_tier?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Subscription update error:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Subscription update error:', error)
    return null
  }
}