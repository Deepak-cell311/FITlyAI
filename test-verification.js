import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUserProfile() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('first_name', 'Web')
      .eq('last_name', 'Frontend')
      .single();
      
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    console.log('User profile found:');
    console.log('ID:', data.id);
    console.log('Name:', data.first_name, data.last_name);
    console.log('Plan:', data.plan);
    console.log('Email verified:', data.email_verified);
    console.log('Verification token:', data.email_verification_token);
    
    return data.email_verification_token;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function testVerification() {
  const token = await checkUserProfile();
  
  if (token) {
    console.log('\nTesting verification endpoint...');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const result = await response.json();
      console.log('Verification response:', result);
      
      if (response.ok) {
        console.log('✓ Email verification successful!');
        
        // Check if user is now verified
        const verifiedUser = await checkUserProfile();
        if (verifiedUser) {
          console.log('✓ User verification status updated');
        }
      } else {
        console.log('✗ Email verification failed');
      }
    } catch (error) {
      console.error('Verification test error:', error);
    }
  }
}

testVerification();